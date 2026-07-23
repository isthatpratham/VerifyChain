const verificationService = require('../services/verification.service');
const { msmeProfileRepository } = require('../repositories');
const { NotFoundError } = require('../utils/dbErrors');

const handleVerifyGstin = async (req, res, next) => {
  try {
    const { gstin } = req.body;
    const result = verificationService.validateGstin(gstin);
    if (!result.isValid) {
      return res.status(400).json({ error: result.message });
    }
    return res.status(200).json({
      status: 'VERIFIED',
      authority: 'GST',
      details: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const handleVerifyPan = async (req, res, next) => {
  try {
    const { pan } = req.body;
    const result = verificationService.validatePan(pan);
    if (!result.isValid) {
      return res.status(400).json({ error: result.message });
    }
    return res.status(200).json({
      status: 'VERIFIED',
      authority: 'PAN',
      details: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const handleVerifyUdyam = async (req, res, next) => {
  try {
    const { udyamNumber } = req.body;
    const result = verificationService.validateUdyam(udyamNumber);
    if (!result.isValid) {
      return res.status(400).json({ error: result.message });
    }
    return res.status(200).json({
      status: 'VERIFIED',
      authority: 'UDYAM',
      details: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetBusinessVerificationStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await msmeProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('MSME profile not found');
    }

    const verificationResult = verificationService.verifyAll(profile.gstin, profile.udyam_number);
    const panFromGstin = profile.gstin ? profile.gstin.substring(2, 12) : null;

    return res.status(200).json({
      msmeId: profile.id,
      businessName: profile.business_name,
      verificationStatus: verificationResult.status,
      lastVerified: profile.updated_at,
      credentials: {
        gstin: profile.gstin,
        gstStatus: 'VERIFIED',
        pan: panFromGstin,
        panStatus: 'VERIFIED',
        udyamNumber: profile.udyam_number,
        udyamStatus: 'VERIFIED',
      },
      details: verificationResult.details,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleVerifyGstin,
  handleVerifyPan,
  handleVerifyUdyam,
  handleGetBusinessVerificationStatus,
};
