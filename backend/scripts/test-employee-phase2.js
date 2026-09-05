require('dotenv').config();

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}`;
const results = [];

const readCookie = (response) => {
  const header = response.headers.get('set-cookie') || '';
  const match = header.match(/peoplepay\.sid=([^;]+)/);
  return match ? match[1] : '';
};

const request = async (method, path, { body, cookie } = {}) => {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: `peoplepay.sid=${cookie}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  return {
    status: response.status,
    payload,
    cookie: readCookie(response) || cookie || '',
  };
};

const record = (name, method, path, expected, actual, extra = '') => {
  const pass = expected === actual;
  const line = {
    name,
    method,
    path,
    expected,
    actual,
    result: pass ? 'PASS' : 'FAIL',
      extra,
  };
  results.push(line);
  const note = extra ? ` | ${extra}` : '';
  console.log(`${line.result}  ${method} ${path}  expected ${expected} got ${actual}  ${name}${note}`);
  return pass;
};

const stamp = Date.now().toString().slice(-6);
const day = String((Number(stamp) % 28) + 1).padStart(2, '0');

const run = async () => {
  const hrEmail = process.env.HR_MANAGER_EMAIL;
  const hrPassword = process.env.HR_MANAGER_PASSWORD;
  const employeeEmail = process.env.EMPLOYEE_EMAIL;
  const employeePassword = process.env.EMPLOYEE_PASSWORD;

  const hrLogin = await request('POST', '/api/auth/login', {
    body: { email: hrEmail, password: hrPassword },
  });
  if (hrLogin.status !== 200) {
    throw new Error(`HR login failed: ${hrLogin.status} ${JSON.stringify(hrLogin.payload)}`);
  }
  const hrCookie = hrLogin.cookie;

  const existing = await request('GET', `/api/hr/employees?search=${encodeURIComponent(employeeEmail)}`, {
    cookie: hrCookie,
  });
  let employeeA = (existing.payload.data || []).find((row) => row.email === employeeEmail);

  if (!employeeA) {
    const created = await request('POST', '/api/hr/employees', {
      cookie: hrCookie,
      body: {
        employeeCode: `EMPA${stamp}`,
        firstName: 'Phase',
        lastName: 'Employee',
        email: employeeEmail,
        department: 'Operations',
        jobPosition: 'Analyst',
      },
    });
    if (![200, 201].includes(created.status)) {
      throw new Error(`Could not create employee A: ${created.status} ${JSON.stringify(created.payload)}`);
    }
    employeeA = created.payload.data;
  }

  const employeeBRes = await request('POST', '/api/hr/employees', {
    cookie: hrCookie,
    body: {
      employeeCode: `EMPB${stamp}`,
      firstName: 'Other',
      lastName: 'Worker',
      email: `other.${stamp}@peoplepay360.local`,
      department: 'Operations',
      jobPosition: 'Specialist',
    },
  });
  if (![200, 201].includes(employeeBRes.status)) {
    throw new Error(`Could not create employee B: ${employeeBRes.status} ${JSON.stringify(employeeBRes.payload)}`);
  }
  const employeeB = employeeBRes.payload.data;

  const typeRes = await request('POST', '/api/hr/time-off/types', {
    cookie: hrCookie,
    body: {
      typeCode: `AL${stamp}`,
      name: 'Annual Leave Test',
      unit: 'days',
      requiresAllocation: false,
      requiresApproval: true,
    },
  });
  if (![200, 201].includes(typeRes.status)) {
    throw new Error(`Could not create time off type: ${typeRes.status} ${JSON.stringify(typeRes.payload)}`);
  }
  const leaveType = typeRes.payload.data;

  const allocRes = await request('POST', `/api/hr/employees/${employeeA.employeeCode}/time-off/allocations`, {
    cookie: hrCookie,
    body: {
      timeOffType: leaveType.typeCode,
      allocated: 10,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      status: 'approved',
    },
  });
  if (![200, 201].includes(allocRes.status)) {
    throw new Error(`Could not create allocation: ${allocRes.status} ${JSON.stringify(allocRes.payload)}`);
  }

  const empLogin = await request('POST', '/api/auth/login', {
    body: { email: employeeEmail, password: employeePassword },
  });
  if (empLogin.status !== 200) {
    throw new Error(`Employee login failed: ${empLogin.status} ${JSON.stringify(empLogin.payload)}`);
  }
  const empCookie = empLogin.cookie;

  const ownProfileHr = await request('GET', `/api/hr/employees/${employeeA.employeeCode}`, { cookie: hrCookie });
  record('HR own/any employee profile', 'GET', `/api/hr/employees/${employeeA.employeeCode}`, 200, ownProfileHr.status);

  const ownProfileEmp = await request('GET', '/api/me/profile', { cookie: empCookie });
  record(
    'Employee own profile',
    'GET',
    '/api/me/profile',
    200,
    ownProfileEmp.status,
    ownProfileEmp.payload?.data?.employeeCode
  );
  if (ownProfileEmp.payload?.data?.employeeCode && ownProfileEmp.payload.data.employeeCode !== employeeA.employeeCode) {
    record('Employee profile is self-scoped', 'GET', '/api/me/profile', 200, 500, 'returned another employee');
  }

  const otherProfileHr = await request('GET', `/api/hr/employees/${employeeB.employeeCode}`, { cookie: hrCookie });
  record('HR other employee profile', 'GET', `/api/hr/employees/${employeeB.employeeCode}`, 200, otherProfileHr.status);

  const otherProfileEmp = await request('GET', `/api/hr/employees/${employeeB.employeeCode}`, { cookie: empCookie });
  record('Employee other profile via HR API', 'GET', `/api/hr/employees/${employeeB.employeeCode}`, 403, otherProfileEmp.status);

  const ownAttHr = await request('GET', `/api/hr/employees/${employeeA.employeeCode}/attendance`, { cookie: hrCookie });
  record('HR own attendance', 'GET', `/api/hr/employees/${employeeA.employeeCode}/attendance`, 200, ownAttHr.status);

  const ownAttEmp = await request('GET', '/api/me/attendance', { cookie: empCookie });
  record('Employee own attendance', 'GET', '/api/me/attendance', 200, ownAttEmp.status);
  const ownAttIds = (ownAttEmp.payload.data || []).map((row) => String(row.employee?._id || row.employee));
  if (ownAttIds.some((id) => id && id !== String(employeeA._id))) {
    throw new Error('Employee attendance leaked another employee');
  }

  const otherAttHr = await request('GET', `/api/hr/employees/${employeeB.employeeCode}/attendance`, { cookie: hrCookie });
  record('HR other attendance', 'GET', `/api/hr/employees/${employeeB.employeeCode}/attendance`, 200, otherAttHr.status);

  const otherAttEmp = await request('GET', `/api/hr/employees/${employeeB.employeeCode}/attendance`, { cookie: empCookie });
  record('Employee other attendance', 'GET', `/api/hr/employees/${employeeB.employeeCode}/attendance`, 403, otherAttEmp.status);

  const createOwnHr = await request('POST', `/api/hr/employees/${employeeA.employeeCode}/attendance`, {
    cookie: hrCookie,
    body: { attendanceDate: `2099-05-${day}`, status: 'present' },
  });
  record('HR create attendance', 'POST', `/api/hr/employees/${employeeA.employeeCode}/attendance`, 201, createOwnHr.status, createOwnHr.payload.message);

  const createOwnEmp = await request('POST', '/api/me/attendance', {
    cookie: empCookie,
    body: { attendanceDate: `2099-01-02`, status: 'present', employee_id: employeeB._id },
  });
  record(
    'Employee create own attendance with foreign employee_id',
    'POST',
    '/api/me/attendance',
    403,
    createOwnEmp.status,
    createOwnEmp.payload.message
  );

  const queryProfile = await request('GET', `/api/me/profile?employeeCode=${employeeB.employeeCode}`, {
    cookie: empCookie,
  });
  record(
    'Employee GET own profile with other employeeCode query',
    'GET',
    `/api/me/profile?employeeCode=${employeeB.employeeCode}`,
    403,
    queryProfile.status
  );

  const queryAtt = await request('GET', `/api/me/attendance?employee_id=${employeeB._id}`, { cookie: empCookie });
  record(
    'Employee GET attendance with other employee_id query',
    'GET',
    `/api/me/attendance?employee_id=${employeeB._id}`,
    403,
    queryAtt.status
  );

  const queryAlloc = await request('GET', `/api/me/time-off/allocations?employee_id=${employeeB._id}`, {
    cookie: empCookie,
  });
  record(
    'Employee GET allocations with other employee_id query',
    'GET',
    `/api/me/time-off/allocations?employee_id=${employeeB._id}`,
    403,
    queryAlloc.status
  );

  const listEmployeesEmp = await request('GET', '/api/hr/employees', { cookie: empCookie });
  record('Employee list all employees', 'GET', '/api/hr/employees', 403, listEmployeesEmp.status);

  const createOwnEmpOk = await request('POST', '/api/me/attendance', {
    cookie: empCookie,
    body: { attendanceDate: `2099-06-${day}`, status: 'present' },
  });
  record('Employee create own attendance', 'POST', '/api/me/attendance', 201, createOwnEmpOk.status, createOwnEmpOk.payload.message);

  const createOtherEmp = await request('POST', `/api/hr/employees/${employeeB.employeeCode}/attendance`, {
    cookie: empCookie,
    body: { attendanceDate: `2099-01-04`, status: 'present' },
  });
  record('Employee create attendance for another via HR API', 'POST', `/api/hr/employees/${employeeB.employeeCode}/attendance`, 403, createOtherEmp.status);

  const balHr = await request('GET', `/api/hr/employees/${employeeA.employeeCode}/time-off/allocations`, { cookie: hrCookie });
  record('HR own leave balance', 'GET', `/api/hr/employees/${employeeA.employeeCode}/time-off/allocations`, 200, balHr.status);

  const balEmp = await request('GET', '/api/me/time-off/allocations', { cookie: empCookie });
  record('Employee own leave balance', 'GET', '/api/me/time-off/allocations', 200, balEmp.status);
  const leakedAlloc = (balEmp.payload.data || []).some(
    (row) => String(row.employee?._id || row.employee) !== String(employeeA._id)
  );
  if (leakedAlloc) {
    throw new Error('Employee allocations leaked another employee');
  }

  const otherBalEmp = await request('GET', `/api/hr/employees/${employeeB.employeeCode}/time-off/allocations`, {
    cookie: empCookie,
  });
  record('Employee other leave balance', 'GET', `/api/hr/employees/${employeeB.employeeCode}/time-off/allocations`, 403, otherBalEmp.status);

  const createReqHr = await request('POST', `/api/hr/employees/${employeeB.employeeCode}/time-off/requests`, {
    cookie: hrCookie,
    body: {
      timeOffType: leaveType.typeCode,
      startDate: '2099-02-01',
      endDate: '2099-02-01',
      reason: 'HR created for B',
    },
  });
  record('HR create time off request', 'POST', `/api/hr/employees/${employeeB.employeeCode}/time-off/requests`, 201, createReqHr.status);
  const requestBId = createReqHr.payload.data?._id;

  const createReqForeign = await request('POST', '/api/me/time-off/requests', {
    cookie: empCookie,
    body: {
      timeOffType: leaveType.typeCode,
      startDate: '2099-03-01',
      endDate: '2099-03-01',
      employee_id: employeeB._id,
      reason: 'try for B',
    },
  });
  record('Employee create request with foreign employee_id', 'POST', '/api/me/time-off/requests', 403, createReqForeign.status);

  const createReqOwn = await request('POST', '/api/me/time-off/requests', {
    cookie: empCookie,
    body: {
      timeOffType: leaveType.typeCode,
      startDate: '2099-03-02',
      endDate: '2099-03-02',
      reason: 'own leave',
    },
  });
  record('Employee create own time off request', 'POST', '/api/me/time-off/requests', 201, createReqOwn.status, createReqOwn.payload.message);
  const requestAId = createReqOwn.payload.data?._id;
  if (createReqOwn.payload.data?.employee?.employeeCode && createReqOwn.payload.data.employee.employeeCode !== employeeA.employeeCode) {
    throw new Error('Employee time-off request was associated with another employee');
  }

  const createReqOtherPath = await request('POST', `/api/hr/employees/${employeeB.employeeCode}/time-off/requests`, {
    cookie: empCookie,
    body: {
      timeOffType: leaveType.typeCode,
      startDate: '2099-03-03',
      endDate: '2099-03-03',
    },
  });
  record('Employee create request for another via HR API', 'POST', `/api/hr/employees/${employeeB.employeeCode}/time-off/requests`, 403, createReqOtherPath.status);

  const empApproveHrPath = await request('PUT', `/api/hr/time-off/requests/${requestBId}/approve`, { cookie: empCookie, body: {} });
  record('Employee approve via HR API', 'PUT', `/api/hr/time-off/requests/${requestBId}/approve`, 403, empApproveHrPath.status);

  const empApproveMe = await request('PUT', `/api/me/time-off/requests/${requestAId}/approve`, { cookie: empCookie, body: {} });
  record('Employee approve via me API', 'PUT', `/api/me/time-off/requests/${requestAId}/approve`, 403, empApproveMe.status);

  const empRefuse = await request('PUT', `/api/hr/time-off/requests/${requestBId}/refuse`, {
    cookie: empCookie,
    body: { reviewNotes: 'no' },
  });
  record('Employee refuse via HR API', 'PUT', `/api/hr/time-off/requests/${requestBId}/refuse`, 403, empRefuse.status);

  const empRefuseMe = await request('PUT', `/api/me/time-off/requests/${requestAId}/refuse`, {
    cookie: empCookie,
    body: { reviewNotes: 'no' },
  });
  record('Employee refuse via me API', 'PUT', `/api/me/time-off/requests/${requestAId}/refuse`, 403, empRefuseMe.status);

  const hrApprove = await request('PUT', `/api/hr/time-off/requests/${requestBId}/approve`, { cookie: hrCookie, body: {} });
  record('HR approve time off', 'PUT', `/api/hr/time-off/requests/${requestBId}/approve`, 200, hrApprove.status, hrApprove.payload.message);

  const refuseTarget = await request('POST', `/api/hr/employees/${employeeB.employeeCode}/time-off/requests`, {
    cookie: hrCookie,
    body: {
      timeOffType: leaveType.typeCode,
      startDate: '2099-04-01',
      endDate: '2099-04-01',
      reason: 'to refuse',
    },
  });
  const refuseId = refuseTarget.payload.data?._id;
  const hrRefuse = await request('PUT', `/api/hr/time-off/requests/${refuseId}/refuse`, {
    cookie: hrCookie,
    body: { reviewNotes: 'coverage gap' },
  });
  record('HR refuse time off', 'PUT', `/api/hr/time-off/requests/${refuseId}/refuse`, 200, hrRefuse.status, hrRefuse.payload.message);

  const contractsEmp = await request('GET', '/api/hr/contracts', { cookie: empCookie });
  record('Employee contracts', 'GET', '/api/hr/contracts', 403, contractsEmp.status);

  const contractsHr = await request('GET', '/api/hr/contracts', { cookie: hrCookie });
  record('HR contracts', 'GET', '/api/hr/contracts', 200, contractsHr.status);

  const schedulesEmp = await request('GET', '/api/hr/working-schedules', { cookie: empCookie });
  record('Employee working schedules', 'GET', '/api/hr/working-schedules', 403, schedulesEmp.status);

  const schedulesHr = await request('GET', '/api/hr/working-schedules', { cookie: hrCookie });
  record('HR working schedules', 'GET', '/api/hr/working-schedules', 200, schedulesHr.status);

  const payrollEmp = await request('GET', '/api/hr/payroll', { cookie: empCookie });
  record('Employee payroll', 'GET', '/api/hr/payroll', 403, payrollEmp.status);

  const payslipsEmp = await request('GET', '/api/hr/payslips', { cookie: empCookie });
  record('Employee payslips', 'GET', '/api/hr/payslips', 403, payslipsEmp.status);

  const salaryEmp = await request('GET', '/api/hr/salary-structures', { cookie: empCookie });
  record('Employee salary structures', 'GET', '/api/hr/salary-structures', 403, salaryEmp.status);

  const listHr = await request('GET', '/api/hr/employees', { cookie: hrCookie });
  record('HR employee list', 'GET', '/api/hr/employees', 200, listHr.status, `count=${listHr.payload.count}`);

  const updateEmpHr = await request('PUT', `/api/hr/employees/${employeeB.employeeCode}`, {
    cookie: hrCookie,
    body: { jobPosition: 'Lead Specialist' },
  });
  record('HR employee update', 'PUT', `/api/hr/employees/${employeeB.employeeCode}`, 200, updateEmpHr.status);

  const scheduleCreate = await request('POST', '/api/hr/working-schedules', {
    cookie: hrCookie,
    body: {
      scheduleCode: `WS${stamp}`,
      name: `Phase2 Schedule ${stamp}`,
      scheduleType: 'fixed',
      weeklyPattern: [{ day: 'monday', startTime: '09:00', endTime: '17:00', breakMinutes: 60 }],
    },
  });
  record('HR create working schedule', 'POST', '/api/hr/working-schedules', 201, scheduleCreate.status, scheduleCreate.payload.message);

  const contractCreate = await request('POST', `/api/hr/employees/${employeeB.employeeCode}/contracts`, {
    cookie: hrCookie,
    body: {
      contractCode: `CT${stamp}`,
      startDate: '2099-01-01',
      department: 'Operations',
      jobPosition: 'Lead Specialist',
      wageType: 'monthly',
      wageAmount: 5000,
      status: 'draft',
    },
  });
  record(
    'HR create contract',
    'POST',
    `/api/hr/employees/${employeeB.employeeCode}/contracts`,
    201,
    contractCreate.status,
    contractCreate.payload.message
  );

  const typesEmp = await request('GET', '/api/hr/time-off/types', { cookie: empCookie });
  record('Employee time-off types admin', 'GET', '/api/hr/time-off/types', 403, typesEmp.status);

  const salaryRulesEmp = await request('GET', '/api/hr/salary-rules', { cookie: empCookie });
  record('Employee salary rules', 'GET', '/api/hr/salary-rules', 403, salaryRulesEmp.status);

  const payrunsEmp = await request('GET', '/api/hr/payruns', { cookie: empCookie });
  record('Employee payruns', 'GET', '/api/hr/payruns', 403, payrunsEmp.status);

  const failed = results.filter((row) => row.result === 'FAIL');
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    process.exit(1);
  }
};

run().catch((error) => {
  console.error(`SETUP FAIL  ${error.message}`);
  process.exit(1);
});
