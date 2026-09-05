// Comprehensive PeoplePay360 Operational Mock Dataset
// Supports HR Manager and HR Payroll Manager roles with connected records:
// Employee -> Contract -> Working Schedule -> Attendance -> Time Off -> Salary Structure -> Salary Rules -> Payrun -> Payslip

export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-1001",
    employeeCode: "EMP-1001",
    firstName: "Sarah",
    lastName: "Jenkins",
    fullName: "Sarah Jenkins",
    workEmail: "sarah.jenkins@peoplepay360.internal",
    phone: "+1 (555) 234-5678",
    jobPosition: "Staff Software Engineer",
    department: "Engineering",
    managerId: "EMP-1004",
    managerName: "Marcus Vance",
    scheduleId: "WS-STD-40",
    scheduleName: "Standard 40h (Mon-Fri)",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    employmentStatus: "Active",
    joinedDate: "2023-03-15",
    dob: "1992-06-20",
    employmentType: "Full-time",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    profileComplete: true,
    bankDetails: {
      accountHolder: "Sarah Jenkins",
      accountNumber: "987654321012",
      bankName: "Chase Bank",
      routingNumber: "021000021",
      accountType: "Checking"
    },
    address: {
      street: "742 Evergreen Terrace",
      city: "San Francisco",
      state: "CA",
      zipCode: "94107",
      country: "USA"
    }
  },
  {
    id: "EMP-1002",
    employeeCode: "EMP-1002",
    firstName: "David",
    lastName: "Kim",
    fullName: "David Kim",
    workEmail: "david.kim@peoplepay360.internal",
    phone: "+1 (555) 345-6789",
    jobPosition: "Senior Product Designer",
    department: "Product & Design",
    managerId: "EMP-1004",
    managerName: "Marcus Vance",
    scheduleId: "WS-STD-40",
    scheduleName: "Standard 40h (Mon-Fri)",
    salaryStructureId: "STRUC-EXEC-01",
    salaryStructureName: "Standard Professional Structure",
    employmentStatus: "Active",
    joinedDate: "2023-06-01",
    dob: "1990-11-14",
    employmentType: "Full-time",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    profileComplete: true,
    bankDetails: {
      accountHolder: "David Kim",
      accountNumber: "876543210987",
      bankName: "Bank of America",
      routingNumber: "121000358",
      accountType: "Checking"
    },
    address: {
      street: "123 Market Street, Apt 4B",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    }
  },
  {
    id: "EMP-1003",
    employeeCode: "EMP-1003",
    firstName: "Elena",
    lastName: "Rostova",
    fullName: "Elena Rostova",
    workEmail: "elena.rostova@peoplepay360.internal",
    phone: "+1 (555) 456-7890",
    jobPosition: "Talent Acquisition Lead",
    department: "People & HR",
    managerId: "EMP-1004",
    managerName: "Marcus Vance",
    scheduleId: "WS-FLEX-35",
    scheduleName: "Flexible 35h Core",
    salaryStructureId: "STRUC-EXEC-01",
    salaryStructureName: "Standard Professional Structure",
    employmentStatus: "Active",
    joinedDate: "2023-09-10",
    dob: "1994-04-05",
    employmentType: "Full-time",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    profileComplete: true,
    bankDetails: {
      accountHolder: "Elena Rostova",
      accountNumber: "765432109876",
      bankName: "Wells Fargo",
      routingNumber: "121000248",
      accountType: "Checking"
    },
    address: {
      street: "456 Castro Street",
      city: "Mountain View",
      state: "CA",
      zipCode: "94041",
      country: "USA"
    }
  },
  {
    id: "EMP-1004",
    employeeCode: "EMP-1004",
    firstName: "Marcus",
    lastName: "Vance",
    fullName: "Marcus Vance",
    workEmail: "marcus.vance@peoplepay360.internal",
    phone: "+1 (555) 567-8901",
    jobPosition: "VP of Engineering & Ops",
    department: "Engineering",
    managerId: null,
    managerName: "Executive Board",
    scheduleId: "WS-STD-40",
    scheduleName: "Standard 40h (Mon-Fri)",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    employmentStatus: "Active",
    joinedDate: "2022-01-10",
    dob: "1985-08-30",
    employmentType: "Full-time",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    profileComplete: true,
    bankDetails: {
      accountHolder: "Marcus Vance",
      accountNumber: "654321098765",
      bankName: "First Republic / Chase",
      routingNumber: "321070007",
      accountType: "Checking"
    },
    address: {
      street: "888 Broadway Terrace",
      city: "Oakland",
      state: "CA",
      zipCode: "94611",
      country: "USA"
    }
  },
  {
    id: "EMP-1005",
    employeeCode: "EMP-1005",
    firstName: "Amina",
    lastName: "Diallo",
    fullName: "Amina Diallo",
    workEmail: "amina.diallo@peoplepay360.internal",
    phone: "+1 (555) 678-9012",
    jobPosition: "Junior Frontend Developer",
    department: "Engineering",
    managerId: "EMP-1001",
    managerName: "Sarah Jenkins",
    scheduleId: "WS-STD-40",
    scheduleName: "Standard 40h (Mon-Fri)",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    employmentStatus: "Active",
    joinedDate: "2024-01-15",
    dob: "1998-02-18",
    employmentType: "Full-time",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    profileComplete: false, // Incomplete profile: Missing bank details
    bankDetails: null, // Attention item: Missing bank account
    address: {
      street: "204 Berkeley Way",
      city: "Berkeley",
      state: "CA",
      zipCode: "94704",
      country: "USA"
    }
  },
  {
    id: "EMP-1006",
    employeeCode: "EMP-1006",
    firstName: "Lucas",
    lastName: "Silva",
    fullName: "Lucas Silva",
    workEmail: "lucas.silva@peoplepay360.internal",
    phone: "+1 (555) 789-0123",
    jobPosition: "Enterprise Sales Director",
    department: "Sales & Marketing",
    managerId: "EMP-1004",
    managerName: "Marcus Vance",
    scheduleId: "WS-STD-40",
    scheduleName: "Standard 40h (Mon-Fri)",
    salaryStructureId: "STRUC-SALES-01",
    salaryStructureName: "Sales & Commercial Structure",
    employmentStatus: "Active",
    joinedDate: "2023-05-20",
    dob: "1988-09-12",
    employmentType: "Full-time",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    profileComplete: true,
    bankDetails: {
      accountHolder: "Lucas Silva",
      accountNumber: "543210987654",
      bankName: "Citibank",
      routingNumber: "021000089",
      accountType: "Checking"
    },
    address: {
      street: "500 Howard St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    }
  },
  {
    id: "EMP-1007",
    employeeCode: "EMP-1007",
    firstName: "Chloe",
    lastName: "Bennett",
    fullName: "Chloe Bennett",
    workEmail: "chloe.bennett@peoplepay360.internal",
    phone: "+1 (555) 890-1234",
    jobPosition: "Marketing Specialist",
    department: "Sales & Marketing",
    managerId: "EMP-1006",
    managerName: "Lucas Silva",
    scheduleId: "WS-FLEX-35",
    scheduleName: "Flexible 35h Core",
    salaryStructureId: "STRUC-SALES-01",
    salaryStructureName: "Sales & Commercial Structure",
    employmentStatus: "Active",
    joinedDate: "2024-02-01",
    dob: "1996-07-22",
    employmentType: "Contractor",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    profileComplete: false, // Incomplete profile: Missing bank details
    bankDetails: null, // Attention item: Missing bank account
    address: {
      street: "1200 Grand Ave",
      city: "Palo Alto",
      state: "CA",
      zipCode: "94301",
      country: "USA"
    }
  }
];

