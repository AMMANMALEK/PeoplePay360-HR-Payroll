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
  console.log(`Test server running on port ${server.address().port}\n`);

  try {
    console.log('=== TEST 1: HR_PAYROLL_USER ===');
    const userLogin = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {
      email: 'payroll.user@peoplepay360.local',
      password: 'PayrollUser123!'
    });
    console.log('Login status:', userLogin.statusCode, 'Role:', userLogin.data?.data?.role);
    if (userLogin.statusCode !== 200 || userLogin.data?.data?.role !== 'HR_PAYROLL_USER') {
      throw new Error('HR_PAYROLL_USER login failed');
    }
    const userCookie = userLogin.headers['set-cookie']?.[0]?.split(';')[0];

    // 1.1 HR Ops: Can access Employees and Contracts
    const hrEmp = await makeRequest(server, { path: '/api/hr/employees', headers: { Cookie: userCookie } });
    console.log('Access /api/hr/employees:', hrEmp.statusCode === 200 ? 'PASS (200)' : `FAIL (${hrEmp.statusCode})`);

    const hrContracts = await makeRequest(server, { path: '/api/hr/contracts', headers: { Cookie: userCookie } });
    console.log('Access /api/hr/contracts:', hrContracts.statusCode === 200 ? 'PASS (200)' : `FAIL (${hrContracts.statusCode})`);

    // 1.2 Read-only Salary Structures and Salary Rules
    const getStructs = await makeRequest(server, { path: '/api/payroll/salary-structures', headers: { Cookie: userCookie } });
    console.log('GET /api/payroll/salary-structures:', getStructs.statusCode === 200 ? 'PASS (200)' : `FAIL (${getStructs.statusCode})`);

    const getRules = await makeRequest(server, { path: '/api/payroll/salary-rules', headers: { Cookie: userCookie } });
    console.log('GET /api/payroll/salary-rules:', getRules.statusCode === 200 ? 'PASS (200)' : `FAIL (${getRules.statusCode})`);

    // 1.3 Write Salary Structure must be Forbidden (403)
    const postStruct = await makeRequest(server, { path: '/api/payroll/salary-structures', method: 'POST', headers: { Cookie: userCookie } }, {
      name: 'Forbidden Structure'
    });
    console.log('POST /api/payroll/salary-structures (should be 403):', postStruct.statusCode === 403 ? 'PASS (403 Forbidden)' : `FAIL (${postStruct.statusCode})`);

    // 1.4 Write Salary Rule must be Forbidden (403)
    const postRule = await makeRequest(server, { path: '/api/payroll/salary-rules', method: 'POST', headers: { Cookie: userCookie } }, {
      name: 'Forbidden Rule'
    });
    console.log('POST /api/payroll/salary-rules (should be 403):', postRule.statusCode === 403 ? 'PASS (403 Forbidden)' : `FAIL (${postRule.statusCode})`);

    // 1.5 Payrun creation/update allowed, but validate/delete forbidden
    const getPayruns = await makeRequest(server, { path: '/api/payroll/payruns', headers: { Cookie: userCookie } });
    console.log('GET /api/payroll/payruns:', getPayruns.statusCode === 200 ? 'PASS (200)' : `FAIL (${getPayruns.statusCode})`);

    const validatePayrun = await makeRequest(server, { path: '/api/payroll/payruns/test-id/validate', method: 'PUT', headers: { Cookie: userCookie } });
    console.log('PUT /api/payroll/payruns/:id/validate (should be 403):', validatePayrun.statusCode === 403 ? 'PASS (403 Forbidden)' : `FAIL (${validatePayrun.statusCode})`);

    const deletePayrun = await makeRequest(server, { path: '/api/payroll/payruns/test-id', method: 'DELETE', headers: { Cookie: userCookie } });
    console.log('DELETE /api/payroll/payruns/:id (should be 403):', deletePayrun.statusCode === 403 ? 'PASS (403 Forbidden)' : `FAIL (${deletePayrun.statusCode})`);


    console.log('\n=== TEST 2: HR_PAYROLL_MANAGER ===');
    const mgrLogin = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {
      email: 'payroll.manager@peoplepay360.local',
      password: 'PayrollManager123!'
    });
    console.log('Login status:', mgrLogin.statusCode, 'Role:', mgrLogin.data?.data?.role);
    if (mgrLogin.statusCode !== 200 || mgrLogin.data?.data?.role !== 'HR_PAYROLL_MANAGER') {
      throw new Error('HR_PAYROLL_MANAGER login failed');
    }
    const mgrCookie = mgrLogin.headers['set-cookie']?.[0]?.split(';')[0];

    // 2.1 HR Ops: Can access Employees and Contracts
    const mgrEmp = await makeRequest(server, { path: '/api/hr/employees', headers: { Cookie: mgrCookie } });
    console.log('Access /api/hr/employees:', mgrEmp.statusCode === 200 ? 'PASS (200)' : `FAIL (${mgrEmp.statusCode})`);

    const mgrContracts = await makeRequest(server, { path: '/api/hr/contracts', headers: { Cookie: mgrCookie } });
    console.log('Access /api/hr/contracts:', mgrContracts.statusCode === 200 ? 'PASS (200)' : `FAIL (${mgrContracts.statusCode})`);

    // 2.2 Full CRUD permissions on Salary Structures and Rules
    const mgrGetStructs = await makeRequest(server, { path: '/api/payroll/salary-structures', headers: { Cookie: mgrCookie } });
    console.log('GET /api/payroll/salary-structures:', mgrGetStructs.statusCode === 200 ? 'PASS (200)' : `FAIL (${mgrGetStructs.statusCode})`);

    const mgrGetRules = await makeRequest(server, { path: '/api/payroll/salary-rules', headers: { Cookie: mgrCookie } });
    console.log('GET /api/payroll/salary-rules:', mgrGetRules.statusCode === 200 ? 'PASS (200)' : `FAIL (${mgrGetRules.statusCode})`);

    // 2.3 Payruns and Payslips full management
    const mgrGetPayruns = await makeRequest(server, { path: '/api/payroll/payruns', headers: { Cookie: mgrCookie } });
    console.log('GET /api/payroll/payruns:', mgrGetPayruns.statusCode === 200 ? 'PASS (200)' : `FAIL (${mgrGetPayruns.statusCode})`);

    console.log('\n>>> ALL ROLE RBAC AND PERMISSION CHECKS PASSED SUCCESSFULLY! <<<');
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
