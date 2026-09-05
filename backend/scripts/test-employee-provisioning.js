require('dotenv').config();

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}`;
const DEFAULT_PASSWORD = process.env.EMPLOYEE_DEFAULT_PASSWORD || process.env.EMPLOYEE_PASSWORD || 'Employee123!';
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

const record = (name, expected, actual, extra = '') => {
  const pass = expected === actual;
  const row = {
    name,
    expected,
    actual,
    result: pass ? 'PASS' : 'FAIL',
    extra,
  };
  results.push(row);
  console.log(
    `${row.result}  ${name}  expected ${expected} got ${actual}${extra ? ` | ${extra}` : ''}`
  );
  return pass;
};

const stamp = Date.now().toString().slice(-6);
const day = String((Number(stamp) % 28) + 1).padStart(2, '0');

const run = async () => {
  const hrEmail = process.env.HR_MANAGER_EMAIL;
  const hrPassword = process.env.HR_MANAGER_PASSWORD;
  const emailA = `employeeA.${stamp}@example.com`;
  const emailB = `employeeB.${stamp}@example.com`;

  const hrLogin = await request('POST', '/api/auth/login', {
    body: { email: hrEmail, password: hrPassword },
  });
  record('HR Manager login', 200, hrLogin.status, hrLogin.payload.data?.role);
  if (hrLogin.status !== 200) {
    throw new Error(`HR login failed: ${JSON.stringify(hrLogin.payload)}`);
  }
  record('HR role is HR_MANAGER', 'HR_MANAGER', hrLogin.payload.data?.role);
  const hrCookie = hrLogin.cookie;

  const hrList = await request('GET', '/api/hr/employees', { cookie: hrCookie });
  record('HR can list employees', 200, hrList.status);

  const createA = await request('POST', '/api/hr/employees', {
    cookie: hrCookie,
    body: {
      employeeCode: `PROVA${stamp}`,
      firstName: 'Ada',
      lastName: 'Employee',
      email: emailA,
      department: 'Engineering',
      jobPosition: 'Analyst',
    },
  });
  record('HR creates Employee A', 201, createA.status, createA.payload.message);
  const employeeA = createA.payload.data;
  record(
    'Create A response has no password',
    false,
    Boolean(employeeA?.password || employeeA?.passwordHash)
  );

  const createB = await request('POST', '/api/hr/employees', {
    cookie: hrCookie,
    body: {
      employeeCode: `PROVB${stamp}`,
      firstName: 'Ben',
      lastName: 'Employee',
      email: emailB,
      department: 'Engineering',
      jobPosition: 'Specialist',
    },
  });
  record('HR creates Employee B', 201, createB.status, createB.payload.message);
  const employeeB = createB.payload.data;

  const duplicate = await request('POST', '/api/hr/employees', {
    cookie: hrCookie,
    body: {
      employeeCode: `PROVD${stamp}`,
      firstName: 'Dup',
      lastName: 'Email',
      email: emailA,
      department: 'Engineering',
      jobPosition: 'Analyst',
    },
  });
  record('Duplicate email rejected', 409, duplicate.status, duplicate.payload.message);

  const typeRes = await request('POST', '/api/hr/time-off/types', {
    cookie: hrCookie,
    body: {
      typeCode: `PV${stamp}`,
      name: 'Provisioning Leave',
      unit: 'days',
      requiresAllocation: false,
      requiresApproval: true,
    },
  });
  if (![200, 201].includes(typeRes.status)) {
    throw new Error(`Could not create time off type: ${JSON.stringify(typeRes.payload)}`);
  }
  const leaveType = typeRes.payload.data;

  const loginA = await request('POST', '/api/auth/login', {
    body: { email: emailA, password: DEFAULT_PASSWORD },
  });
  record('Employee A login', 200, loginA.status, loginA.payload.data?.role);
  record('Employee A role is EMPLOYEE', 'EMPLOYEE', loginA.payload.data?.role);
  record(
    'Employee A session bound to A',
    employeeA.employeeCode,
    loginA.payload.data?.employeeCode
  );
  const cookieA = loginA.cookie;

  const loginB = await request('POST', '/api/auth/login', {
    body: { email: emailB, password: DEFAULT_PASSWORD },
  });
  record('Employee B login', 200, loginB.status, loginB.payload.data?.role);
  record(
    'Employee B session bound to B',
    employeeB.employeeCode,
    loginB.payload.data?.employeeCode
  );
  const cookieB = loginB.cookie;

  const dashA = await request('GET', '/api/me/profile', { cookie: cookieA });
  record('Employee A dashboard/profile', 200, dashA.status, dashA.payload.data?.email);
  record('Employee A profile email', emailA.toLowerCase(), dashA.payload.data?.email);

  const dashB = await request('GET', '/api/me/profile', { cookie: cookieB });
  record('Employee B dashboard/profile', 200, dashB.status, dashB.payload.data?.email);
  record('Employee B profile email', emailB.toLowerCase(), dashB.payload.data?.email);

  const aSeesBProfile = await request('GET', `/api/hr/employees/${employeeB.employeeCode}`, {
    cookie: cookieA,
  });
  record('A → B profile via HR API', 403, aSeesBProfile.status);

  const aSeesBMe = await request('GET', `/api/me/profile?employeeCode=${employeeB.employeeCode}`, {
    cookie: cookieA,
  });
  record('A → B profile via query', 403, aSeesBMe.status);

  const aSeesBAttendanceHr = await request(
    'GET',
    `/api/hr/employees/${employeeB.employeeCode}/attendance`,
    { cookie: cookieA }
  );
  record('A → B attendance via HR API', 403, aSeesBAttendanceHr.status);

  const aSeesBAttendanceQuery = await request(
    'GET',
    `/api/me/attendance?employeeCode=${employeeB.employeeCode}`,
    { cookie: cookieA }
  );
  record('A → B attendance via query', 403, aSeesBAttendanceQuery.status);

  const aCreatesBAttendance = await request('POST', '/api/me/attendance', {
    cookie: cookieA,
    body: {
      employee_id: employeeB._id,
      employeeCode: employeeB.employeeCode,
      attendanceDate: `2026-08-${day}`,
      status: 'present',
    },
  });
  record('A creates B attendance', 403, aCreatesBAttendance.status);

  const aCreatesBTimeOff = await request('POST', '/api/me/time-off/requests', {
    cookie: cookieA,
    body: {
      employee_id: employeeB._id,
      employeeCode: employeeB.employeeCode,
      timeOffType: leaveType.typeCode || leaveType._id,
      startDate: `2026-09-${day}`,
      endDate: `2026-09-${day}`,
      reason: 'Isolation test',
    },
  });
  record('A creates B time off', 403, aCreatesBTimeOff.status);

  const aPayroll = await request('GET', '/api/payroll', { cookie: cookieA });
  const payrollOk = [401, 403, 404].includes(aPayroll.status);
  record('A cannot access payroll', true, payrollOk, `status ${aPayroll.status}`);

  const aContracts = await request('GET', '/api/hr/contracts', { cookie: cookieA });
  record('A → contracts', 403, aContracts.status);

  const aApprove = await request('PUT', '/api/me/time-off/requests/000000000000000000000000/approve', {
    cookie: cookieA,
  });
  record('A approve time off', 403, aApprove.status);

  const aApproveHr = await request('PUT', '/api/hr/time-off/requests/000000000000000000000000/approve', {
    cookie: cookieA,
  });
  record('A approve time off via HR API', 403, aApproveHr.status);

  const ownAttendance = await request('POST', '/api/me/attendance', {
    cookie: cookieA,
    body: {
      attendanceDate: `2026-07-${day}`,
      status: 'present',
    },
  });
  record('A can create own attendance', 201, ownAttendance.status);

  const hrContracts = await request('GET', '/api/hr/contracts', { cookie: hrCookie });
  record('HR can view contracts', 200, hrContracts.status);

  const hrSchedules = await request('GET', '/api/hr/working-schedules', { cookie: hrCookie });
  record('HR can view working schedules', 200, hrSchedules.status);

  const hrTimeOff = await request('GET', '/api/hr/time-off/requests', { cookie: hrCookie });
  record('HR can view time-off requests', 200, hrTimeOff.status);

  const hrEdit = await request('PUT', `/api/hr/employees/${employeeA.employeeCode}`, {
    cookie: hrCookie,
    body: {
      firstName: 'Ada',
      lastName: 'Updated',
      email: emailA,
      department: 'Engineering',
      jobPosition: 'Senior Analyst',
    },
  });
  record('HR can edit employee', 200, hrEdit.status);

  const stillA = await request('POST', '/api/auth/login', {
    body: { email: emailA, password: DEFAULT_PASSWORD },
  });
  record('Employee A login after HR edit', 200, stillA.status);

  const failed = results.filter((row) => row.result === 'FAIL');
  console.log('\n--- summary ---');
  console.log(`passed ${results.length - failed.length} / ${results.length}`);
  if (failed.length) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error(`FAIL  ${error.message}`);
  process.exit(1);
});