export const INITIAL_CONTRACTS = [
  {
    id: "CTR-2023-001",
    _id: "CTR-2023-001",
    contractName: "Staff Software Engineer Permanent Agreement",
    employeeId: "EMP-1001",
    employeeName: "Sarah Jenkins",
    jobPosition: "Staff Software Engineer",
    department: "Engineering",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    wage: 145000,
    wageType: "Monthly",
    startDate: "2023-03-15",
    endDate: null,
    status: "Active",
    isCurrent: true
  },
  {
    id: "CTR-2023-002",
    _id: "CTR-2023-002",
    contractName: "Senior Product Designer Term Agreement",
    employeeId: "EMP-1002",
    employeeName: "David Kim",
    jobPosition: "Senior Product Designer",
    department: "Product & Design",
    salaryStructureId: "STRUC-EXEC-01",
    salaryStructureName: "Standard Professional Structure",
    wage: 125000,
    wageType: "Monthly",
    startDate: "2023-06-01",
    endDate: "2026-10-15", // Expiring within 45 days!
    status: "Active",
    isCurrent: true
  },
  {
    id: "CTR-2023-003",
    _id: "CTR-2023-003",
    contractName: "Talent Acquisition Lead Agreement",
    employeeId: "EMP-1003",
    employeeName: "Elena Rostova",
    jobPosition: "Talent Acquisition Lead",
    department: "People & HR",
    salaryStructureId: "STRUC-EXEC-01",
    salaryStructureName: "Standard Professional Structure",
    wage: 98000,
    wageType: "Monthly",
    startDate: "2023-09-10",
    endDate: null,
    status: "Active",
    isCurrent: true
  },
  {
    id: "CTR-2022-004",
    _id: "CTR-2022-004",
    contractName: "VP of Engineering Executive Agreement",
    employeeId: "EMP-1004",
    employeeName: "Marcus Vance",
    jobPosition: "VP of Engineering & Ops",
    department: "Engineering",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    wage: 195000,
    wageType: "Monthly",
    startDate: "2022-01-10",
    endDate: null,
    status: "Active",
    isCurrent: true
  },
  {
    id: "CTR-2024-005",
    _id: "CTR-2024-005",
    contractName: "Junior Frontend Developer Agreement",
    employeeId: "EMP-1005",
    employeeName: "Amina Diallo",
    jobPosition: "Junior Frontend Developer",
    department: "Engineering",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    wage: 78000,
    wageType: "Monthly",
    startDate: "2024-01-15",
    endDate: null,
    status: "Active",
    isCurrent: true
  },
  {
    id: "CTR-2023-006",
    _id: "CTR-2023-006",
    contractName: "Enterprise Sales Director Agreement",
    employeeId: "EMP-1006",
    employeeName: "Lucas Silva",
    jobPosition: "Enterprise Sales Director",
    department: "Sales & Marketing",
    salaryStructureId: "STRUC-SALES-01",
    salaryStructureName: "Sales & Commercial Structure",
    wage: 135000,
    wageType: "Monthly",
    startDate: "2023-05-20",
    endDate: null,
    status: "Active",
    isCurrent: true
  },
  {
    id: "CTR-2024-007",
    _id: "CTR-2024-007",
    contractName: "Marketing Specialist 1-Year Term",
    employeeId: "EMP-1007",
    employeeName: "Chloe Bennett",
    jobPosition: "Marketing Specialist",
    department: "Sales & Marketing",
    salaryStructureId: "STRUC-SALES-01",
    salaryStructureName: "Sales & Commercial Structure",
    wage: 72000,
    wageType: "Monthly",
    startDate: "2024-02-01",
    endDate: "2026-09-30", // Expiring soon!
    status: "Active",
    isCurrent: true
  },
  // Historical contract
  {
    id: "CTR-2021-000",
    _id: "CTR-2021-000",
    contractName: "Senior Software Engineer Initial Term",
    employeeId: "EMP-1001",
    employeeName: "Sarah Jenkins",
    jobPosition: "Senior Software Engineer",
    department: "Engineering",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    wage: 120000,
    wageType: "Monthly",
    startDate: "2021-01-15",
    endDate: "2023-03-14",
    status: "Expired",
    isCurrent: false
  }
];

