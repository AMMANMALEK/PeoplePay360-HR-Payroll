require('dotenv').config();

const BASE = `http://127.0.0.1:${process.env.PORT || 5000}`;

const cookieFrom = (response) => {
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
  return { status: response.status, payload, cookie: cookieFrom(response) || cookie || '' };
};

const assert = (ok, label, extra = '') => {
  if (!ok) {
    throw new Error(`${label}${extra ? ` | ${extra}` : ''}`);
  }
  console.log(`OK  ${label}${extra ? ` | ${extra}` : ''}`);
};

(async () => {
  const health = await request('GET', '/');
  assert(health.status === 200, 'GET /', health.payload.message);

  const hrLogin = await request('POST', '/api/auth/login', {
    body: { email: process.env.HR_MANAGER_EMAIL, password: process.env.HR_MANAGER_PASSWORD },
  });
  assert(hrLogin.status === 200, 'HR login', hrLogin.payload.data?.role);
  const hrCookie = hrLogin.cookie;

  const empLogin = await request('POST', '/api/auth/login', {
    body: { email: process.env.EMPLOYEE_EMAIL, password: process.env.EMPLOYEE_PASSWORD },
  });
  assert(empLogin.status === 200, 'Employee login', empLogin.payload.data?.role);
  assert(empLogin.payload.data?.employeeId, 'Employee session linked to employee record');
  const empCookie = empLogin.cookie;

  const me = await request('GET', '/api/auth/me', { cookie: empCookie });
  assert(me.status === 200 && me.payload.data?.role === 'EMPLOYEE', 'GET /api/auth/me');

  const checks = [
    ['GET', '/api/me/profile', 200],
    ['GET', '/api/me/attendance', 200],
    ['GET', '/api/me/time-off/allocations', 200],
    ['GET', '/api/me/time-off/types', 200],
    ['GET', '/api/me/time-off/requests', 200],
    ['GET', '/api/hr/employees', 403],
    ['GET', '/api/hr/contracts', 403],
    ['GET', '/api/hr/working-schedules', 403],
    ['GET', '/api/hr/payroll', 403],
  ];

  for (const [method, path, expected] of checks) {
    const result = await request(method, path, { cookie: empCookie });
    assert(
      result.status === expected,
      `${method} ${path}`,
      `expected ${expected} got ${result.status} ${result.payload.message || ''}`
    );
    if (expected === 200 && result.payload.success === false) {
      throw new Error(`${path} returned success:false`);
    }
  }

  const profile = await request('GET', '/api/me/profile', { cookie: empCookie });
  assert(Boolean(profile.payload.data?.employeeCode), 'Profile has employeeCode', profile.payload.data?.employeeCode);
  assert(!Array.isArray(profile.payload.data), 'Profile is a single employee record');

  const hrEmployees = await request('GET', '/api/hr/employees', { cookie: hrCookie });
  assert(hrEmployees.status === 200, 'HR GET /api/hr/employees', `count=${hrEmployees.payload.count}`);

  const hrMe = await request('GET', '/api/me/profile', { cookie: hrCookie });
  assert(hrMe.status === 403, 'HR blocked from /api/me/profile');

  console.log('\nSmoke checks passed. Backend APIs are ready.');
})().catch((error) => {
  console.error(`SMOKE FAIL  ${error.message}`);
  process.exit(1);
});
