const msmeService = require('../services/msme.service');

const handleCreateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await msmeService.createProfile(userId, req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const handleGetProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await msmeService.getProfileByUserId(userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const handleUpdateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await msmeService.updateProfile(userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateProfile,
  handleGetProfile,
  handleUpdateProfile,
};