export const INITIAL_SCHEDULES = [
  {
    id: "WS-STD-40",
    _id: "WS-STD-40",
    scheduleCode: "WS-STD-40",
    name: "Standard 40h (Mon-Fri)",
    weeklyHours: 40,
    workDaysPerWeek: 5,
    isDefault: true,
    shifts: [
      { day: "Monday", start: "09:00", end: "17:30", breakHours: 0.5, hours: 8 },
      { day: "Tuesday", start: "09:00", end: "17:30", breakHours: 0.5, hours: 8 },
      { day: "Wednesday", start: "09:00", end: "17:30", breakHours: 0.5, hours: 8 },
      { day: "Thursday", start: "09:00", end: "17:30", breakHours: 0.5, hours: 8 },
      { day: "Friday", start: "09:00", end: "17:30", breakHours: 0.5, hours: 8 },
      { day: "Saturday", start: "00:00", end: "00:00", breakHours: 0, hours: 0 },
      { day: "Sunday", start: "00:00", end: "00:00", breakHours: 0, hours: 0 }
    ]
  },
  {
    id: "WS-FLEX-35",
    _id: "WS-FLEX-35",
    scheduleCode: "WS-FLEX-35",
    name: "Flexible 35h Core",
    weeklyHours: 35,
    workDaysPerWeek: 5,
    isDefault: false,
    shifts: [
      { day: "Monday", start: "09:30", end: "17:00", breakHours: 0.5, hours: 7 },
      { day: "Tuesday", start: "09:30", end: "17:00", breakHours: 0.5, hours: 7 },
      { day: "Wednesday", start: "09:30", end: "17:00", breakHours: 0.5, hours: 7 },
      { day: "Thursday", start: "09:30", end: "17:00", breakHours: 0.5, hours: 7 },
      { day: "Friday", start: "09:30", end: "17:00", breakHours: 0.5, hours: 7 },
      { day: "Saturday", start: "00:00", end: "00:00", breakHours: 0, hours: 0 },
      { day: "Sunday", start: "00:00", end: "00:00", breakHours: 0, hours: 0 }
    ]
  }
];

export const INITIAL_ATTENDANCE = [
  {
    id: "ATT-2026-0901",
    _id: "ATT-2026-0901",
    employeeId: "EMP-1001",
    employeeCode: "EMP-1001",
    employeeName: "Sarah Jenkins",
    date: "2026-09-01",
    checkIn: "08:58",
    checkOut: "17:32",
    workedHours: 8.0,
    status: "Present",
    isException: false,
    correctionReason: null
  },
  {
    id: "ATT-2026-0902",
    _id: "ATT-2026-0902",
    employeeId: "EMP-1002",
    employeeCode: "EMP-1002",
    employeeName: "David Kim",
    date: "2026-09-01",
    checkIn: "09:18",
    checkOut: "17:35",
    workedHours: 7.8,
    status: "Late",
    isException: true,
    correctionReason: "Transit subway delay on line 2"
  },
  {
    id: "ATT-2026-0903",
    _id: "ATT-2026-0903",
    employeeId: "EMP-1003",
    employeeCode: "EMP-1003",
    employeeName: "Elena Rostova",
    date: "2026-09-01",
    checkIn: "09:00",
    checkOut: "17:05",
    workedHours: 7.5,
    status: "Present",
    isException: false,
    correctionReason: null
  },
  {
    id: "ATT-2026-0904",
    _id: "ATT-2026-0904",
    employeeId: "EMP-1004",
    employeeCode: "EMP-1004",
    employeeName: "Marcus Vance",
    date: "2026-09-01",
    checkIn: "08:45",
    checkOut: "18:15",
    workedHours: 9.0,
    status: "Overtime",
    isException: false,
    correctionReason: null
  },
  {
    id: "ATT-2026-0905",
    _id: "ATT-2026-0905",
    employeeId: "EMP-1005",
    employeeCode: "EMP-1005",
    employeeName: "Amina Diallo",
    date: "2026-09-01",
    checkIn: "09:05",
    checkOut: null, // Missing checkout
    workedHours: 4.5,
    status: "Missing Checkout",
    isException: true,
    correctionReason: null
  },
  {
    id: "ATT-2026-0906",
    _id: "ATT-2026-0906",
    employeeId: "EMP-1006",
    employeeCode: "EMP-1006",
    employeeName: "Lucas Silva",
    date: "2026-09-01",
    checkIn: "09:00",
    checkOut: "17:30",
    workedHours: 8.0,
    status: "Present",
    isException: false,
    correctionReason: null
  },
  {
    id: "ATT-2026-0907",
    _id: "ATT-2026-0907",
    employeeId: "EMP-1007",
    employeeCode: "EMP-1007",
    employeeName: "Chloe Bennett",
    date: "2026-09-01",
    checkIn: "09:12",
    checkOut: "17:00",
    workedHours: 7.3,
    status: "Present",
    isException: false,
    correctionReason: null
  }
];

export const INITIAL_TIME_OFF_TYPES = [
  { id: "TOT-1", _id: "TOT-1", name: "Annual Leave", code: "AL", unit: "Days", allocationPolicy: "20 days / year", isPaid: true, color: "#10b981", requiresApproval: true, status: "Active", description: "Paid vacation and personal time off entitlement" },
  { id: "TOT-2", _id: "TOT-2", name: "Sick Leave", code: "SL", unit: "Days", allocationPolicy: "12 days / year", isPaid: true, color: "#f59e0b", requiresApproval: true, status: "Active", description: "Paid medical, convalescence and health recovery days" },
  { id: "TOT-3", _id: "TOT-3", name: "Parental Leave", code: "PL", unit: "Days", allocationPolicy: "30 days / year", isPaid: true, color: "#8b5cf6", requiresApproval: true, status: "Active", description: "Paid parental transition, bonding and family childcare" },
  { id: "TOT-4", _id: "TOT-4", name: "Unpaid Sabbatical", code: "US", unit: "Days", allocationPolicy: "No allocation required", isPaid: false, color: "#64748b", requiresApproval: true, status: "Active", description: "Extended unpaid career break and academic study sabbatical" },
  { id: "TOT-5", _id: "TOT-5", name: "Bereavement Leave", code: "BL", unit: "Days", allocationPolicy: "5 days / year", isPaid: true, color: "#ec4899", requiresApproval: false, status: "Active", description: "Compassionate leave for bereavement and family emergencies" }
];

