import express from 'express';
import { ObjectId } from 'mongodb';
import connectDB from '../db/connection.js';

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
    res.status(500).json({ ok: false, error: err.message });
  }
};

// GET all group requests
router.get('/requests', async (req, res) => {
  try {
    const db = await connectDB();
    const requests = await db.collection('group_requests')
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ ok: true, data: requests });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// POST create group request
router.post('/requests', requireAuth, async (req, res) => {
  try {
    const { 
      description, 
      email, 
      phone, 
      major, 
      desired_groupmates, 
      gpa, 
      dse_score 
    } = req.body;
    
    if (!major) {
      return res.status(400).json({ ok: false, error: 'Major is required' });
    }
    
    const db = await connectDB();
    
    // Check if user already has an active request
    const existingRequest = await db.collection('group_requests').findOne({ 
      sid: req.user.sid,
      status: 'active'
    });
    
    if (existingRequest) {
      return res.status(409).json({ 
        ok: false, 
        error: 'You already have an active group request' 
      });
    }
    
    // Create group request
    const request = {
      sid: req.user.sid,
      description: description || '',
      email: email || req.user.email,
      phone: phone || req.user.phone || '',
      major: major.trim(),
      desired_groupmates: desired_groupmates || '',
      gpa: gpa ? parseFloat(gpa) : null,
      dse_score: dse_score || '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('group_requests').insertOne(request);
    
    res.json({ 
      ok: true, 
      data: { _id: result.insertedId, ...request },
      message: 'Group request created' 
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// DELETE group request
router.delete('/requests/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
    
    const result = await db.collection('group_requests').deleteOne({ 
      _id: new ObjectId(id),
      sid: req.user.sid
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Request not found or not authorized' 
      });
    }
    
    res.json({ ok: true, message: 'Group request deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

export default router;
