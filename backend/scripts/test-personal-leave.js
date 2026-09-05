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
  results.push({ name, expected, actual, result: pass ? 'PASS' : 'FAIL', extra });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}  expected ${expected} got ${actual}${extra ? ` | ${extra}` : ''}`);
  return pass;
};

const remainingOf = (payload) => {
  if (payload.remaining != null) return payload.remaining;
  const allocation = payload.data?.allocation;
  if (allocation && typeof allocation === 'object') return allocation.remaining;
  return null;
};

const stamp = Date.now().toString().slice(-6);

const run = async () => {
  const hrLogin = await request('POST', '/api/auth/login', {
    body: { email: process.env.HR_MANAGER_EMAIL, password: process.env.HR_MANAGER_PASSWORD },
  });
  record('HR login', 200, hrLogin.status);
  const hrCookie = hrLogin.cookie;

  const emailA = `leaveA.${stamp}@example.com`;
  const emailB = `leaveB.${stamp}@example.com`;

  const createA = await request('POST', '/api/hr/employees', {
    cookie: hrCookie,
    body: {
      employeeCode: `LVA${stamp}`,
      firstName: 'Leave',
      lastName: 'Alpha',
      email: emailA,
      department: 'Engineering',
      jobPosition: 'Analyst',
    },
  });
  record('Create Employee A', 201, createA.status);
  const employeeA = createA.payload.data;

  const createB = await request('POST', '/api/hr/employees', {
    cookie: hrCookie,
    body: {
      employeeCode: `LVB${stamp}`,
      firstName: 'Leave',
      lastName: 'Beta',
      email: emailB,
      department: 'Engineering',
      jobPosition: 'Specialist',
    },
  });
  record('Create Employee B', 201, createB.status);
  const employeeB = createB.payload.data;

  const loginA = await request('POST', '/api/auth/login', {
    body: { email: emailA, password: DEFAULT_PASSWORD },
  });
  record('Employee A login', 200, loginA.status);
  const cookieA = loginA.cookie;

  const loginB = await request('POST', '/api/auth/login', {
    body: { email: emailB, password: DEFAULT_PASSWORD },
  });
  record('Employee B login', 200, loginB.status);
  const cookieB = loginB.cookie;

  const allocA = await request('GET', '/api/me/time-off/allocations', { cookie: cookieA });
  record('A annual allocation is 15', 15, allocA.payload.data?.[0]?.allocated);
  record('A remaining starts at 15', 15, allocA.payload.data?.[0]?.remaining);

  const types = await request('GET', '/api/me/time-off/types', { cookie: cookieA });
  const typeNames = (types.payload.data || []).map((row) => row.name);
  record('Only Personal Leave is available', true, typeNames.length === 1 && typeNames[0] === 'Personal Leave');

  const req1 = await request('POST', '/api/me/time-off/requests', {
    cookie: cookieA,
    body: { timeOffType: 'PERSONAL', startDate: '2026-06-01', endDate: '2026-06-03', reason: 'Test 1' },
  });
  record('TEST 1 request 3 days', 201, req1.status);
  record('TEST 1 status approved', 'approved', req1.payload.data?.status);
  record('TEST 1 remaining 12', 12, remainingOf(req1.payload));

  const req2 = await request('POST', '/api/me/time-off/requests', {
    cookie: cookieA,
    body: { timeOffType: 'PERSONAL', startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Test 2' },
  });
  record('TEST 2 request 5 days', 201, req2.status);
  record('TEST 2 remaining 7', 7, remainingOf(req2.payload));

  const req3 = await request('POST', '/api/me/time-off/requests', {
    cookie: cookieA,
    body: { timeOffType: 'PERSONAL', startDate: '2026-08-01', endDate: '2026-08-07', reason: 'Test 3' },
  });
  record('TEST 3 request 7 days', 201, req3.status);
  record('TEST 3 remaining 0', 0, remainingOf(req3.payload));

  const req4 = await request('POST', '/api/me/time-off/requests', {
    cookie: cookieA,
    body: { timeOffType: 'PERSONAL', startDate: '2026-09-01', endDate: '2026-09-01', reason: 'Test 4' },
  });
  record('TEST 4 insufficient balance rejected', 400, req4.status);
  record('TEST 4 remaining still 0', 0, req4.payload.remaining);

  const req5 = await request('POST', '/api/me/time-off/requests', {
    cookie: cookieA,
    body: {
      employee_id: employeeB._id,
      employeeCode: employeeB.employeeCode,
      timeOffType: 'PERSONAL',
      startDate: '2026-10-01',
      endDate: '2026-10-01',
    },
  });
  record('TEST 5 foreign employee_id', 403, req5.status);

  const req6 = await request('POST', '/api/me/time-off/requests', {
    cookie: cookieA,
    body: {
      timeOffType: 'PERSONAL',
      startDate: '2026-11-01',
      endDate: '2026-11-01',
      status: 'approved',
      duration: 1,
    },
  });
  record('TEST 6 client cannot force extra approved leave', 400, req6.status);

  const req7 = await request('PUT', '/api/me/time-off/requests/000000000000000000000000/approve', {
    cookie: cookieA,
  });
  record('TEST 7 employee approve endpoint', 403, req7.status);

  const hrView = await request('GET', `/api/hr/time-off/requests?employeeCode=${employeeA.employeeCode}`, {
    cookie: hrCookie,
  });
  record('TEST 8 HR can view A requests', 200, hrView.status);
  const latest = (hrView.payload.data || [])[0];
  record('TEST 8 latest status approved', 'approved', latest?.status);

  const allocB = await request('GET', '/api/me/time-off/allocations', { cookie: cookieB });
  record('TEST 9 B allocation 15', 15, allocB.payload.data?.[0]?.allocated);
  record('TEST 9 B remaining 15', 15, allocB.payload.data?.[0]?.remaining);

  const allocAAfter = await request('GET', '/api/me/time-off/allocations', { cookie: cookieA });
  record('TEST 10 A remaining still 0', 0, allocAAfter.payload.data?.[0]?.remaining);
  record('TEST 10 B remaining still 15', 15, allocB.payload.data?.[0]?.remaining);

  const yearChange = await request('POST', '/api/me/time-off/requests', {
    cookie: cookieA,
    body: { timeOffType: 'PERSONAL', startDate: '2027-01-01', endDate: '2027-01-01', reason: 'New year' },
  });
  record('Year change 2027 request approved', 201, yearChange.status);
  record('Year change 2027 remaining 14', 14, remainingOf(yearChange.payload));

  const hrEmployees = await request('GET', '/api/hr/employees', { cookie: hrCookie });
  record('HR can still list employees', 200, hrEmployees.status);
  const hrAttendance = await request('GET', '/api/hr/attendance', { cookie: hrCookie });
  record('HR can still view attendance', 200, hrAttendance.status);
  const hrContracts = await request('GET', '/api/hr/contracts', { cookie: hrCookie });
  record('HR can still view contracts', 200, hrContracts.status);
  const hrSchedules = await request('GET', '/api/hr/working-schedules', { cookie: hrCookie });
  record('HR can still view schedules', 200, hrSchedules.status);

  const failed = results.filter((row) => row.result === 'FAIL');
  console.log(`\npassed ${results.length - failed.length} / ${results.length}`);
  if (failed.length) process.exitCode = 1;
};

run().catch((error) => {
  console.error(`FAIL  ${error.message}`);
  process.exit(1);
});