export const INITIAL_ALLOCATIONS = [
  { id: "ALC-1", employeeId: "EMP-1001", employeeName: "Sarah Jenkins", department: "Engineering", typeName: "Annual Leave", allocated: 20, taken: 8, remaining: 12, validity: "2026-12-31", status: "Active" },
  { id: "ALC-2", employeeId: "EMP-1002", employeeName: "David Kim", department: "Product & Design", typeName: "Annual Leave", allocated: 20, taken: 6, remaining: 14, validity: "2026-12-31", status: "Active" },
  { id: "ALC-3", employeeId: "EMP-1003", employeeName: "Elena Rostova", department: "People & HR", typeName: "Sick Leave", allocated: 12, taken: 2, remaining: 10, validity: "2026-12-31", status: "Active" },
  { id: "ALC-4", employeeId: "EMP-1004", employeeName: "Marcus Vance", department: "Engineering", typeName: "Annual Leave", allocated: 25, taken: 4, remaining: 21, validity: "2026-12-31", status: "Active" },
  { id: "ALC-5", employeeId: "EMP-1005", employeeName: "Amina Diallo", department: "Engineering", typeName: "Annual Leave", allocated: 18, taken: 3, remaining: 15, validity: "2026-12-31", status: "Active" },
  { id: "ALC-6", employeeId: "EMP-1006", employeeName: "Lucas Silva", department: "Sales & Marketing", typeName: "Annual Leave", allocated: 20, taken: 5, remaining: 15, validity: "2026-12-31", status: "Active" },
  { id: "ALC-7", employeeId: "EMP-1007", employeeName: "Chloe Bennett", department: "Sales & Marketing", typeName: "Annual Leave", allocated: 15, taken: 5, remaining: 10, validity: "2026-12-31", status: "Active" },
  { id: "ALC-8", employeeId: "EMP-1008", employeeName: "Victor Vance", department: "Legal & Compliance", typeName: "Annual Leave", allocated: 18, taken: 6, remaining: 12, validity: "2026-12-31", status: "Active" },
  { id: "ALC-9", employeeId: "EMP-1009", employeeName: "Kavita Rao", department: "Engineering", typeName: "Annual Leave", allocated: 20, taken: 4, remaining: 16, validity: "2026-12-31", status: "Active" },
  { id: "ALC-10", employeeId: "EMP-1010", employeeName: "Ethan Cole", department: "Sales & Marketing", typeName: "Sick Leave", allocated: 10, taken: 2, remaining: 8, validity: "2026-12-31", status: "Active" },
  { id: "ALC-11", employeeId: "EMP-1011", employeeName: "Maya Lin", department: "Product & Design", typeName: "Annual Leave", allocated: 18, taken: 4, remaining: 14, validity: "2026-12-31", status: "Active" },
  { id: "ALC-12", employeeId: "EMP-1012", employeeName: "Carlos Sanchez", department: "Operations", typeName: "Annual Leave", allocated: 16, taken: 4, remaining: 12, validity: "2026-12-31", status: "Active" },
  { id: "ALC-13", employeeId: "EMP-1013", employeeName: "Siddharth Nair", department: "Finance", typeName: "Annual Leave", allocated: 22, taken: 4, remaining: 18, validity: "2026-12-31", status: "Active" },
  { id: "ALC-14", employeeId: "EMP-1014", employeeName: "Rachel Green", department: "Finance", typeName: "Annual Leave", allocated: 20, taken: 4, remaining: 16, validity: "2026-12-31", status: "Active" },
  { id: "ALC-15", employeeId: "EMP-1015", employeeName: "Fatima Zahra", department: "Engineering", typeName: "Parental Leave", allocated: 30, taken: 10, remaining: 20, validity: "2026-12-31", status: "Active" }
];

