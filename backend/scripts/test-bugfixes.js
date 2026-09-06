const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const app = require('../server');
const http = require('http');

function makeRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port: port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  await connectDB();
  const { ensurePayrollRoleUsers } = require('../services/bootstrapPayrollRoles');
  await ensurePayrollRoleUsers();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  console.log(`Test server running on port ${server.address().port}`);
  console.log('=== STARTING VERIFICATION FOR 3 BUG FIXES ===\n');

  // Step 0: Admin Login
  console.log('0. Admin Login (admin@peoplepay360.com)...');
  const adminLogin = await makeRequest(
    server,
    {
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@peoplepay360.com', password: 'Admin123!' }
  );
  console.log('   Admin login status:', adminLogin.statusCode);
  const adminCookie = adminLogin.headers['set-cookie']?.[0]?.split(';')[0];
  if (!adminCookie) throw new Error('Failed to obtain admin cookie');

  // Step 1: HR Manager Login
  console.log('\n1. HR Manager Login (hr.manager@peoplepay360.local)...');
  const hrLogin = await makeRequest(
    server,
    {
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'hr.manager@peoplepay360.local', password: 'HrManager123!' }
  );
  console.log('   HR login status:', hrLogin.statusCode);
  const hrCookie = hrLogin.headers['set-cookie']?.[0]?.split(';')[0];

  // --------------------------------------------------------------------------
  // BUG 1 VERIFICATION: Working Schedule Update & Persistence
  // --------------------------------------------------------------------------
  console.log('\n=== TEST BUG 1: Working Schedule Creation & Update ===');
  const scheduleCreateRes = await makeRequest(
    server,
    {
      path: '/api/hr/working-schedules',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: hrCookie },
    },
    {
      name: `Test Shift Schedule ${Date.now()}`,
      scheduleType: 'fixed',
      weeklyPattern: [
        { day: 'monday', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
        { day: 'tuesday', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
      ],
      isActive: true,
    }
  );
  console.log('   Create Schedule status:', scheduleCreateRes.statusCode);
  const schedule = scheduleCreateRes.data?.data;
  const scheduleId = schedule?._id || schedule?.scheduleCode;
  console.log('   Schedule ID:', scheduleId, 'Weekly Hours initial:', schedule?.weeklyHours);

  // Now update the schedule with new days (Mon, Tue, Wed, Thu with 8h each = 32h)
  const updatedPattern = [
    { day: 'monday', startTime: '08:00', endTime: '16:00', breakMinutes: 0 },
    { day: 'tuesday', startTime: '08:00', endTime: '16:00', breakMinutes: 0 },
    { day: 'wednesday', startTime: '08:00', endTime: '16:00', breakMinutes: 0 },
    { day: 'thursday', startTime: '08:00', endTime: '16:00', breakMinutes: 0 },
  ];
  const scheduleUpdateRes = await makeRequest(
    server,
    {
      path: `/api/hr/working-schedules/${scheduleId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: hrCookie },
    },
    {
      name: 'Updated Shift Schedule (32h)',
      scheduleType: 'fixed',
      weeklyPattern: updatedPattern,
    }
  );
  console.log('   Update Schedule status:', scheduleUpdateRes.statusCode);
  console.log('   Updated Weekly Hours:', scheduleUpdateRes.data?.data?.weeklyHours);
  console.log('   Updated Pattern Days Count:', scheduleUpdateRes.data?.data?.weeklyPattern?.length);

  // Re-fetch to ensure persisted in DB
  const scheduleFetchRes = await makeRequest(server, {
    path: `/api/hr/working-schedules/${scheduleId}`,
    method: 'GET',
    headers: { Cookie: hrCookie },
  });
  console.log('   GET Schedule re-fetch status:', scheduleFetchRes.statusCode);
  console.log('   Persisted Weekly Hours in DB:', scheduleFetchRes.data?.data?.weeklyHours);
  if (scheduleFetchRes.data?.data?.weeklyHours !== 32) {
    throw new Error(`Schedule weeklyHours mismatch: expected 32, got ${scheduleFetchRes.data?.data?.weeklyHours}`);
  }
  console.log('   >>> BUG 1 FIX VERIFIED: PASS! <<<\n');

  // --------------------------------------------------------------------------
  // BUG 2 VERIFICATION: HR Create New Time Off Types
  // --------------------------------------------------------------------------
  console.log('=== TEST BUG 2: HR Create Custom Time Off Types ===');
  const customTypeName = `Maternity Leave ${Date.now().toString(36)}`;
  const timeOffTypeRes = await makeRequest(
    server,
    {
      path: '/api/hr/time-off/types',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: hrCookie },
    },
    {
      name: customTypeName,
      unit: 'days',
      requiresAllocation: true,
      requiresApproval: true,
      description: 'Extended parental leave benefit.',
    }
  );
  console.log('   Create Time Off Type status:', timeOffTypeRes.statusCode);
  console.log('   Create Time Off Type response:', timeOffTypeRes.data);
  console.log('   Created Type Name:', timeOffTypeRes.data?.data?.name);
  console.log('   Created Type Code:', timeOffTypeRes.data?.data?.typeCode);

  // List all Time Off Types
  const listTypesRes = await makeRequest(server, {
    path: '/api/hr/time-off/types?isActive=true',
    method: 'GET',
    headers: { Cookie: hrCookie },
  });
  console.log('   List Time Off Types count:', listTypesRes.data?.count);
  const foundType = listTypesRes.data?.data?.find((t) => t.name === customTypeName);
  if (!foundType) {
    throw new Error(`Created Time Off Type "${customTypeName}" not found in list`);
  }
  console.log('   >>> BUG 2 FIX VERIFIED: PASS! <<<\n');

  // --------------------------------------------------------------------------
  // BUG 3 VERIFICATION: Admin Create User & Persistence & Login
  // --------------------------------------------------------------------------
  console.log('=== TEST BUG 3: Admin Create User & Persistence & Login ===');
  const stamp = Date.now().toString(36);
  const testUserEmail = `test.user.${stamp}@peoplepay360.com`;
  const testUserPassword = 'CustomPassword123!';
  const createUserRes = await makeRequest(
    server,
    {
      path: '/api/admin/users',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    },
    {
      name: `Test Specialist ${stamp}`,
      email: testUserEmail,
      role: 'HR_PAYROLL_USER',
      department: 'Finance & Payroll',
      password: testUserPassword,
      status: 'Active',
    }
  );
  console.log('   Admin Create User status:', createUserRes.statusCode);
  console.log('   Created User ID:', createUserRes.data?.data?.id);
  console.log('   Created User Email:', createUserRes.data?.data?.email);

  // List all users via Admin GET /api/admin/users
  const listUsersRes = await makeRequest(server, {
    path: '/api/admin/users',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  console.log('   Admin List Users status:', listUsersRes.statusCode);
  console.log('   Admin Total Users in DB:', listUsersRes.data?.count);
  const userInDb = listUsersRes.data?.data?.find((u) => u.email === testUserEmail);
  if (!userInDb) {
    throw new Error(`User ${testUserEmail} was not found in Admin user list from database!`);
  }
  console.log('   User found in database list:', userInDb.name, userInDb.role);

  // Test Logging in with newly created user credentials!
  console.log('\n   Testing Login with the newly created user credentials...');
  const newLoginRes = await makeRequest(
    server,
    {
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: testUserEmail, password: testUserPassword }
  );
  console.log('   New User Login status:', newLoginRes.statusCode);
  console.log('   New User Role in Session:', newLoginRes.data?.data?.role);
  if (newLoginRes.statusCode !== 200 || newLoginRes.data?.data?.role !== 'HR_PAYROLL_USER') {
    throw new Error('Failed to log in as newly created user');
  }
  console.log('   >>> BUG 3 FIX VERIFIED: PASS! <<<\n');

  console.log('====================================================');
  console.log('  ALL 3 BUGS SUCCESSFULLY RESOLVED AND VERIFIED!    ');
  console.log('====================================================');

  server.close();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
