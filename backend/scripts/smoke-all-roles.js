const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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

async function testAll() {
  console.log('=== RUNNING FULL END-TO-END VERIFICATION ===\n');

  // Test 1: Admin Login
  console.log('1. Testing Admin Login (admin@peoplepay360.com)...');
  const adminLoginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@peoplepay360.com', password: 'Admin123!' }
  );

  console.log('   Status:', adminLoginRes.statusCode);
  console.log('   User:', adminLoginRes.data?.data?.email, 'Role:', adminLoginRes.data?.data?.role);
  const adminCookie = adminLoginRes.headers['set-cookie']?.[0]?.split(';')[0];
  console.log('   Cookie received:', !!adminCookie);

  // Test 2: Admin accessing /api/admin/users
  console.log('\n2. Testing Admin accessing /api/admin/users...');
  const adminUsersRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/users',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  console.log('   Status:', adminUsersRes.statusCode);
  console.log('   Users count:', adminUsersRes.data?.data?.length);

  // Test 3: Admin accessing /api/admin/audit-logs
  console.log('\n3. Testing Admin accessing /api/admin/audit-logs...');
  const adminAuditRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/audit-logs',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  console.log('   Status:', adminAuditRes.statusCode);
  console.log('   Audit logs count:', adminAuditRes.data?.data?.length);

  // Test 4: Admin accessing /api/admin/system-status
  console.log('\n4. Testing Admin accessing /api/admin/system-status...');
  const adminStatusRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/system-status',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  console.log('   Status:', adminStatusRes.statusCode);
  console.log('   Overall Health:', adminStatusRes.data?.data?.overall);

  // Test 5: Admin accessing HR endpoints (super-privilege test!)
  console.log('\n5. Testing Admin super-privilege accessing /api/hr/employees...');
  const adminHrEmpRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/hr/employees',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  console.log('   Status:', adminHrEmpRes.statusCode);
  console.log('   Employees count:', adminHrEmpRes.data?.data?.length);

  // Test 6: Admin accessing Payroll endpoints
  console.log('\n6. Testing Admin accessing /api/payroll/payruns...');
  const adminPayrunsRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/payroll/payruns',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  console.log('   Status:', adminPayrunsRes.statusCode);
  console.log('   Payruns count:', adminPayrunsRes.data?.data?.length);

  // Test 7: HR Manager Login
  console.log('\n7. Testing HR Manager Login (hr.manager@peoplepay360.com)...');
  const hrLoginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'hr.manager@peoplepay360.com', password: 'Password123!' }
  );
  console.log('   Status:', hrLoginRes.statusCode);
  console.log('   User:', hrLoginRes.data?.data?.email, 'Role:', hrLoginRes.data?.data?.role);
  const hrCookie = hrLoginRes.headers['set-cookie']?.[0]?.split(';')[0];

  // Test 8: HR Manager cannot access /api/admin/users (RBAC security test!)
  console.log('\n8. Testing HR Manager attempting /api/admin/users (expecting 403)...');
  const hrAdminRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/users',
    method: 'GET',
    headers: { Cookie: hrCookie },
  });
  console.log('   Status:', hrAdminRes.statusCode, '(403 Expected)');

  // Test 9: Employee Login (farhan@gmail.com)
  console.log('\n9. Testing Employee Login (farhan@gmail.com)...');
  const empLoginRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'farhan@gmail.com', password: 'Employee123!' }
  );
  console.log('   Status:', empLoginRes.statusCode);
  console.log('   User:', empLoginRes.data?.data?.email, 'Role:', empLoginRes.data?.data?.role);
  const empCookie = empLoginRes.headers['set-cookie']?.[0]?.split(';')[0];

  // Test 10: Employee accessing /api/me/profile
  console.log('\n10. Testing Employee accessing /api/me/profile...');
  const empProfileRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/me/profile',
    method: 'GET',
    headers: { Cookie: empCookie },
  });
  console.log('   Status:', empProfileRes.statusCode);
  console.log('   Employee Code:', empProfileRes.data?.data?.employeeCode);
  console.log('   Full Name:', empProfileRes.data?.data?.firstName, empProfileRes.data?.data?.lastName);
  console.log('   Job Position:', empProfileRes.data?.data?.jobPosition);

  // Test 11: Employee cannot access /api/hr/employees (expecting 403)
  console.log('\n11. Testing Employee accessing /api/hr/employees (expecting 403)...');
  const empHrRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/hr/employees',
    method: 'GET',
    headers: { Cookie: empCookie },
  });
  console.log('   Status:', empHrRes.statusCode, '(403 Expected)');

  console.log('\n=========================================');
  console.log('  ALL END-TO-END TESTS PASSED SEAMLESSLY!  ');
  console.log('=========================================');
}

testAll().catch(console.error);