export const INITIAL_TIME_OFF_REQUESTS = [
  // 11 PENDING REQUESTS (Awaiting HR Decision)
  {
    id: "REQ-2026-002",
    _id: "REQ-2026-002",
    employeeId: "EMP-1002",
    employeeName: "David Kim",
    jobPosition: "Senior Product Designer",
    department: "Product & Design",
    timeOffType: "Annual Leave",
    startDate: "2026-09-22",
    endDate: "2026-09-26",
    duration: 5,
    durationUnit: "days",
    reason: "Design conference keynote + personal holiday",
    currentBalance: 14,
    status: "Pending",
    appliedDate: "2026-09-03"
  },
  {
    id: "REQ-2026-003",
    _id: "REQ-2026-003",
    employeeId: "EMP-1003",
    employeeName: "Elena Rostova",
    jobPosition: "Talent Acquisition Lead",
    department: "People & HR",
    timeOffType: "Sick Leave",
    startDate: "2026-09-08",
    endDate: "2026-09-09",
    duration: 2,
    durationUnit: "days",
    reason: "Medical procedure appointment recovery",
    currentBalance: 10,
    status: "Pending",
    appliedDate: "2026-09-04"
  },
  {
    id: "REQ-2026-005",
    _id: "REQ-2026-005",
    employeeId: "EMP-1005",
    employeeName: "Amina Diallo",
    jobPosition: "Junior Frontend Developer",
    department: "Engineering",
    timeOffType: "Annual Leave",
    startDate: "2026-09-28",
    endDate: "2026-09-30",
    duration: 3,
    durationUnit: "days",
    reason: "Family gathering and cultural holiday",
    currentBalance: 15,
    status: "Pending",
    appliedDate: "2026-09-04"
  },
  {
    id: "REQ-2026-006",
    _id: "REQ-2026-006",
    employeeId: "EMP-1006",
    employeeName: "Lucas Silva",
    jobPosition: "Enterprise Sales Director",
    department: "Sales & Marketing",
    timeOffType: "Annual Leave",
    startDate: "2026-09-10",
    endDate: "2026-09-12",
    duration: 3,
    durationUnit: "days",
    reason: "Personal travel and family commitment",
    currentBalance: 15,
    status: "Pending",
    appliedDate: "2026-09-02"
  },
  {
    id: "REQ-2026-007",
    _id: "REQ-2026-007",
    employeeId: "EMP-1007",
    employeeName: "Chloe Bennett",
    jobPosition: "Marketing Specialist",
    department: "Sales & Marketing",
    timeOffType: "Annual Leave",
    startDate: "2026-09-18",
    endDate: "2026-09-22",
    duration: 5,
    durationUnit: "days",
    reason: "Attending creative marketing summit and personal days",
    currentBalance: 10,
    status: "Pending",
    appliedDate: "2026-09-05"
  },
  {
    id: "REQ-2026-008",
    _id: "REQ-2026-008",
    employeeId: "EMP-1008",
    employeeName: "Victor Vance",
    jobPosition: "Legal Counsel",
    department: "Legal & Compliance",
    timeOffType: "Annual Leave",
    startDate: "2026-09-14",
    endDate: "2026-09-16",
    duration: 3,
    durationUnit: "days",
    reason: "Annual family reunion and travel",
    currentBalance: 12,
    status: "Pending",
    appliedDate: "2026-09-01"
  },
  {
    id: "REQ-2026-009",
    _id: "REQ-2026-009",
    employeeId: "EMP-1009",
    employeeName: "Kavita Rao",
    jobPosition: "DevOps Engineer",
    department: "Engineering",
    timeOffType: "Annual Leave",
    startDate: "2026-09-21",
    endDate: "2026-09-25",
    duration: 5,
    durationUnit: "days",
    reason: "Cloud native symposium attendance + vacation",
    currentBalance: 16,
    status: "Pending",
    appliedDate: "2026-09-04"
  },
  {
    id: "REQ-2026-010",
    _id: "REQ-2026-010",
    employeeId: "EMP-1010",
    employeeName: "Ethan Cole",
    jobPosition: "Account Executive",
    department: "Sales & Marketing",
    timeOffType: "Sick Leave",
    startDate: "2026-09-07",
    endDate: "2026-09-08",
    duration: 2,
    durationUnit: "days",
    reason: "Severe migraine doctor mandated rest",
    currentBalance: 8,
    status: "Pending",
    appliedDate: "2026-09-05"
  },
  {
    id: "REQ-2026-011",
    _id: "REQ-2026-011",
    employeeId: "EMP-1011",
    employeeName: "Maya Lin",
    jobPosition: "UX Researcher",
    department: "Product & Design",
    timeOffType: "Annual Leave",
    startDate: "2026-09-15",
    endDate: "2026-09-17",
    duration: 3,
    durationUnit: "days",
    reason: "Short vacation and personal errands",
    currentBalance: 14,
    status: "Pending",
    appliedDate: "2026-09-03"
  },
  {
    id: "REQ-2026-012",
    _id: "REQ-2026-012",
    employeeId: "EMP-1012",
    employeeName: "Carlos Sanchez",
    jobPosition: "Operations Analyst",
    department: "Operations",
    timeOffType: "Annual Leave",
    startDate: "2026-09-24",
    endDate: "2026-09-26",
    duration: 3,
    durationUnit: "days",
    reason: "Family weekend trip across the state",
    currentBalance: 12,
    status: "Pending",
    appliedDate: "2026-09-04"
  },
  {
    id: "REQ-2026-013",
    _id: "REQ-2026-013",
    employeeId: "EMP-1013",
    employeeName: "Siddharth Nair",
    jobPosition: "Financial Analyst",
    department: "Finance",
    timeOffType: "Annual Leave",
    startDate: "2026-09-29",
    endDate: "2026-10-02",
    duration: 4,
    durationUnit: "days",
    reason: "Festival trip and hometown visit",
    currentBalance: 18,
    status: "Pending",
    appliedDate: "2026-09-05"
  },

  // 7 APPROVED REQUESTS (Approved this month)
  {
    id: "REQ-2026-001",
    _id: "REQ-2026-001",
    employeeId: "EMP-1001",
    employeeName: "Sarah Jenkins",
    jobPosition: "Staff Software Engineer",
    department: "Engineering",
    timeOffType: "Annual Leave",
    startDate: "2026-09-15",
    endDate: "2026-09-18",
    duration: 4,
    durationUnit: "days",
    reason: "Family wedding and travel out of state",
    currentBalance: 12,
    status: "Approved",
    appliedDate: "2026-08-28"
  },
  {
    id: "REQ-2026-004",
    _id: "REQ-2026-004",
    employeeId: "EMP-1004",
    employeeName: "Marcus Vance",
    jobPosition: "VP of Engineering & Ops",
    department: "Engineering",
    timeOffType: "Annual Leave",
    startDate: "2026-09-02",
    endDate: "2026-09-05",
    duration: 4,
    durationUnit: "days",
    reason: "Executive offsite leadership retreat",
    currentBalance: 21,
    status: "Approved",
    appliedDate: "2026-08-20"
  },
  {
    id: "REQ-2026-014",
    _id: "REQ-2026-014",
    employeeId: "EMP-1014",
    employeeName: "Rachel Green",
    jobPosition: "Senior Accountant",
    department: "Finance",
    timeOffType: "Annual Leave",
    startDate: "2026-09-08",
    endDate: "2026-09-11",
    duration: 4,
    durationUnit: "days",
    reason: "Cousin's college graduation celebration",
    currentBalance: 16,
    status: "Approved",
    appliedDate: "2026-08-25"
  },
  {
    id: "REQ-2026-015",
    _id: "REQ-2026-015",
    employeeId: "EMP-1015",
    employeeName: "Fatima Zahra",
    jobPosition: "Security Engineer",
    department: "Engineering",
    timeOffType: "Parental Leave",
    startDate: "2026-09-01",
    endDate: "2026-09-14",
    duration: 10,
    durationUnit: "days",
    reason: "Newborn childcare parental transition",
    currentBalance: 20,
    status: "Approved",
    appliedDate: "2026-08-15"
  },
  {
    id: "REQ-2026-016",
    _id: "REQ-2026-016",
    employeeId: "EMP-1016",
    employeeName: "Daniel Brooks",
    jobPosition: "Copywriter",
    department: "Sales & Marketing",
    timeOffType: "Sick Leave",
    startDate: "2026-09-03",
    endDate: "2026-09-04",
    duration: 2,
    durationUnit: "days",
    reason: "Viral flu and doctor recommended bedrest",
    currentBalance: 10,
    status: "Approved",
    appliedDate: "2026-09-03"
  },
  {
    id: "REQ-2026-017",
    _id: "REQ-2026-017",
    employeeId: "EMP-1017",
    employeeName: "Priya Patel",
    jobPosition: "Product Manager",
    department: "Product & Design",
    timeOffType: "Annual Leave",
    startDate: "2026-09-16",
    endDate: "2026-09-19",
    duration: 4,
    durationUnit: "days",
    reason: "Wedding anniversary getaway trip",
    currentBalance: 16,
    status: "Approved",
    appliedDate: "2026-08-30"
  },
  {
    id: "REQ-2026-018",
    _id: "REQ-2026-018",
    employeeId: "EMP-1018",
    employeeName: "Oliver Queen",
    jobPosition: "System Architect",
    department: "Engineering",
    timeOffType: "Annual Leave",
    startDate: "2026-09-09",
    endDate: "2026-09-12",
    duration: 4,
    durationUnit: "days",
    reason: "Camping and hiking expedition in national park",
    currentBalance: 14,
    status: "Approved",
    appliedDate: "2026-08-26"
  },

  // 2 REJECTED / REFUSED REQUESTS (Decisions this month)
  {
    id: "REQ-2026-019",
    _id: "REQ-2026-019",
    employeeId: "EMP-1019",
    employeeName: "James Wilson",
    jobPosition: "QA Test Engineer",
    department: "Engineering",
    timeOffType: "Annual Leave",
    startDate: "2026-09-01",
    endDate: "2026-09-08",
    duration: 6,
    durationUnit: "days",
    reason: "Unplanned international vacation trip",
    currentBalance: 18,
    status: "Refused",
    refusalReason: "Critical sprint milestone testing scheduled; QA team minimum staffing required for launch.",
    appliedDate: "2026-08-29"
  },
  {
    id: "REQ-2026-020",
    _id: "REQ-2026-020",
    employeeId: "EMP-1020",
    employeeName: "Zoe Taylor",
    jobPosition: "Backend Developer",
    department: "Engineering",
    timeOffType: "Annual Leave",
    startDate: "2026-09-15",
    endDate: "2026-09-22",
    duration: 6,
    durationUnit: "days",
    reason: "Music festival attendance and vacation",
    currentBalance: 15,
    status: "Refused",
    refusalReason: "Team overlap threshold reached: Sarah Jenkins is already approved for time off during these dates.",
    appliedDate: "2026-09-01"
  }
];

