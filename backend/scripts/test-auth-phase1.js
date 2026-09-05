require('dotenv').config();

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}`;

const readCookie = (response) => {
  const header = response.headers.get('set-cookie') || '';
  const match = header.match(/peoplepay\.sid=([^;]+)/);
  return match ? match[1] : '';
};

const request = async (path, { method = 'GET', body, cookie } = {}) => {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: `peoplepay.sid=${cookie}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload, cookie: readCookie(response) || cookie };
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
  console.log(`PASS  ${message}`);
};

const run = async () => {
  const hrEmail = process.env.HR_MANAGER_EMAIL;
  const hrPassword = process.env.HR_MANAGER_PASSWORD;
  const employeeEmail = process.env.EMPLOYEE_EMAIL;
  const employeePassword = process.env.EMPLOYEE_PASSWORD;

  const unauthenticated = await request('/api/hr/employees');
  assert(unauthenticated.status === 401, 'Unauthenticated HR request is rejected');

  const invalid = await request('/api/auth/login', {
    method: 'POST',
    body: { email: hrEmail, password: 'wrong-password' },
  });
  assert(invalid.status === 401, 'Invalid credentials are rejected');

  const hrLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: hrEmail, password: hrPassword, role: 'EMPLOYEE' },
  });
  assert(hrLogin.status === 200, 'HR Manager valid credentials succeed');
  assert(hrLogin.payload.data.role === 'HR_MANAGER', 'HR role is assigned by the server');
  assert(Boolean(hrLogin.cookie), 'HR session cookie is issued');

  const hrMe = await request('/api/auth/me', { cookie: hrLogin.cookie });
  assert(hrMe.status === 200 && hrMe.payload.data.role === 'HR_MANAGER', 'Authenticated HR Manager role is HR_MANAGER');

  const hrEmployees = await request('/api/hr/employees', { cookie: hrLogin.cookie });
  assert(hrEmployees.status === 200, 'Authenticated HR Manager can still access existing HR APIs');

  const employeeLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: employeeEmail, password: employeePassword, role: 'HR_MANAGER' },
  });
  assert(employeeLogin.status === 200, 'Employee valid credentials succeed');
  assert(
    employeeLogin.payload.data.role === 'EMPLOYEE',
    'Employee role is assigned by the server even if client sends HR_MANAGER'
  );

  const employeeMe = await request('/api/auth/me', { cookie: employeeLogin.cookie });
  assert(employeeMe.status === 200 && employeeMe.payload.data.role === 'EMPLOYEE', 'Authenticated Employee role is EMPLOYEE');

  const employeeHr = await request('/api/hr/employees', { cookie: employeeLogin.cookie });
  assert(employeeHr.status === 403, 'Employee cannot access HR administration APIs');

  console.log('All Phase 1 auth tests passed');
};

run().catch((error) => {
  console.error(`FAIL  ${error.message}`);
  process.exit(1);
});
