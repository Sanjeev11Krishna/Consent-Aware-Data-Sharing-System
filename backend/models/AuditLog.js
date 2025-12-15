const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['REQUESTED', 'GRANTED', 'DECLINED', 'REVOKED', 'ACCESSED', 'EXPIRED', 'REGISTERED'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consent'
  },
  dataType: {
    type: String,
    enum: ['personal-info', 'location-data', 'browser-data']
  },
  purpose: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema)