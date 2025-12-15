const AuditLog = require('../models/AuditLog');
const Consent = require('../models/Consent');

const getUserAuditLogs = async (req, res) => {
    try{
        const logs = await AuditLog.find({
            $or: [
                {userId: req.user.id},
                {requesterId: req.user.id}

            ]
        })
        .populate('userId', 'name email')
        .populate('requesterId', 'name email')
        .populate('consentId')
        .sort({timestamp: -1})
        .limit(100);

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
    }catch(error){
        res.status(500).json({message: error.message})
    }
};

const getAllAuditLogs = async (req, res) => {
    try{
        const logs = await AuditLog.find()
            .populate('userId', 'name email')
            .populate('requesterId', 'name email')
            .populate('consentId')
            .sort({timestamp: -1})
            .limit(100);
        res.json(logs)
    }catch(error){
        res.status(500).json({message: error.message})
    }   
};

module.exports = {
    getUserAuditLogs,
    getAllAuditLogs
};