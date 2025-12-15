const express = require('express');
const {
    requestConsent,
    getPendingConsentRequests,
    acceptConsentRequest,
    declineConsentRequest,
    getUserConsents,
    getGrantedConsents,
    revokeConsent,
    requestDataAccess
} = require('../controllers/consentController')
const auth = require('../middlerware/auth');
const router = express.Router();
router.post('/request', auth, requestConsent);
router.get('/pending-requests', auth, getPendingConsentRequests);
router.put('/accept/:consentId', auth, acceptConsentRequest);
router.put('/decline/:consentId', auth, declineConsentRequest);
router.get('/my-consents', auth, getUserConsents);
router.get('/granted-consents', auth, getGrantedConsents);
router.put('/revoke/:consentId', auth, revokeConsent);
router.post('/request-data', auth, requestDataAccess);

module.exports = router;