// ========================================================
// PAYROLL SPECIFIC DATA: SALARY RULES & STRUCTURES
// ========================================================

export const INITIAL_SALARY_RULES = [
  {
    id: "RULE-BASIC",
    code: "BASIC",
    name: "Basic Salary",
    category: "Basic",
    sequence: 10,
    computationType: "Percentage",
    amount: 50, // 50% of Contract Base Wage
    formula: "contract.wage * 0.50",
    description: "Primary fixed base salary component",
    active: true
  },
  {
    id: "RULE-HRA",
    code: "HRA",
    name: "House Rent Allowance",
    category: "Allowances",
    sequence: 20,
    computationType: "Percentage",
    amount: 25, // 25% of Contract Base Wage
    formula: "contract.wage * 0.25",
    description: "Housing assistance accommodation allowance",
    active: true
  },
  {
    id: "RULE-TRANSPORT",
    code: "TRANS",
    name: "Transport Allowance",
    category: "Allowances",
    sequence: 30,
    computationType: "Fixed Amount",
    amount: 3000,
    formula: "3000",
    description: "Standard monthly travel commute allowance",
    active: true
  },
  {
    id: "RULE-SPECIAL",
    code: "SPEC",
    name: "Special / Tech Allowance",
    category: "Allowances",
    sequence: 40,
    computationType: "Percentage",
    amount: 15,
    formula: "contract.wage * 0.15",
    description: "Performance, technical & executive operational stipend",
    active: true
  },
  {
    id: "RULE-GROSS",
    code: "GROSS",
    name: "Gross Salary",
    category: "Gross",
    sequence: 50,
    computationType: "Formula",
    amount: 0,
    formula: "BASIC + HRA + TRANS + SPEC",
    description: "Sum total of all earnings before statutory deductions",
    active: true
  },
  {
    id: "RULE-PF",
    code: "PF",
    name: "Provident Fund / Social Security",
    category: "Deductions",
    sequence: 60,
    computationType: "Percentage",
    amount: 12, // 12% of Basic
    formula: "BASIC * 0.12",
    description: "Employee retirement and social security contribution",
    active: true
  },
  {
    id: "RULE-PTAX",
    code: "PTAX",
    name: "Professional Tax",
    category: "Deductions",
    sequence: 70,
    computationType: "Fixed Amount",
    amount: 200,
    formula: "200",
    description: "Jurisdiction statutory employment levy",
    active: true
  },
  {
    id: "RULE-TDS",
    code: "TDS",
    name: "Income Tax (TDS)",
    category: "Deductions",
    sequence: 80,
    computationType: "Percentage",
    amount: 10, // 10% of Gross
    formula: "GROSS * 0.10",
    description: "Withholding tax deducted at source",
    active: true
  },
  {
    id: "RULE-NET",
    code: "NET",
    name: "Net Salary",
    category: "Net",
    sequence: 90,
    computationType: "Formula",
    amount: 0,
    formula: "GROSS - (PF + PTAX + TDS)",
    description: "Final take-home pay disbursed to employee bank account",
    active: true
  }
];

