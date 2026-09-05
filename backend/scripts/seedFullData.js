require('dotenv').config();
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/password');

const connectDB = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Contract = require('../models/Contract');
const WorkingSchedule = require('../models/WorkingSchedule');
const Attendance = require('../models/Attendance');
const TimeOffType = require('../models/TimeOffType');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const TimeOffRequest = require('../models/TimeOffRequest');
const SalaryStructure = require('../models/SalaryStructure');
const SalaryRule = require('../models/SalaryRule');
const Payrun = require('../models/Payrun');
const Payslip = require('../models/Payslip');
const AuditLog = require('../models/AuditLog');
const { ROLES } = require('../constants/roles');

async function seed() {
  console.log('--- STARTING COMPREHENSIVE SEEDING ---');
  await connectDB();

  // 1. Working Schedules
  console.log('1. Seeding Working Schedules...');
  await WorkingSchedule.deleteMany({});

  const standardSchedule = await WorkingSchedule.create({
    scheduleCode: 'WS-STD-40',
    name: 'Standard 40h (Mon-Fri)',
    scheduleType: 'flexible',
    isDefault: true,
    weeklyPattern: [
      { day: 'monday', startTime: '09:00', endTime: '17:30', breakMinutes: 30 },
      { day: 'tuesday', startTime: '09:00', endTime: '17:30', breakMinutes: 30 },
      { day: 'wednesday', startTime: '09:00', endTime: '17:30', breakMinutes: 30 },
      { day: 'thursday', startTime: '09:00', endTime: '17:30', breakMinutes: 30 },
      { day: 'friday', startTime: '09:00', endTime: '17:30', breakMinutes: 30 },
    ],
  });

  const flexSchedule = await WorkingSchedule.create({
    scheduleCode: 'WS-FLEX-35',
    name: 'Flexible 35h Core',
    scheduleType: 'flexible',
    isDefault: false,
    weeklyPattern: [
      { day: 'monday', startTime: '09:30', endTime: '17:00', breakMinutes: 30 },
      { day: 'tuesday', startTime: '09:30', endTime: '17:00', breakMinutes: 30 },
      { day: 'wednesday', startTime: '09:30', endTime: '17:00', breakMinutes: 30 },
      { day: 'thursday', startTime: '09:30', endTime: '17:00', breakMinutes: 30 },
      { day: 'friday', startTime: '09:30', endTime: '17:00', breakMinutes: 30 },
    ],
  });

  // 2. Salary Structures (Created BEFORE SalaryRules because rules reference structure)
  console.log('2. Seeding Salary Structures...');
  await SalaryStructure.deleteMany({});

  const strucEng = await SalaryStructure.create({
    code: 'ENG-TECH',
    name: 'Engineering & Tech Structure',
    description: 'Tailored for software engineers, architects, and technical staff',
    isActive: true,
  });

  const strucExec = await SalaryStructure.create({
    code: 'STD-PROF',
    name: 'Standard Professional Structure',
    description: 'General enterprise structure for Product, People, and Operations',
    isActive: true,
  });

  const strucSales = await SalaryStructure.create({
    code: 'SALES-COMM',
    name: 'Sales & Commercial Structure',
    description: 'Commission and milestone aligned structure for revenue teams',
    isActive: true,
  });

  // 3. Salary Rules
  console.log('3. Seeding Salary Rules...');
  await SalaryRule.deleteMany({});

  const createRulesForStructure = async (structureId) => {
    return [
      await SalaryRule.create({
        salaryStructure: structureId,
        code: 'BASIC',
        name: 'Basic Salary',
        category: 'Basic',
        sequence: 10,
        computationMethod: 'Percentage',
        percentageValue: 50,
        percentageBase: 'ContractWage',
        description: 'Primary fixed base salary component',
      }),
      await SalaryRule.create({
        salaryStructure: structureId,
        code: 'HRA',
        name: 'House Rent Allowance',
        category: 'Allowances',
        sequence: 20,
        computationMethod: 'Percentage',
        percentageValue: 25,
        percentageBase: 'ContractWage',
        description: 'Housing assistance accommodation allowance',
      }),
      await SalaryRule.create({
        salaryStructure: structureId,
        code: 'TRANS',
        name: 'Transport Allowance',
        category: 'Allowances',
        sequence: 30,
        computationMethod: 'Fixed',
        fixedAmount: 3000,
        description: 'Standard monthly travel commute allowance',
      }),
      await SalaryRule.create({
        salaryStructure: structureId,
        code: 'SPEC',
        name: 'Special / Tech Allowance',
        category: 'Allowances',
        sequence: 40,
        computationMethod: 'Percentage',
        percentageValue: 15,
        percentageBase: 'ContractWage',
        description: 'Performance, technical & executive operational stipend',
      }),
      await SalaryRule.create({
        salaryStructure: structureId,
        code: 'GROSS',
        name: 'Gross Salary',
        category: 'Gross',
        sequence: 50,
        computationMethod: 'Formula',
        formula: 'BASIC + HRA + TRANS + SPEC',
        description: 'Sum total of all earnings before statutory deductions',
      }),
      await SalaryRule.create({
        salaryStructure: structureId,
        code: 'PF',
        name: 'Provident Fund / Social Security',
        category: 'Deductions',
        sequence: 60,
        computationMethod: 'Percentage',
        percentageValue: 12,
        percentageBase: 'Basic',
        description: 'Employee retirement and social security contribution',
      }),
      await SalaryRule.create({
        salaryStructure: structureId,
        code: 'PTAX',
        name: 'Professional Tax',
        category: 'Deductions',
        sequence: 70,
        computationMethod: 'Fixed',
        fixedAmount: 200,
        description: 'Jurisdiction statutory employment levy',
      }),
      await SalaryRule.create({
        salaryStructure: structureId,
        code: 'TDS',
        name: 'Income Tax (TDS)',
        category: 'Deductions',
        sequence: 80,
        computationMethod: 'Percentage',
        percentageValue: 10,
        percentageBase: 'Gross',
        description: 'Withholding tax deducted at source',
      }),
      await SalaryRule.create({
        salaryStructure: structureId,
        code: 'NET',
        name: 'Net Salary',
        category: 'Net',
        sequence: 90,
        computationMethod: 'Formula',
        formula: 'GROSS - (PF + PTAX + TDS)',
        description: 'Final take-home pay disbursed to employee bank account',
      }),
    ];
  };

  await createRulesForStructure(strucEng._id);
  await createRulesForStructure(strucExec._id);
  await createRulesForStructure(strucSales._id);

  // 4. Time Off Types
  console.log('4. Seeding Time Off Types...');
  await TimeOffType.deleteMany({});

  const typeAnnual = await TimeOffType.create({
    name: 'Annual Leave',
    typeCode: 'ANNUAL',
    color: '#0284c7',
    requiresAllocation: true,
    requiresApproval: true,
    isActive: true,
  });

  const typeSick = await TimeOffType.create({
    name: 'Sick Leave',
    typeCode: 'SICK',
    color: '#ef4444',
    requiresAllocation: true,
    requiresApproval: true,
    isActive: true,
  });

  const typeFestival = await TimeOffType.create({
    name: 'Festival Leave',
    typeCode: 'FESTIVAL',
    color: '#f59e0b',
    requiresAllocation: true,
    requiresApproval: true,
    isActive: true,
  });

  const typeParental = await TimeOffType.create({
    name: 'Parental Leave',
    typeCode: 'PARENTAL',
    color: '#8b5cf6',
    requiresAllocation: true,
    requiresApproval: true,
    isActive: true,
  });

  // 5. Employees
  console.log('5. Seeding Employees...');
  await Employee.deleteMany({});

  // 5.1 Marcus Vance (VP / Lead)
  const empMarcus = await Employee.create({
    employeeCode: 'EMP-1004',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@peoplepay360.internal',
    phone: '+1 (555) 567-8901',
    jobPosition: 'VP of Engineering & Ops',
    department: 'Engineering',
    workingSchedule: standardSchedule._id,
    hireDate: '2022-01-10',
    dob: '1985-08-30',
    employmentType: 'full_time',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bankDetails: {
      accountHolder: 'Marcus Vance',
      accountNumber: '654321098765',
      bankName: 'First Republic / Chase',
      routingNumber: '321070007',
      accountType: 'Checking',
    },
    address: {
      street: '888 Broadway Terrace',
      city: 'Oakland',
      state: 'CA',
      postalCode: '94611',
      country: 'USA',
    },
  });

  // 5.2 Sarah Jenkins
  const empSarah = await Employee.create({
    employeeCode: 'EMP-1001',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@peoplepay360.internal',
    phone: '+1 (555) 234-5678',
    jobPosition: 'Staff Software Engineer',
    department: 'Engineering',
    manager: empMarcus._id,
    workingSchedule: standardSchedule._id,
    hireDate: '2023-03-15',
    dob: '1992-06-20',
    employmentType: 'full_time',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bankDetails: {
      accountHolder: 'Sarah Jenkins',
      accountNumber: '987654321012',
      bankName: 'Chase Bank',
      routingNumber: '021000021',
      accountType: 'Checking',
    },
    address: {
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94107',
      country: 'USA',
    },
  });

  // 5.3 David Kim
  const empDavid = await Employee.create({
    employeeCode: 'EMP-1002',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@peoplepay360.internal',
    phone: '+1 (555) 345-6789',
    jobPosition: 'Senior Product Designer',
    department: 'Product & Design',
    manager: empMarcus._id,
    workingSchedule: standardSchedule._id,
    hireDate: '2023-06-01',
    dob: '1990-11-14',
    employmentType: 'full_time',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bankDetails: {
      accountHolder: 'David Kim',
      accountNumber: '876543210987',
      bankName: 'Bank of America',
      routingNumber: '121000358',
      accountType: 'Checking',
    },
    address: {
      street: '123 Market Street, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
    },
  });

  // 5.4 Elena Rostova
  const empElena = await Employee.create({
    employeeCode: 'EMP-1003',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@peoplepay360.internal',
    phone: '+1 (555) 456-7890',
    jobPosition: 'Talent Acquisition Lead',
    department: 'People & HR',
    manager: empMarcus._id,
    workingSchedule: flexSchedule._id,
    hireDate: '2023-09-10',
    dob: '1994-04-05',
    employmentType: 'full_time',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bankDetails: {
      accountHolder: 'Elena Rostova',
      accountNumber: '765432109876',
      bankName: 'Wells Fargo',
      routingNumber: '121000248',
      accountType: 'Checking',
    },
    address: {
      street: '456 Castro Street',
      city: 'Mountain View',
      state: 'CA',
      postalCode: '94041',
      country: 'USA',
    },
  });

  // 5.5 Amina Diallo (Incomplete Profile - Missing Bank Details for Attention Items)
  const empAmina = await Employee.create({
    employeeCode: 'EMP-1005',
    firstName: 'Amina',
    lastName: 'Diallo',
    email: 'amina.diallo@peoplepay360.internal',
    phone: '+1 (555) 678-9012',
    jobPosition: 'Junior Frontend Developer',
    department: 'Engineering',
    manager: empSarah._id,
    workingSchedule: standardSchedule._id,
    hireDate: '2024-01-15',
    dob: '1998-02-18',
    employmentType: 'full_time',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bankDetails: null,
    address: {
      street: '204 Berkeley Way',
      city: 'Berkeley',
      state: 'CA',
      postalCode: '94704',
      country: 'USA',
    },
  });

  // 5.6 Lucas Silva
  const empLucas = await Employee.create({
    employeeCode: 'EMP-1006',
    firstName: 'Lucas',
    lastName: 'Silva',
    email: 'lucas.silva@peoplepay360.internal',
    phone: '+1 (555) 789-0123',
    jobPosition: 'Enterprise Sales Director',
    department: 'Sales & Marketing',
    manager: empMarcus._id,
    workingSchedule: standardSchedule._id,
    hireDate: '2023-05-20',
    dob: '1988-09-12',
    employmentType: 'full_time',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bankDetails: {
      accountHolder: 'Lucas Silva',
      accountNumber: '543210987654',
      bankName: 'Citibank',
      routingNumber: '021000089',
      accountType: 'Checking',
    },
    address: {
      street: '500 Howard St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
    },
  });

  // 5.7 Chloe Bennett (Contractor - Missing Bank Details for Attention Items)
  const empChloe = await Employee.create({
    employeeCode: 'EMP-1007',
    firstName: 'Chloe',
    lastName: 'Bennett',
    email: 'chloe.bennett@peoplepay360.internal',
    phone: '+1 (555) 890-1234',
    jobPosition: 'Marketing Specialist',
    department: 'Sales & Marketing',
    manager: empLucas._id,
    workingSchedule: flexSchedule._id,
    hireDate: '2024-02-01',
    dob: '1996-07-22',
    employmentType: 'contract',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bankDetails: null,
    address: {
      street: '1200 Grand Ave',
      city: 'Palo Alto',
      state: 'CA',
      postalCode: '94301',
      country: 'USA',
    },
  });

  // 5.8 Farhan Shaikh (developer user)
  const empFarhan = await Employee.create({
    employeeCode: 'EMP-1008',
    firstName: 'Farhan',
    lastName: 'Shaikh',
    email: 'farhan@gmail.com',
    phone: '+1 (555) 901-2345',
    jobPosition: 'Lead Software Engineer',
    department: 'Engineering',
    manager: empMarcus._id,
    workingSchedule: standardSchedule._id,
    hireDate: '2023-01-10',
    dob: '1995-03-25',
    employmentType: 'full_time',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bankDetails: {
      accountHolder: 'Farhan Shaikh',
      accountNumber: '112233445566',
      bankName: 'HDFC / Chase',
      routingNumber: '021000021',
      accountType: 'Checking',
    },
    address: {
      street: '101 Tech Hub Boulevard',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
      country: 'USA',
    },
  });

  // 5.9 Akshat Patel (developer user)
  const empAkshat = await Employee.create({
    employeeCode: 'EMP-1009',
    firstName: 'Akshat',
    lastName: 'Patel',
    email: 'akshat@gmail.com',
    phone: '+1 (555) 902-3456',
    jobPosition: 'Frontend Engineer',
    department: 'Engineering',
    manager: empSarah._id,
    workingSchedule: standardSchedule._id,
    hireDate: '2023-04-12',
    dob: '1997-07-19',
    employmentType: 'full_time',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bankDetails: {
      accountHolder: 'Akshat Patel',
      accountNumber: '998877665544',
      bankName: 'Wells Fargo',
      routingNumber: '121000248',
      accountType: 'Checking',
    },
    address: {
      street: '55 Innovation Plaza',
      city: 'San Jose',
      state: 'CA',
      postalCode: '95113',
      country: 'USA',
    },
  });

  // 6. Contracts
  console.log('6. Seeding Contracts...');
  await Contract.deleteMany({});

  await Contract.create([
    {
      contractCode: 'CTR-2023-001',
      employee: empSarah._id,
      jobPosition: 'Staff Software Engineer',
      department: 'Engineering',
      salaryStructure: strucEng._id,
      wageAmount: 145000,
      wageType: 'monthly',
      startDate: new Date('2023-03-15'),
      status: 'active',
    },
    {
      contractCode: 'CTR-2023-002',
      employee: empDavid._id,
      jobPosition: 'Senior Product Designer',
      department: 'Product & Design',
      salaryStructure: strucExec._id,
      wageAmount: 125000,
      wageType: 'monthly',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2026-10-15'), // Expiring soon (<45 days)
      status: 'active',
    },
    {
      contractCode: 'CTR-2023-003',
      employee: empElena._id,
      jobPosition: 'Talent Acquisition Lead',
      department: 'People & HR',
      salaryStructure: strucExec._id,
      wageAmount: 98000,
      wageType: 'monthly',
      startDate: new Date('2023-09-10'),
      status: 'active',
    },
    {
      contractCode: 'CTR-2022-004',
      employee: empMarcus._id,
      jobPosition: 'VP of Engineering & Ops',
      department: 'Engineering',
      salaryStructure: strucEng._id,
      wageAmount: 195000,
      wageType: 'monthly',
      startDate: new Date('2022-01-10'),
      status: 'active',
    },
    {
      contractCode: 'CTR-2024-005',
      employee: empAmina._id,
      jobPosition: 'Junior Frontend Developer',
      department: 'Engineering',
      salaryStructure: strucEng._id,
      wageAmount: 78000,
      wageType: 'monthly',
      startDate: new Date('2024-01-15'),
      status: 'active',
    },
    {
      contractCode: 'CTR-2023-006',
      employee: empLucas._id,
      jobPosition: 'Enterprise Sales Director',
      department: 'Sales & Marketing',
      salaryStructure: strucSales._id,
      wageAmount: 135000,
      wageType: 'monthly',
      startDate: new Date('2023-05-20'),
      status: 'active',
    },
    {
      contractCode: 'CTR-2024-007',
      employee: empChloe._id,
      jobPosition: 'Marketing Specialist',
      department: 'Sales & Marketing',
      salaryStructure: strucSales._id,
      wageAmount: 72000,
      wageType: 'monthly',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2026-09-30'), // Expiring soon (<45 days)
      status: 'active',
    },
    {
      contractCode: 'CTR-2023-008',
      employee: empFarhan._id,
      jobPosition: 'Lead Software Engineer',
      department: 'Engineering',
      salaryStructure: strucEng._id,
      wageAmount: 95000,
      wageType: 'monthly',
      startDate: new Date('2023-01-10'),
      status: 'active',
    },
    {
      contractCode: 'CTR-2023-009',
      employee: empAkshat._id,
      jobPosition: 'Frontend Engineer',
      department: 'Engineering',
      salaryStructure: strucEng._id,
      wageAmount: 85000,
      wageType: 'monthly',
      startDate: new Date('2023-04-12'),
      status: 'active',
    },
  ]);

  // 7. Time Off Allocations
  console.log('7. Seeding Time Off Allocations...');
  await TimeOffAllocation.deleteMany({});

  const allEmployees = [empSarah, empDavid, empElena, empMarcus, empAmina, empLucas, empChloe, empFarhan, empAkshat];
  for (const emp of allEmployees) {
    await TimeOffAllocation.create([
      {
        employee: emp._id,
        timeOffType: typeAnnual._id,
        allocated: 20,
        taken: 4,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        status: 'active',
      },
      {
        employee: emp._id,
        timeOffType: typeSick._id,
        allocated: 10,
        taken: 2,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        status: 'active',
      },
      {
        employee: emp._id,
        timeOffType: typeFestival._id,
        allocated: 5,
        taken: 0,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        status: 'active',
      },
    ]);
  }

  // 8. Time Off Requests
  console.log('8. Seeding Time Off Requests...');
  await TimeOffRequest.deleteMany({});

  await TimeOffRequest.create([
    {
      employee: empSarah._id,
      timeOffType: typeAnnual._id,
      startDate: new Date('2026-09-15'),
      endDate: new Date('2026-09-18'),
      duration: 4,
      unit: 'days',
      status: 'approved',
      reason: 'Family wedding and travel out of state',
    },
    {
      employee: empMarcus._id,
      timeOffType: typeAnnual._id,
      startDate: new Date('2026-09-02'),
      endDate: new Date('2026-09-05'),
      duration: 4,
      unit: 'days',
      status: 'approved',
      reason: 'Executive offsite leadership retreat',
    },
    {
      employee: empAmina._id,
      timeOffType: typeAnnual._id,
      startDate: new Date('2026-09-28'),
      endDate: new Date('2026-09-30'),
      duration: 3,
      unit: 'days',
      status: 'pending',
      reason: 'Family gathering and cultural holiday',
    },
    {
      employee: empLucas._id,
      timeOffType: typeAnnual._id,
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-12'),
      duration: 3,
      unit: 'days',
      status: 'pending',
      reason: 'Personal travel and family commitment',
    },
    {
      employee: empChloe._id,
      timeOffType: typeAnnual._id,
      startDate: new Date('2026-09-18'),
      endDate: new Date('2026-09-22'),
      duration: 5,
      unit: 'days',
      status: 'pending',
      reason: 'Attending creative marketing summit and personal days',
    },
    {
      employee: empDavid._id,
      timeOffType: typeSick._id,
      startDate: new Date('2026-09-07'),
      endDate: new Date('2026-09-08'),
      duration: 2,
      unit: 'days',
      status: 'refused',
      reason: 'Personal appointments',
      reviewNotes: 'High priority design sprint delivery milestone',
    },
  ]);

  // 9. Attendance
  console.log('9. Seeding Attendance records...');
  await Attendance.deleteMany({});

  const now = new Date();
  const d0 = new Date(now.toISOString().split('T')[0]);
  const d1 = new Date(new Date(now.getTime() - 86400000).toISOString().split('T')[0]);
  const d2 = new Date(new Date(now.getTime() - 172800000).toISOString().split('T')[0]);

  const makeAtt = async (emp, calDate, inHour, outHour, status = 'present') => {
    const inTime = new Date(calDate);
    inTime.setHours(inHour, 0, 0, 0);
    let outTime = null;
    if (outHour) {
      outTime = new Date(calDate);
      outTime.setHours(outHour, 30, 0, 0);
    }
    const workedHours = outHour ? Math.round((outHour - inHour + 0.5) * 10) / 10 : 0;
    await Attendance.create({
      employee: emp._id,
      attendanceDate: calDate,
      checkIn: inTime,
      checkOut: outTime,
      status,
      workedHours,
    });
  };

  for (const emp of [empSarah, empDavid, empElena, empMarcus, empFarhan, empAkshat]) {
    await makeAtt(emp, d2, 9, 17);
    await makeAtt(emp, d1, 9, 18);
    await makeAtt(emp, d0, 9, null, 'present');
  }

  // 1 exception record to test HR Attention Item
  await makeAtt(empAmina, d1, 11, 14, 'half_day');

  // 10. Payruns & Payslips
  console.log('10. Seeding Payruns & Payslips...');
  await Payrun.deleteMany({});
  await Payslip.deleteMany({});

  const payrunAug = await Payrun.create({
    name: 'August 2026 Regular Payrun',
    periodName: 'August 2026',
    periodStart: new Date('2026-08-01'),
    periodEnd: new Date('2026-08-31'),
    salaryStructure: strucEng._id,
    paymentDate: new Date('2026-09-01'),
    processedDate: new Date('2026-08-31'),
    status: 'Paid',
    employees: [empSarah._id, empDavid._id, empElena._id, empMarcus._id, empLucas._id],
    employeesCount: 5,
    payslipsCount: 5,
    totalGross: 625000,
    totalDeductions: 87500,
    totalNet: 537500,
  });

  const payrunSep = await Payrun.create({
    name: 'September 2026 Regular Payrun',
    periodName: 'September 2026',
    periodStart: new Date('2026-09-01'),
    periodEnd: new Date('2026-09-30'),
    salaryStructure: strucEng._id,
    status: 'Draft',
    employees: allEmployees.map((e) => e._id),
    employeesCount: allEmployees.length,
    payslipsCount: 0,
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
  });

  // Seed sample payslips for August Payrun
  const sarahContract = await Contract.findOne({ employee: empSarah._id });
  if (sarahContract) {
    await Payslip.create({
      payrun: payrunAug._id,
      employee: empSarah._id,
      contract: sarahContract._id,
      periodName: 'August 2026',
      periodStart: new Date('2026-08-01'),
      periodEnd: new Date('2026-08-31'),
      status: 'Paid',
      workedDays: 22,
      contractWage: 145000,
      gross: 145000,
      totalDeductions: 20500,
      net: 124500,
      earnings: [
        { code: 'BASIC', name: 'Basic Salary', amount: 72500 },
        { code: 'HRA', name: 'House Rent Allowance', amount: 36250 },
        { code: 'TRANS', name: 'Transport Allowance', amount: 3000 },
        { code: 'SPEC', name: 'Special / Tech Allowance', amount: 33250 },
      ],
      deductions: [
        { code: 'PF', name: 'Provident Fund (12% of Basic)', amount: 8700 },
        { code: 'PTAX', name: 'Professional Tax', amount: 200 },
        { code: 'TDS', name: 'Income Tax (TDS)', amount: 11600 },
      ],
      lines: [
        { ruleName: 'Basic Salary', category: 'Basic', code: 'BASIC', amount: 72500 },
        { ruleName: 'House Rent Allowance', category: 'Allowances', code: 'HRA', amount: 36250 },
        { ruleName: 'Transport Allowance', category: 'Allowances', code: 'TRANS', amount: 3000 },
        { ruleName: 'Special / Tech Allowance', category: 'Allowances', code: 'SPEC', amount: 33250 },
        { ruleName: 'Gross Salary', category: 'Gross', code: 'GROSS', amount: 145000 },
        { ruleName: 'Provident Fund', category: 'Deductions', code: 'PF', amount: 8700 },
        { ruleName: 'Professional Tax', category: 'Deductions', code: 'PTAX', amount: 200 },
        { ruleName: 'Income Tax', category: 'Deductions', code: 'TDS', amount: 11600 },
        { ruleName: 'Net Salary', category: 'Net', code: 'NET', amount: 124500 },
      ],
      bankDetails: empSarah.bankDetails,
    });
  }

  // 11. Platform Users
  console.log('11. Seeding Platform Users...');
  await User.deleteMany({});

  const hashAdmin = hashPassword('Admin123!');
  const hashStaff = hashPassword('Password123!');
  const hashEmp = hashPassword('Employee123!');

  const users = [
    {
      email: 'admin@peoplepay360.com',
      username: 'System Admin',
      passwordHash: hashAdmin,
      role: ROLES.ADMIN,
      status: 'active',
    },
    {
      email: 'marcus.vance@peoplepay360.internal',
      username: 'Marcus Vance',
      passwordHash: hashAdmin,
      role: ROLES.ADMIN,
      status: 'active',
      employee: empMarcus._id,
    },
    {
      email: 'hr.manager@peoplepay360.com',
      username: 'HR Manager Lead',
      passwordHash: hashStaff,
      role: ROLES.HR_MANAGER,
      status: 'active',
    },
    {
      email: 'sarah.jenkins@peoplepay360.internal',
      username: 'Sarah Jenkins',
      passwordHash: hashStaff,
      role: ROLES.HR_PAYROLL_MANAGER,
      status: 'active',
      employee: empSarah._id,
    },
    {
      email: 'david.kim@peoplepay360.internal',
      username: 'David Kim',
      passwordHash: hashStaff,
      role: ROLES.HR_MANAGER,
      status: 'active',
      employee: empDavid._id,
    },
    {
      email: 'elena.rostova@peoplepay360.internal',
      username: 'Elena Rostova',
      passwordHash: hashStaff,
      role: ROLES.HR_PAYROLL_USER,
      status: 'active',
      employee: empElena._id,
    },
    {
      email: 'farhan@gmail.com',
      username: 'Farhan Shaikh',
      passwordHash: hashEmp,
      role: ROLES.EMPLOYEE,
      status: 'active',
      employee: empFarhan._id,
    },
    {
      email: 'akshat@gmail.com',
      username: 'Akshat Patel',
      passwordHash: hashEmp,
      role: ROLES.EMPLOYEE,
      status: 'active',
      employee: empAkshat._id,
    },
  ];

  await User.create(users);

  // 12. Audit Logs
  console.log('12. Seeding Audit Logs...');
  await AuditLog.deleteMany({});

  await AuditLog.create([
    {
      logId: 'AUD-901',
      action: 'Role changed',
      administrator: 'Marcus Vance',
      performedBy: 'Marcus Vance',
      module: 'Users',
      target: 'Sarah Jenkins (HR Manager → HR Payroll Manager)',
      status: 'Success',
      severity: 'info',
      rawDate: new Date(),
    },
    {
      logId: 'AUD-902',
      action: 'Permission updated',
      administrator: 'Marcus Vance',
      performedBy: 'Marcus Vance',
      module: 'Roles',
      target: 'HR Payroll User (Payrun validation rights)',
      status: 'Success',
      severity: 'info',
      rawDate: new Date(Date.now() - 6 * 60000),
    },
    {
      logId: 'AUD-903',
      action: 'User activated',
      administrator: 'Marcus Vance',
      performedBy: 'Marcus Vance',
      module: 'Users',
      target: 'David Kim (USR-003)',
      status: 'Success',
      severity: 'info',
      rawDate: new Date(Date.now() - 29 * 60000),
    },
    {
      logId: 'AUD-904',
      action: 'Configuration updated',
      administrator: 'Marcus Vance',
      performedBy: 'Marcus Vance',
      module: 'System Administration',
      target: 'Session timeout policy set to 60 minutes',
      status: 'Success',
      severity: 'info',
      rawDate: new Date(Date.now() - 86400000),
    },
    {
      logId: 'AUD-905',
      action: 'Security policy updated',
      administrator: 'Marcus Vance',
      performedBy: 'Marcus Vance',
      module: 'System Administration',
      target: 'Strict salary validation enforcement enabled',
      status: 'Success',
      severity: 'info',
      rawDate: new Date(Date.now() - 172800000),
    },
  ]);

  console.log('====================================================');
  console.log('  ALL SEED DATA SUCCESSFULLY POPULATED INTO ATLAS!  ');
  console.log('====================================================');
  process.exit(0);
}

seed().catch((err) => {
  console.error('SEEDING FAILED:', err);
  process.exit(1);
});
