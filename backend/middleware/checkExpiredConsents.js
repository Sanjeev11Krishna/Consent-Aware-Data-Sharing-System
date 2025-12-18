const Consent = require('../models/Consent');

const checkExpiredConsents = async (req, res, next) => {
  try {
    // Find all active consents that have expired
    const expiredConsents = await Consent.find({
      status: 'active',
      expiresAt: { $lt: new Date() }
    });

    // Update their status to 'expired'
    if (expiredConsents.length > 0) {
      const expiredIds = expiredConsents.map(consent => consent._id);
      await Consent.updateMany(
        { _id: { $in: expiredIds } },
        { 
          $set: { 
            status: 'expired',
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`Updated ${expiredConsents.length} consents to expired status`);
    }
    
    next();
  } catch (error) {
    console.error('Error checking expired consents:', error);
    // Continue with the request even if check fails
    next();
  }
};

module.exports = checkExpiredConsents;