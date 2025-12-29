import express from 'express';
import connectDB from '../db/connection.js';
import { uploadToGridFS, streamFileFromGridFS } from '../db/gridfs.js';

const router = express.Router();

// Middleware to check authentication
const requireAuth = async (req, res, next) => {
  try {
    const sid = req.headers['x-sid'];
    if (!sid) {
      return res.status(401).json({ ok: false, error: 'Authentication required' });
    }

    const db = await connectDB();
    const user = await db.collection('users').findOne({ sid });
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Authentication failed' });
  }
};

// GET profile photo
router.get('/profile-photo/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Get file from GridFS
    const fileBuffer = await downloadFromGridFS(fileId);
    
    // Set headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(fileBuffer);
  } catch (err) {
    res.status(404).send('Profile photo not found');
  }
});

// GET user's profile photo by SID
router.get('/profile-photo/user/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const db = await connectDB();
    
    const user = await db.collection('users').findOne({ sid });
    
    if (!user || !user.photoFileId) {
      return res.status(404).json({ ok: false, error: 'Profile photo not found' });
    }
    
    res.redirect(`/api/upload/profile-photo/${user.photoFileId}`);
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to get profile photo' });
  }
});

// Helper function to download from GridFS
async function downloadFromGridFS(fileId) {
  const { downloadFromGridFS: download } = await import('../db/gridfs.js');
  return download(fileId);
}

export default router;
