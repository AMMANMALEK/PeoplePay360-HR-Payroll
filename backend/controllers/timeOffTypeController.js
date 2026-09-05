const TimeOffType = require('../models/TimeOffType');
const { findTimeOffTypeByIdentifier } = require('../services/timeOffService');

const getAllTimeOffTypes = async (req, res, next) => {
  try {
    const { isActive, unit, search } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else {
      filter.isActive = true;
    }

    if (unit) {
      filter.unit = unit;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { typeCode: { $regex: search, $options: 'i' } },
      ];
    }

    const types = await TimeOffType.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: types.length,
      data: types,
    });
  } catch (error) {
    next(error);
  }
};

const getTimeOffTypeById = async (req, res, next) => {
  try {
    const type = await findTimeOffTypeByIdentifier(req.params.id);

    if (!type) {
      return res.status(404).json({
        success: false,
        message: 'Time off type not found',
      });
    }

    res.status(200).json({
      success: true,
      data: type,
    });
  } catch (error) {
    next(error);
  }
};

const createTimeOffType = async (req, res, next) => {
  try {
    const requestedName = String(req.body?.name || '').trim().toLowerCase();
    const requestedCode = String(req.body?.typeCode || '').trim().toUpperCase();
    if (requestedName !== 'personal leave' && requestedCode !== 'PERSONAL') {
      return res.status(400).json({
        success: false,
        message: 'Only Personal Leave is supported as a Time Off type.',
      });
    }

    const type = await TimeOffType.create({
      ...req.body,
      typeCode: 'PERSONAL',
      name: 'Personal Leave',
      requiresApproval: false,
      requiresAllocation: true,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Time off type created successfully',
      data: type,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'typeCode already exists',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    next(error);
  }
};

const updateTimeOffType = async (req, res, next) => {
  try {
    const type = await findTimeOffTypeByIdentifier(req.params.id);

    if (!type) {
      return res.status(404).json({
        success: false,
        message: 'Time off type not found',
      });
    }

    if (type.typeCode === 'PERSONAL') {
      Object.assign(type, req.body, {
        typeCode: 'PERSONAL',
        name: 'Personal Leave',
        requiresApproval: false,
        requiresAllocation: true,
        isActive: true,
      });
    } else {
      type.isActive = false;
    }
    await type.save();

    res.status(200).json({
      success: true,
      message: 'Time off type updated successfully',
      data: type,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'typeCode already exists',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    next(error);
  }
};

const deleteTimeOffType = async (req, res, next) => {
  try {
    const type = await findTimeOffTypeByIdentifier(req.params.id);

    if (!type) {
      return res.status(404).json({
        success: false,
        message: 'Time off type not found',
      });
    }

    if (type.typeCode === 'PERSONAL') {
      return res.status(409).json({
        success: false,
        message: 'Personal Leave cannot be deleted',
      });
    }

    type.isActive = false;
    await type.save();

    res.status(200).json({
      success: true,
      message: 'Time off type deactivated to preserve historical records',
      data: type,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTimeOffTypes,
  getTimeOffTypeById,
  createTimeOffType,
  updateTimeOffType,
  deleteTimeOffType,
};