export const INITIAL_SALARY_STRUCTURES = [
  {
    id: "STRUC-ENG-01",
    name: "Engineering & Tech Structure",
    code: "ENG-TECH",
    active: true,
    description: "Tailored for software engineers, architects, and technical staff",
    ruleIds: [
      "RULE-BASIC",
      "RULE-HRA",
      "RULE-TRANSPORT",
      "RULE-SPECIAL",
      "RULE-GROSS",
      "RULE-PF",
      "RULE-PTAX",
      "RULE-TDS",
      "RULE-NET"
    ]
  },
  {
    id: "STRUC-EXEC-01",
    name: "Standard Professional Structure",
    code: "STD-PROF",
    active: true,
    description: "General enterprise structure for Product, People, and Operations",
    ruleIds: [
      "RULE-BASIC",
      "RULE-HRA",
      "RULE-TRANSPORT",
      "RULE-GROSS",
      "RULE-PF",
      "RULE-PTAX",
      "RULE-TDS",
      "RULE-NET"
    ]
  },
  {
    id: "STRUC-SALES-01",
    name: "Sales & Commercial Structure",
    code: "SALES-COMM",
    active: true,
    description: "Commission and milestone aligned structure for revenue teams",
    ruleIds: [
      "RULE-BASIC",
      "RULE-HRA",
      "RULE-TRANSPORT",
      "RULE-SPECIAL",
      "RULE-GROSS",
      "RULE-PF",
      "RULE-PTAX",
      "RULE-TDS",
      "RULE-NET"
    ]
  }
];

// ========================================================
// PAYRUNS & DETAILED PAYSLIPS
// ========================================================

export const INITIAL_PAYRUNS = [
  {
    id: "PR-2026-08",
    name: "August 2026 Regular Payrun",
    periodName: "August 2026",
    periodStart: "2026-08-01",
    periodEnd: "2026-08-31",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    status: "Paid", // Draft | Computed | Validated | Paid
    employeesCount: 5,
    payslipsCount: 5,
    totalGross: 625000,
    totalDeductions: 87500,
    totalNet: 537500,
    processedDate: "2026-08-31",
    paymentDate: "2026-09-01",
    notes: "Regular monthly payroll successfully settled and credited."
  },
  {
    id: "PR-2026-09",
    name: "September 2026 Regular Payrun",
    periodName: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    status: "Computed", // In review / awaiting validation
    employeesCount: 6,
    payslipsCount: 6,
    totalGross: 742000,
    totalDeductions: 103880,
    totalNet: 638120,
    processedDate: "2026-09-05",
    paymentDate: null,
    notes: "Requires attention before validation: 2 employees missing bank details."
  },
  {
    id: "PR-2026-09-COMM",
    name: "September 2026 Commercial Payrun",
    periodName: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    salaryStructureId: "STRUC-SALES-01",
    salaryStructureName: "Sales & Commercial Structure",
    status: "Draft",
    employeesCount: 2,
    payslipsCount: 0,
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
    processedDate: null,
    paymentDate: null,
    notes: "New payrun batch initiated."
  }
];

