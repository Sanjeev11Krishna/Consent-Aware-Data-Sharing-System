const express = require('express');
const {getUserAuditLogs, getAllAuditLogs} = require ('../controllers/auditController');
const auth = require('../middleware/auth');
const router = express.Router();
router.get('/my-logs', auth, getUserAuditLogs)
router.get('/all-logs', auth, getAllAuditLogs)

module.exports = router;