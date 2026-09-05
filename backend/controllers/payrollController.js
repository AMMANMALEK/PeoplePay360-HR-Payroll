const SalaryStructure = require('../models/SalaryStructure');
const SalaryRule = require('../models/SalaryRule');
const Payrun = require('../models/Payrun');
const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const { computePayslip } = require('../services/payrollEngineService');
const { getContractForPeriod } = require('../services/contractService');

// ==========================================
// SALARY STRUCTURES
// ==========================================
exports.createSalaryStructure = async (req, res, next) => {
  try {
    const structure = await SalaryStructure.create(req.body);
    res.status(201).json({ success: true, data: structure });
  } catch (error) {
    next(error);
  }
};

exports.getSalaryStructures = async (req, res, next) => {
  try {
    const structures = await SalaryStructure.find().populate('rules');
    res.status(200).json({ success: true, data: structures });
  } catch (error) {
    next(error);
  }
};

exports.updateSalaryStructure = async (req, res, next) => {
  try {
    const structure = await SalaryStructure.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!structure) {
      const error = new Error('Salary Structure not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SALARY RULES
// ==========================================
exports.createSalaryRule = async (req, res, next) => {
  try {
    const rule = await SalaryRule.create(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

exports.getSalaryRules = async (req, res, next) => {
  try {
    const filter = req.query.salaryStructure ? { salaryStructure: req.query.salaryStructure } : {};
    const rules = await SalaryRule.find(filter).sort({ sequence: 1 });
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

exports.updateSalaryRule = async (req, res, next) => {
  try {
    const rule = await SalaryRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rule) {
      const error = new Error('Salary Rule not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PAYRUNS
// ==========================================

// Step 1: Init scope/period
exports.initPayrun = async (req, res, next) => {
  try {
    const { name, periodStart, periodEnd, salaryStructure } = req.body;
    // Returns draft selection info, doesn't create document
    res.status(200).json({
      success: true,
      data: { name, periodStart, periodEnd, salaryStructure }
    });
  } catch (error) {
    next(error);
  }
};

// Step 2: Eligible employees
exports.getEligibleEmployees = async (req, res, next) => {
  try {
    const { periodStart, periodEnd } = req.body;
    // Just find active employees for now (advanced logic might filter by who has a contract in this period)
    const employees = await Employee.find({ status: 'active' }).select('employeeCode firstName lastName department jobPosition');
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
};

// Step 3: Create Payrun (Final)
exports.createPayrun = async (req, res, next) => {
  try {
    const payrun = await Payrun.create(req.body);
    res.status(201).json({ success: true, data: payrun });
  } catch (error) {
    next(error);
  }
};

exports.getPayruns = async (req, res, next) => {
  try {
    const payruns = await Payrun.find().populate('salaryStructure', 'name');
    res.status(200).json({ success: true, data: payruns });
  } catch (error) {
    next(error);
  }
};

exports.getPayrunById = async (req, res, next) => {
  try {
    const payrun = await Payrun.findById(req.params.id)
      .populate('salaryStructure')
      .populate('employees', 'employeeCode firstName lastName');
    if (!payrun) {
      const error = new Error('Payrun not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: payrun });
  } catch (error) {
    next(error);
  }
};

exports.computePayrun = async (req, res, next) => {
  try {
    const payrun = await Payrun.findById(req.params.id).populate('employees');
    if (!payrun) {
      const error = new Error('Payrun not found');
      error.statusCode = 404;
      return next(error);
    }

    if (payrun.status !== 'Draft') {
      const error = new Error('Can only compute Draft payruns');
      error.statusCode = 400;
      return next(error);
    }

    const rules = await SalaryRule.find({ salaryStructure: payrun.salaryStructure }).sort({ sequence: 1 });
    const warnings = [];

    // Clear existing payslips for this payrun to allow re-computation
    await Payslip.deleteMany({ payrun: payrun._id });

    const payslips = [];

    for (const employee of payrun.employees) {
      let contract;
      try {
        contract = await getContractForPeriod(employee._id, payrun.periodStart, payrun.periodEnd);
      } catch (err) {
        warnings.push(`Employee ${employee.employeeCode}: Contract conflict - ${err.message}`);
        continue;
      }

      if (!contract) {
        warnings.push(`Employee ${employee.employeeCode}: No active contract found for this period.`);
        continue;
      }

      let engineResult;
      try {
        engineResult = computePayslip(contract, rules);
      } catch (err) {
        warnings.push(`Employee ${employee.employeeCode}: Computation failed - ${err.message}`);
        continue;
      }

      payslips.push({
        payrun: payrun._id,
        employee: employee._id,
        contract: contract._id,
        workedDays: 30, // Mock for now, would typically be derived from Attendance
        lines: engineResult.lines,
        grossSalary: engineResult.grossSalary,
        netSalary: engineResult.netSalary,
        status: 'Draft'
      });
    }

    if (payslips.length > 0) {
      await Payslip.insertMany(payslips);
    }

    payrun.status = 'Computed';
    await payrun.save();

    res.status(200).json({ 
      success: true, 
      data: {
        payrun,
        warnings,
        payslipsGenerated: payslips.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.validatePayrun = async (req, res, next) => {
  try {
    const payrun = await Payrun.findByIdAndUpdate(req.params.id, { status: 'Validated' }, { new: true });
    res.status(200).json({ success: true, data: payrun });
  } catch (error) {
    next(error);
  }
};

exports.markPayrunPaid = async (req, res, next) => {
  try {
    const payrun = await Payrun.findByIdAndUpdate(req.params.id, { status: 'Paid' }, { new: true });
    await Payslip.updateMany({ payrun: payrun._id }, { status: 'Done' });
    res.status(200).json({ success: true, data: payrun });
  } catch (error) {
    next(error);
  }
};

exports.sendPayslips = async (req, res, next) => {
  try {
    // Stub email sending
    console.log(`[STUB] Sending payslip emails for Payrun ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Payslips sent successfully (Stub)' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PAYSLIPS
// ==========================================
exports.getPayslips = async (req, res, next) => {
  try {
    const filter = req.query.payrun ? { payrun: req.query.payrun } : {};
    const payslips = await Payslip.find(filter)
      .populate('employee', 'employeeCode firstName lastName')
      .populate('contract', 'contractCode wageAmount');
    res.status(200).json({ success: true, data: payslips });
  } catch (error) {
    next(error);
  }
};

exports.getPayslipById = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employee', 'employeeCode firstName lastName department')
      .populate('contract');
    if (!payslip) {
      const error = new Error('Payslip not found');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: payslip });
  } catch (error) {
    next(error);
  }
};

exports.generatePayslipPdf = async (req, res, next) => {
  try {
    // Stub PDF generation
    res.status(200).json({ success: true, message: `PDF generated for payslip ${req.params.id} (Stub)` });
  } catch (error) {
    next(error);
  }
};
