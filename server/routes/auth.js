import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import connectDB from '../db/connection.js';
import { uploadToGridFS } from '../db/gridfs.js';

const router = express.Router();

// Generate secure token
const generateUserToken = () => {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  let token = '';
  for (const num of array) {
    token += num.toString(36);
  }
  return token;
};

// Register endpoint with Base64 photo
router.post('/register', async (req, res) => {
  try {
    const { sid, email, password, photoData, fileName = 'student_card.jpg' } = req.body;
    
    if (!sid || !email || !password || !photoData) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const db = await connectDB();

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ 
      $or: [{ sid }, { email: email.toLowerCase() }] 
    });
    
    const pendingUser = await db.collection('pending_accounts').findOne({ 
      $or: [{ sid }, { email: email.toLowerCase() }] 
    });

    if (existingUser || pendingUser) {
      return res.status(409).json({ 
        ok: false, 
        error: 'User already exists or pending approval' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Convert Base64 to buffer and upload to GridFS
    let photoFileId;
    try {
      const base64Data = photoData.includes('base64,') 
        ? photoData.split(',')[1] 
        : photoData;
      const fileBuffer = Buffer.from(base64Data, 'base64');
      
      const gridFSResult = await uploadToGridFS(fileBuffer, fileName, {
        originalName: fileName,
        mimetype: 'image/jpeg',
        size: fileBuffer.length,
        uploadedBy: sid,
        uploadedAt: new Date(),
        type: 'student_card',
        status: 'pending_approval'
      });
      
      photoFileId = gridFSResult.fileId;
    } catch (gridfsErr) {
      console.error('GridFS upload error:', gridfsErr);
      return res.status(500).json({ ok: false, error: 'Failed to process photo' });
    }

    // Create pending account with GridFS file ID
    const pendingAccount = {
      sid,
      email: email.toLowerCase(),
      password: hashedPassword,
      photoFileId,
      createdAt: new Date(),
    };

    await db.collection('pending_accounts').insertOne(pendingAccount);

    // Send admin notification (simplified for Vercel)
    console.log(`New account request from ${sid} (${email})`);

    res.json({ 
      ok: true, 
      message: 'Account request submitted. Awaiting admin approval.' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Other endpoints remain similar...
export default router;
