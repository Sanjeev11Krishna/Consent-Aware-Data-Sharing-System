const AuditLog = require('../models/AuditLog');
const Consent = require('../models/Consent');

// Get user's audit logs with consent statistics
const getUserAuditLogs = async (req, res) => {
  try {
    // Get audit logs
    const logs = await AuditLog.find({
      $or: [
        { userId: req.user._id },
        { requesterId: req.user._id }
      ]
    })
    .populate('userId', 'name email')
    .populate('requesterId', 'name email')
    .populate('consentId')
    .sort({ timestamp: -1 })
    .limit(100);
    
    // Get consent statistics
    const activeConsentsAsRequester = await Consent.countDocuments({
      requester: req.user._id,
      status: 'active'
    });
    
    const revokedConsentsAsRequester = await Consent.countDocuments({
      requester: req.user._id,
      status: 'revoked'
    });
    
    const activeConsentsAsGranter = await Consent.countDocuments({
      granter: req.user._id,
      status: 'active'
    });
    
    const revokedConsentsAsGranter = await Consent.countDocuments({
      granter: req.user._id,
      status: 'revoked'
    });
    
    res.json({
      logs,
      consentStats: {
        activeConsentsAsRequester,
        revokedConsentsAsRequester,
        activeConsentsAsGranter,
        revokedConsentsAsGranter
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get system-wide audit logs (admin only)
const getAllAuditLogs = async (req, res) => {
  try {
    // In a real app, you would check if user is admin
    const logs = await AuditLog.find()
      .populate('userId', 'name email')
      .populate('requesterId', 'name email')
      .populate('consentId')
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserAuditLogs,
  getAllAuditLogs
};