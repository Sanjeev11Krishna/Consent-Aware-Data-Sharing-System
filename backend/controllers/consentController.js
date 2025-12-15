const Consent = require('../models/Consent');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// Request consent (create pending consent)
const requestConsent = async (req, res) => {
  try {
    const { requesterEmail, dataTypes, purpose, duration, expirationDateTime } = req.body;
    
    // Find requester by email
    const requester = await User.findOne({ email: requesterEmail });
    if (!requester) {
      return res.status(404).json({ message: 'Requester not found' });
    }
    
    // Prevent users from requesting data from themselves
    if (requester._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request data from yourself' });
    }
    
    // Check if consent request already exists
    const existingRequest = await Consent.findOne({
      granter: requester._id,
      requester: req.user._id,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Pending consent request already exists for this user' });
    }
    
    // Calculate expiry date
    const requestedAt = new Date();
    let expiresAt = new Date(requestedAt);
    
    // Use specific datetime if provided, otherwise use duration
    if (expirationDateTime) {
      expiresAt = new Date(expirationDateTime);
    } else {
      switch (duration) {
        case '1-month':
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          break;
        case '6-months':
          expiresAt.setMonth(expiresAt.getMonth() + 6);
          break;
        case '1-year':
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          break;
        case '2-years':
          expiresAt.setFullYear(expiresAt.getFullYear() + 2);
          break;
        default:
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
    }
    
    // Create pending consent request (note: granter is the person being requested FROM)
    const consentRequest = await Consent.create({
      granter: requester._id, // The person being requested FROM
      requester: req.user._id, // The person making the request
      dataTypes,
      purpose,
      status: 'pending',
      expiresAt
    });
    
    // Log consent request
    await AuditLog.create({
      action: 'REQUESTED',
      userId: requester._id, // The person being requested FROM
      requesterId: req.user._id, // The person making the request
      consentId: consentRequest._id,
      dataType: dataTypes.join(', '),
      purpose,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json(consentRequest);
  } catch (error) {
    console.error('Error requesting consent:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get pending consent requests for user (as granter)
const getPendingConsentRequests = async (req, res) => {
  try {
    const requests = await Consent.find({ 
      granter: req.user._id,
      status: 'pending'
    })
    .populate('requester', 'name email')
    .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching consent requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// Accept consent request
const acceptConsentRequest = async (req, res) => {
  try {
    const { consentId } = req.params;
    const { locationData, browserData, visitedPages } = req.body;
    
    const consent = await Consent.findById(consentId);
    if (!consent) {
      return res.status(404).json({ message: 'Consent request not found' });
    }
    
    // Check if user is the granter (person being requested FROM)
    if (consent.granter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this consent request' });
    }
    
    // Check if consent is still pending
    if (consent.status !== 'pending') {
      return res.status(400).json({ message: 'Consent request is no longer pending' });
    }
    
    // Update consent status to active
    consent.status = 'active';
    consent.grantedAt = new Date();
    consent.updatedAt = Date.now();
    await consent.save();
    
    // If location data was provided, update user's location data
    if (locationData && consent.dataTypes.includes('location-data')) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: {
          'locationData.currentLocation.latitude': locationData.latitude,
          'locationData.currentLocation.longitude': locationData.longitude,
          'locationData.timestamp': locationData.timestamp
        }
      });
    }
    
    // If browser data was provided, update user's browser data and visited pages
    if (browserData && consent.dataTypes.includes('browser-data')) {
      const updateData = {
        'browserData.userAgent': browserData.userAgent,
        'browserData.language': browserData.language,
        'browserData.platform': browserData.platform,
        'browserData.cookiesEnabled': browserData.cookiesEnabled,
        'browserData.screenSize': browserData.screenSize,
        'browserData.timezone': browserData.timezone
      };
      
      // Add visited pages if provided
      if (visitedPages && Array.isArray(visitedPages)) {
        updateData['usageData.pagesVisited'] = visitedPages;
      }
      
      await User.findByIdAndUpdate(req.user._id, { $set: updateData });
    }
    
    // Log consent grant
    await AuditLog.create({
      action: 'GRANTED',
      userId: req.user._id,
      requesterId: consent.requester,
      consentId: consent._id,
      dataType: consent.dataTypes.join(', '),
      purpose: consent.purpose,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ message: 'Consent request accepted', consent });
  } catch (error) {
    console.error('Error accepting consent request:', error);
    res.status(500).json({ message: error.message });
  }
};

// Decline consent request
const declineConsentRequest = async (req, res) => {
  try {
    const { consentId } = req.params;
    
    const consent = await Consent.findById(consentId);
    if (!consent) {
      return res.status(404).json({ message: 'Consent request not found' });
    }
    
    // Check if user is the granter (person being requested FROM)
    if (consent.granter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to decline this consent request' });
    }
    
    // Check if consent is still pending
    if (consent.status !== 'pending') {
      return res.status(400).json({ message: 'Consent request is no longer pending' });
    }
    
    // Update consent status to declined
    consent.status = 'declined';
    consent.updatedAt = Date.now();
    await consent.save();
    
    // Log consent decline
    await AuditLog.create({
      action: 'DECLINED',
      userId: req.user._id,
      requesterId: consent.requester,
      consentId: consent._id,
      dataType: consent.dataTypes.join(', '),
      purpose: consent.purpose,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ message: 'Consent request declined' });
  } catch (error) {
    console.error('Error declining consent request:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's active consents (as requester - consents they've been granted)
const getUserConsents = async (req, res) => {
  try {
    const consents = await Consent.find({ 
      requester: req.user._id,
      status: 'active'
    })
    .populate('granter', 'name email')
    .sort({ createdAt: -1 });
    
    res.json(consents);
  } catch (error) {
    console.error('Error fetching user consents:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get consents granted by user (as granter - consents they've given to others)
const getGrantedConsents = async (req, res) => {
  try {
    const consents = await Consent.find({ 
      granter: req.user._id,
      status: 'active'
    })
    .populate('requester', 'name email')
    .sort({ createdAt: -1 });
    
    res.json(consents);
  } catch (error) {
    console.error('Error fetching granted consents:', error);
    res.status(500).json({ message: error.message });
  }
};

// Revoke consent (only the granter can revoke)
const revokeConsent = async (req, res) => {
  try {
    const { consentId } = req.params;
    
    const consent = await Consent.findById(consentId);
    if (!consent) {
      return res.status(404).json({ message: 'Consent not found' });
    }
    
    // Check if user is the granter (person who gave the consent)
    if (consent.granter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to revoke this consent' });
    }
    
    // Update consent status
    consent.status = 'revoked';
    consent.updatedAt = Date.now();
    await consent.save();
    
    // Log consent revocation
    await AuditLog.create({
      action: 'REVOKED',
      userId: req.user._id,
      requesterId: consent.requester,
      consentId: consent._id,
      dataType: consent.dataTypes.join(', '),
      purpose: consent.purpose,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ message: 'Consent revoked successfully' });
  } catch (error) {
    console.error('Error revoking consent:', error);
    res.status(500).json({ message: error.message });
  }
};

// Request data access (only if user has been granted consent)
const requestDataAccess = async (req, res) => {
  try {
    const { granterId, dataType } = req.body;
    
    console.log('Data access request:', { granterId, dataType, userId: req.user._id });
    
    // Check if consent exists and is active
    const consent = await Consent.findOne({
      granter: granterId,
      requester: req.user._id,
      status: 'active',
      dataTypes: dataType,
      expiresAt: { $gt: Date.now() }
    }).populate('granter', 'name email');
    
    if (!consent) {
      console.log('No valid consent found');
      return res.status(403).json({ message: 'No active consent for this data access' });
    }
    
    // Get granter's data (filtered based on consent)
    const granter = await User.findById(granterId);
    if (!granter) {
      console.log('Granter not found');
      return res.status(404).json({ message: 'Data owner not found' });
    }
    
    console.log('Granter data:', granter);
    
    // Filter data based on consented data type
    let data = {};
    switch (dataType) {
      case 'personal-info':
        data = {
          firstName: granter.personalInfo?.firstName || null,
          lastName: granter.personalInfo?.lastName || null,
          dateOfBirth: granter.personalInfo?.dateOfBirth || null,
          address: granter.personalInfo?.address || null,
          phoneNumber: granter.personalInfo?.phoneNumber || null
        };
        break;
      case 'location-data':
        data = {
          currentLocation: granter.locationData?.currentLocation || null,
          homeAddress: granter.locationData?.homeAddress || null,
          timestamp: granter.locationData?.timestamp || null
        };
        break;
      case 'browser-data':
        data = {
          userAgent: granter.browserData?.userAgent || null,
          language: granter.browserData?.language || null,
          platform: granter.browserData?.platform || null,
          cookiesEnabled: granter.browserData?.cookiesEnabled || null,
          screenSize: granter.browserData?.screenSize || null,
          timezone: granter.browserData?.timezone || null,
          recentWebsites: granter.usageData?.pagesVisited || []
        };
        break;
      default:
        return res.status(400).json({ message: 'Invalid data type' });
    }
    
    console.log('Filtered data:', data);
    
    // Log data access
    await AuditLog.create({
      action: 'ACCESSED',
      userId: granterId,
      requesterId: req.user._id,
      consentId: consent._id,
      dataType,
      purpose: consent.purpose,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      message: 'Data access granted',
      data,
      consentId: consent._id
    });
  } catch (error) {
    console.error('Error accessing data:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestConsent,
  getPendingConsentRequests,
  acceptConsentRequest,
  declineConsentRequest,
  getUserConsents,
  getGrantedConsents,
  revokeConsent,
  requestDataAccess
};