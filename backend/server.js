import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserModel, AssetModel, AssetLogModel } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MINIMOTH_API_KEY = process.env.MINIMOTH_API_KEY;

if (!MINIMOTH_API_KEY) {
  console.warn('⚠️ Warning: MINIMOTH_API_KEY is not set in backend/.env');
}

// Simple Middleware
app.use(cors());
app.use(express.json());

// Helper to normalize phone numbers
function formatPhone(phone = '') {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (!cleaned.startsWith('+')) {
    // Default to +91 if 10 digits provided
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}

// ====================================================
// ENDPOINT 1: POST /api/auth/send-otp
// Sends OTP to user's phone via Minimoth API
// ====================================================
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    const formattedPhone = formatPhone(phone);
    if (formattedPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid phone number.' });
    }

    if (!MINIMOTH_API_KEY) {
      return res.status(500).json({ success: false, error: 'Backend MINIMOTH_API_KEY is missing.' });
    }

    // Call MiniMoth REST API
    const response = await fetch('https://api.minimoth.dev/v1/otp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MINIMOTH_API_KEY
      },
      body: JSON.stringify({ phone: formattedPhone })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error || data.message || 'Failed to send OTP via Minimoth';
      return res.status(response.status).json({ success: false, error: errMsg, details: data });
    }

    return res.json({
      success: true,
      message: 'OTP sent successfully to ' + formattedPhone,
      otp_id: data.otp_id,
      phone: formattedPhone
    });
  } catch (err) {
    console.error('Error in send-otp:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while sending OTP.' });
  }
});

// ====================================================
// ENDPOINT 2: POST /api/auth/verify-otp
// Verifies OTP with Minimoth API and logs in/registers user
// ====================================================
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, code, name } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'Phone and OTP code are required.' });
    }

    const formattedPhone = formatPhone(phone);

    if (!MINIMOTH_API_KEY) {
      return res.status(500).json({ success: false, error: 'Backend MINIMOTH_API_KEY is missing.' });
    }

    // Call MiniMoth REST API to verify
    const response = await fetch('https://api.minimoth.dev/v1/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MINIMOTH_API_KEY
      },
      body: JSON.stringify({
        phone: formattedPhone,
        code: String(code).trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error || data.message || 'Invalid or expired OTP.';
      return res.status(response.status).json({ success: false, error: errMsg, details: data });
    }

    // OTP verified successfully! Find or register user
    let user = UserModel.findByPhone(formattedPhone);
    let isNewUser = false;

    if (!user) {
      user = UserModel.create({
        phone: formattedPhone,
        name: (name && name.trim()) || 'Staff Member',
        role: 'Staff'
      });
      isNewUser = true;
    } else if (name && name.trim() && user.name === 'Staff Member') {
      user.name = name.trim();
    }

    // Generate a simple workshop session token
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return res.json({
      success: true,
      message: isNewUser ? 'User registered and authenticated' : 'Authentication successful',
      user,
      token
    });
  } catch (err) {
    console.error('Error in verify-otp:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while verifying OTP.' });
  }
});

// ====================================================
// ENDPOINT 3: GET /api/assets
// Fetches assets with optional search and status filtering
// ====================================================
app.get('/api/assets', (req, res) => {
  try {
    const { status, search } = req.query;
    const assets = AssetModel.findAll({ status, search });
    return res.json({
      success: true,
      count: assets.length,
      assets
    });
  } catch (err) {
    console.error('Error fetching assets:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve assets.' });
  }
});

// ====================================================
// ENDPOINT 4: POST /api/assets
// Adds a new office asset and logs the creation event
// ====================================================
app.post('/api/assets', (req, res) => {
  try {
    const { name, category, serialNumber, location, assignedTo, createdBy } = req.body;

    // Basic Input Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Asset name is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, error: 'Asset category is required.' });
    }
    if (!serialNumber || !serialNumber.trim()) {
      return res.status(400).json({ success: false, error: 'Serial number is required.' });
    }

    // Check for duplicate serial number
    const existing = AssetModel.findBySerial(serialNumber.trim());
    if (existing) {
      return res.status(409).json({ success: false, error: 'Asset with this serial number already exists.' });
    }

    // Create asset
    const asset = AssetModel.create({
      name,
      category,
      serialNumber,
      location: location || 'Main Office',
      assignedTo: assignedTo || ''
    });

    // Record initial log
    AssetLogModel.create({
      assetId: asset.id,
      action: 'CREATED',
      details: asset.assignedTo ? `Registered and assigned to ${asset.assignedTo}` : 'Registered into office inventory',
      performedBy: createdBy || 'User'
    });

    return res.status(201).json({
      success: true,
      message: 'Asset added successfully',
      asset
    });
  } catch (err) {
    console.error('Error adding asset:', err);
    return res.status(500).json({ success: false, error: 'Failed to add asset.' });
  }
});

// ====================================================
// ENDPOINT 5: PATCH /api/assets/:id/status
// Updates asset status/assignment and logs the change
// ====================================================
app.patch('/api/assets/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, note, updatedBy } = req.body;

    const validStatuses = ['Available', 'Assigned', 'Maintenance', 'Retired'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const currentAsset = AssetModel.findById(id);
    if (!currentAsset) {
      return res.status(404).json({ success: false, error: 'Asset not found.' });
    }

    let finalAssignedTo = currentAsset.assignedTo;
    if (status === 'Available') {
      finalAssignedTo = '';
    } else if (assignedTo !== undefined) {
      finalAssignedTo = assignedTo.trim();
    }

    const updated = AssetModel.updateStatus(id, {
      status: status || currentAsset.status,
      assignedTo: finalAssignedTo
    });

    // Create audit log
    const actionDesc = status && status !== currentAsset.status
      ? `Status changed from ${currentAsset.status} to ${status}`
      : `Assignment updated: ${finalAssignedTo || 'Unassigned'}`;

    AssetLogModel.create({
      assetId: id,
      action: 'STATUS_CHANGED',
      details: note ? `${actionDesc} (${note})` : actionDesc,
      performedBy: updatedBy || 'Staff'
    });

    return res.json({
      success: true,
      message: 'Asset updated successfully',
      asset: updated
    });
  } catch (err) {
    console.error('Error updating asset status:', err);
    return res.status(500).json({ success: false, error: 'Failed to update asset status.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Office Asset Tracker Backend running on http://localhost:${PORT}`);
  console.log(`📡 MiniMoth API Key loaded: ${MINIMOTH_API_KEY ? 'Yes (configured)' : 'No'}`);
});