export const INITIAL_PAYSLIPS = [
  {
    id: "PS-2026-09-001",
    payrunId: "PR-2026-09",
    payrunName: "September 2026 Regular Payrun",
    periodName: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    employeeId: "EMP-1001",
    employeeCode: "EMP-1001",
    employeeName: "Sarah Jenkins",
    jobPosition: "Staff Software Engineer",
    department: "Engineering",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    contractWage: 145000,
    workedDays: 22,
    totalWorkDays: 22,
    status: "Computed",
    bankDetails: {
      accountHolder: "Sarah Jenkins",
      accountNumber: "987654321012",
      bankName: "Chase Bank",
      routingNumber: "021000021"
    },
    earnings: [
      { code: "BASIC", name: "Basic Salary", amount: 72500 },
      { code: "HRA", name: "House Rent Allowance", amount: 36250 },
      { code: "TRANS", name: "Transport Allowance", amount: 3000 },
      { code: "SPEC", name: "Special / Tech Allowance", amount: 21750 }
    ],
    gross: 133500,
    deductions: [
      { code: "PF", name: "Provident Fund (12% of Basic)", amount: 8700 },
      { code: "PTAX", name: "Professional Tax", amount: 200 },
      { code: "TDS", name: "Income Tax (TDS)", amount: 13350 }
    ],
    totalDeductions: 22250,
    net: 111250
  },
  {
    id: "PS-2026-09-002",
    payrunId: "PR-2026-09",
    payrunName: "September 2026 Regular Payrun",
    periodName: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    employeeId: "EMP-1002",
    employeeCode: "EMP-1002",
    employeeName: "David Kim",
    jobPosition: "Senior Product Designer",
    department: "Product & Design",
    salaryStructureId: "STRUC-EXEC-01",
    salaryStructureName: "Standard Professional Structure",
    contractWage: 125000,
    workedDays: 22,
    totalWorkDays: 22,
    status: "Computed",
    bankDetails: {
      accountHolder: "David Kim",
      accountNumber: "876543210987",
      bankName: "Bank of America",
      routingNumber: "121000358"
    },
    earnings: [
      { code: "BASIC", name: "Basic Salary", amount: 62500 },
      { code: "HRA", name: "House Rent Allowance", amount: 31250 },
      { code: "TRANS", name: "Transport Allowance", amount: 3000 }
    ],
    gross: 96750,
    deductions: [
      { code: "PF", name: "Provident Fund (12% of Basic)", amount: 7500 },
      { code: "PTAX", name: "Professional Tax", amount: 200 },
      { code: "TDS", name: "Income Tax (TDS)", amount: 9675 }
    ],
    totalDeductions: 17375,
    net: 79375
  },
  {
    id: "PS-2026-09-003",
    payrunId: "PR-2026-09",
    payrunName: "September 2026 Regular Payrun",
    periodName: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    employeeId: "EMP-1003",
    employeeCode: "EMP-1003",
    employeeName: "Elena Rostova",
    jobPosition: "Talent Acquisition Lead",
    department: "People & HR",
    salaryStructureId: "STRUC-EXEC-01",
    salaryStructureName: "Standard Professional Structure",
    contractWage: 98000,
    workedDays: 22,
    totalWorkDays: 22,
    status: "Computed",
    bankDetails: {
      accountHolder: "Elena Rostova",
      accountNumber: "765432109876",
      bankName: "Wells Fargo",
      routingNumber: "121000248"
    },
    earnings: [
      { code: "BASIC", name: "Basic Salary", amount: 49000 },
      { code: "HRA", name: "House Rent Allowance", amount: 24500 },
      { code: "TRANS", name: "Transport Allowance", amount: 3000 }
    ],
    gross: 76500,
    deductions: [
      { code: "PF", name: "Provident Fund (12% of Basic)", amount: 5880 },
      { code: "PTAX", name: "Professional Tax", amount: 200 },
      { code: "TDS", name: "Income Tax (TDS)", amount: 7650 }
    ],
    totalDeductions: 13730,
    net: 62770
  },
  {
    id: "PS-2026-09-004",
    payrunId: "PR-2026-09",
    payrunName: "September 2026 Regular Payrun",
    periodName: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    employeeId: "EMP-1004",
    employeeCode: "EMP-1004",
    employeeName: "Marcus Vance",
    jobPosition: "VP of Engineering & Ops",
    department: "Engineering",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    contractWage: 195000,
    workedDays: 22,
    totalWorkDays: 22,
    status: "Computed",
    bankDetails: {
      accountHolder: "Marcus Vance",
      accountNumber: "654321098765",
      bankName: "First Republic / Chase",
      routingNumber: "321070007"
    },
    earnings: [
      { code: "BASIC", name: "Basic Salary", amount: 97500 },
      { code: "HRA", name: "House Rent Allowance", amount: 48750 },
      { code: "TRANS", name: "Transport Allowance", amount: 3000 },
      { code: "SPEC", name: "Special / Tech Allowance", amount: 29250 }
    ],
    gross: 178500,
    deductions: [
      { code: "PF", name: "Provident Fund (12% of Basic)", amount: 11700 },
      { code: "PTAX", name: "Professional Tax", amount: 200 },
      { code: "TDS", name: "Income Tax (TDS)", amount: 17850 }
    ],
    totalDeductions: 29750,
    net: 148750
  },
  {
    id: "PS-2026-09-005",
    payrunId: "PR-2026-09",
    payrunName: "September 2026 Regular Payrun",
    periodName: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    employeeId: "EMP-1005",
    employeeCode: "EMP-1005",
    employeeName: "Amina Diallo",
    jobPosition: "Junior Frontend Developer",
    department: "Engineering",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    contractWage: 78000,
    workedDays: 22,
    totalWorkDays: 22,
    status: "Computed",
    bankDetails: null, // WARNING: MISSING BANK DETAILS!
    earnings: [
      { code: "BASIC", name: "Basic Salary", amount: 39000 },
      { code: "HRA", name: "House Rent Allowance", amount: 19500 },
      { code: "TRANS", name: "Transport Allowance", amount: 3000 },
      { code: "SPEC", name: "Special / Tech Allowance", amount: 11700 }
    ],
    gross: 73200,
    deductions: [
      { code: "PF", name: "Provident Fund (12% of Basic)", amount: 4680 },
      { code: "PTAX", name: "Professional Tax", amount: 200 },
      { code: "TDS", name: "Income Tax (TDS)", amount: 7320 }
    ],
    totalDeductions: 12200,
    net: 61000
  },
  {
    id: "PS-2026-09-006",
    payrunId: "PR-2026-09",
    payrunName: "September 2026 Regular Payrun",
    periodName: "September 2026",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    employeeId: "EMP-1006",
    employeeCode: "EMP-1006",
    employeeName: "Lucas Silva",
    jobPosition: "Enterprise Sales Director",
    department: "Sales & Marketing",
    salaryStructureId: "STRUC-SALES-01",
    salaryStructureName: "Sales & Commercial Structure",
    contractWage: 135000,
    workedDays: 22,
    totalWorkDays: 22,
    status: "Computed",
    bankDetails: {
      accountHolder: "Lucas Silva",
      accountNumber: "543210987654",
      bankName: "Citibank",
      routingNumber: "021000089"
    },
    earnings: [
      { code: "BASIC", name: "Basic Salary", amount: 67500 },
      { code: "HRA", name: "House Rent Allowance", amount: 33750 },
      { code: "TRANS", name: "Transport Allowance", amount: 3000 },
      { code: "SPEC", name: "Special / Tech Allowance", amount: 20250 }
    ],
    gross: 124500,
    deductions: [
      { code: "PF", name: "Provident Fund (12% of Basic)", amount: 8100 },
      { code: "PTAX", name: "Professional Tax", amount: 200 },
      { code: "TDS", name: "Income Tax (TDS)", amount: 12450 }
    ],
    totalDeductions: 20750,
    net: 103750
  },
  // Previous month payslips (August 2026 - Paid)
  {
    id: "PS-2026-08-001",
    payrunId: "PR-2026-08",
    payrunName: "August 2026 Regular Payrun",
    periodName: "August 2026",
    periodStart: "2026-08-01",
    periodEnd: "2026-08-31",
    employeeId: "EMP-1001",
    employeeCode: "EMP-1001",
    employeeName: "Sarah Jenkins",
    jobPosition: "Staff Software Engineer",
    department: "Engineering",
    salaryStructureId: "STRUC-ENG-01",
    salaryStructureName: "Engineering & Tech Structure",
    contractWage: 145000,
    workedDays: 22,
    totalWorkDays: 22,
    status: "Paid",
    bankDetails: {
      accountHolder: "Sarah Jenkins",
      accountNumber: "987654321012",
      bankName: "Chase Bank",
      routingNumber: "021000021"
    },
    earnings: [
      { code: "BASIC", name: "Basic Salary", amount: 72500 },
      { code: "HRA", name: "House Rent Allowance", amount: 36250 },
      { code: "TRANS", name: "Transport Allowance", amount: 3000 },
      { code: "SPEC", name: "Special / Tech Allowance", amount: 21750 }
    ],
    gross: 133500,
    deductions: [
      { code: "PF", name: "Provident Fund", amount: 8700 },
      { code: "PTAX", name: "Professional Tax", amount: 200 },
      { code: "TDS", name: "Income Tax (TDS)", amount: 13350 }
    ],
    totalDeductions: 22250,
    net: 111250
  }
];
