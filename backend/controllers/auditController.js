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
    
    // Enhance logs with expiration information when available
    const enhancedLogs = logs.map(log => {
      if (log.consentId && log.consentId.expiresAt) {
        return {
          ...log.toObject(),
          consentExpiration: log.consentId.expiresAt
        };
      }
      return log.toObject();
    });
    
    // Get consent statistics including expired consents
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
    
    // Count expired consents
    const expiredConsentsAsRequester = await Consent.countDocuments({
      requester: req.user._id,
      status: 'expired'
    });
    
    const expiredConsentsAsGranter = await Consent.countDocuments({
      granter: req.user._id,
      status: 'expired'
    });
    
    res.json({
      logs: enhancedLogs,
      consentStats: {
        activeConsentsAsRequester,
        revokedConsentsAsRequester,
        activeConsentsAsGranter,
        revokedConsentsAsGranter,
        expiredConsentsAsRequester,
        expiredConsentsAsGranter
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
    
    // Enhance logs with expiration information when available
    const enhancedLogs = logs.map(log => {
      if (log.consentId && log.consentId.expiresAt) {
        return {
          ...log.toObject(),
          consentExpiration: log.consentId.expiresAt
        };
      }
      return log.toObject();
    });
    
    res.json(enhancedLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserAuditLogs,
  getAllAuditLogs
};