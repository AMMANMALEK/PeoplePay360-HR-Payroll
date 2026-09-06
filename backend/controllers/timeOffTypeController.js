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
    const {
      name,
      typeCode,
      unit,
      color,
      requiresAllocation,
      requiresApproval,
      isPaid,
      description,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Time off type name is required',
      });
    }

    const trimmedName = String(name).trim();
    let code = String(typeCode || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_');

    if (!code) {
      code = trimmedName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 16);
    }

    // Ensure uniqueness by appending suffix if code exists
    const existing = await TimeOffType.findOne({ typeCode: code });
    if (existing) {
      code = `${code.slice(0, 10)}_${Date.now().toString(36).toUpperCase()}`.slice(0, 20);
    }

    const normalizedUnit = String(unit || 'days').toLowerCase() === 'hours' ? 'hours' : 'days';

    const type = await TimeOffType.create({
      name: trimmedName,
      typeCode: code,
      unit: normalizedUnit,
      color: color || '#10b981',
      requiresAllocation: requiresAllocation !== undefined ? Boolean(requiresAllocation) : true,
      requiresApproval: requiresApproval !== undefined ? Boolean(requiresApproval) : true,
      isPaid: isPaid !== undefined ? Boolean(isPaid) : true,
      description: description ? String(description).trim() : '',
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

    const {
      name,
      unit,
      color,
      requiresAllocation,
      requiresApproval,
      isPaid,
      description,
      isActive,
    } = req.body;

    if (name) type.name = String(name).trim();
    if (unit) type.unit = String(unit).toLowerCase() === 'hours' ? 'hours' : 'days';
    if (color) type.color = color;
    if (requiresAllocation !== undefined) type.requiresAllocation = Boolean(requiresAllocation);
    if (requiresApproval !== undefined) type.requiresApproval = Boolean(requiresApproval);
    if (isPaid !== undefined) type.isPaid = Boolean(isPaid);
    if (description !== undefined) type.description = String(description).trim();
    if (isActive !== undefined) type.isActive = Boolean(isActive);

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
