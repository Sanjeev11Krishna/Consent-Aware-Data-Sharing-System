const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
    granter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dataTypes: [{
      type: String,
      enum: ['personal-info', 'location-data', 'browser-data'],
      required: true  
    }],
    purpose: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'revoked', 'expired', 'declined'],
        default: 'pending'
    },
    grantedAt: {
        type: Date,
    },
    expiresAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

consentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Consent', consentSchema);