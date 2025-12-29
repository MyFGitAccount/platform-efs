import express from 'express';
import crypto from 'crypto';
import connectDB from '../db/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Generate user token
const generateUserToken = () => {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  let token = '';
  for (const num of array) {
    token += num.toString(36);
  }
  return token;
};

// Middleware to check admin access
const requireAdmin = async (req, res, next) => {
  try {
    const sid = req.headers['x-sid'];
    if (!sid) {
      return res.status(401).json({ ok: false, error: 'Authentication required' });
    }

    const db = await connectDB();
    const user = await db.collection('users').findOne({ sid });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// GET pending accounts
router.get('/pending/accounts', async (req, res) => {
  try {
    const db = await connectDB();
    const pendingAccounts = await db.collection('pending_accounts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ ok: true, data: pendingAccounts });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// POST approve account
router.post('/pending/accounts/:sid/approve', async (req, res) => {
  try {
    const { sid } = req.params;
    const db = await connectDB();
    
    const pendingAccount = await db.collection('pending_accounts').findOne({ sid });
    if (!pendingAccount) {
      return res.status(404).json({ ok: false, error: 'Pending account not found' });
    }
    
    // Generate token
    const token = generateUserToken();
    const fullToken = `${sid}-${token}`;
    
    // Create user account
    const user = {
      sid: pendingAccount.sid,
      email: pendingAccount.email,
      password: pendingAccount.password,
      photoFileId: pendingAccount.photoFileId,
      role: 'user',
      token: fullToken,
      credits: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      gpa: null,
      dse_score: null,
      phone: null,
      major: null,
      skills: [],
      courses: [],
      year_of_study: 1,
      about_me: '',
    };
    
    await db.collection('users').insertOne(user);
    await db.collection('pending_accounts').deleteOne({ sid });
    
    res.json({ 
      ok: true, 
      message: 'Account approved successfully',
      data: user 
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// POST reject account
router.post('/pending/accounts/:sid/reject', async (req, res) => {
  try {
    const { sid } = req.params;
    const db = await connectDB();
    
    await db.collection('pending_accounts').deleteOne({ sid });
    
    res.json({ ok: true, message: 'Account rejected' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// GET pending courses
router.get('/pending/courses', async (req, res) => {
  try {
    const db = await connectDB();
    const pendingCourses = await db.collection('pending_courses')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ ok: true, data: pendingCourses });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// GET all users
router.get('/users', async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ ok: true, data: users });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// DELETE user
router.delete('/users/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const db = await connectDB();
    
    if (sid === req.user.sid) {
      return res.status(400).json({ ok: false, error: 'Cannot delete your own account' });
    }
    
    await db.collection('users').deleteOne({ sid });
    
    res.json({ ok: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// GET platform statistics
router.get('/stats', async (req, res) => {
  try {
    const db = await connectDB();
    
    const [
      totalUsers,
      totalCourses,
      pendingAccounts,
      pendingCourses,
      totalMaterials
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('courses').countDocuments(),
      db.collection('pending_accounts').countDocuments(),
      db.collection('pending_courses').countDocuments(),
      db.collection('materials').countDocuments()
    ]);
    
    res.json({
      ok: true,
      data: {
        totalUsers,
        totalCourses,
        pendingAccounts,
        pendingCourses,
        totalMaterials
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

export default router;
