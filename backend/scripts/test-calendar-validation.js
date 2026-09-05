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

async function testCalendarValidation() {
  console.log('=== TESTING CALENDAR PAST DATES VALIDATION ===\n');

  // Step 1: Employee login
  console.log('1. Logging in as Employee (farhan@gmail.com)...');
  const empLogin = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'farhan@gmail.com', password: 'Employee123!' }
  );

  const empCookie = empLogin.headers['set-cookie']?.[0]?.split(';')[0];
  console.log('   Status:', empLogin.statusCode, '| Cookie obtained:', !!empCookie);

  // Step 2: Employee attempts to create a request with PAST DATES (e.g., 2025-01-10)
  console.log('\n2. Employee attempting time off with PAST DATE (2025-01-10)...');
  const pastDateRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/me/time-off/requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: empCookie,
      },
    },
    {
      timeOffType: 'ANNUAL',
      startDate: '2025-01-10',
      endDate: '2025-01-12',
      reason: 'Trip in the past',
    }
  );

  console.log('   Status:', pastDateRes.statusCode);
  console.log('   Response Message:', pastDateRes.data?.message);
  if (pastDateRes.statusCode === 400 && pastDateRes.data?.message?.includes('past')) {
    console.log('   >>> SUCCESS: Past date was properly REJECTED with 400 Bad Request!');
  } else {
    console.error('   >>> FAILURE: Expected 400 past date rejection!');
  }

  // Step 3: HR Manager login
  console.log('\n3. Logging in as HR Manager (hr.manager@peoplepay360.com)...');
  const hrLogin = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'hr.manager@peoplepay360.com', password: 'Password123!' }
  );

  const hrCookie = hrLogin.headers['set-cookie']?.[0]?.split(';')[0];
  console.log('   Status:', hrLogin.statusCode, '| Cookie obtained:', !!hrCookie);

  // Step 4: HR Manager attempting to create a request with PAST DATES for an employee
  console.log('\n4. HR Manager attempting to create time off with PAST DATE for EMP-1001...');
  const hrPastRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/hr/employees/EMP-1001/time-off/requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: hrCookie,
      },
    },
    {
      timeOffType: 'ANNUAL',
      startDate: '2025-02-01',
      endDate: '2025-02-03',
      reason: 'Retroactive leave request',
    }
  );

  console.log('   Status:', hrPastRes.statusCode);
  console.log('   Response Message:', hrPastRes.data?.message);
  if (hrPastRes.statusCode === 400 && hrPastRes.data?.message?.includes('past')) {
    console.log('   >>> SUCCESS: HR request with past date was properly REJECTED!');
  } else {
    console.error('   >>> FAILURE: Expected 400 past date rejection for HR!');
  }

  // Step 5: Employee creating time off with a FUTURE DATE (e.g., next month)
  const futureStart = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
  const futureEnd = new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0];
  console.log(`\n5. Employee requesting valid FUTURE DATE (${futureStart} to ${futureEnd})...`);
  const validFutureRes = await makeRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/me/time-off/requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: empCookie,
      },
    },
    {
      timeOffType: 'ANNUAL',
      startDate: futureStart,
      endDate: futureEnd,
      reason: 'Upcoming planned family vacation',
    }
  );

  console.log('   Status:', validFutureRes.statusCode);
  console.log('   Created Request ID:', validFutureRes.data?.data?._id || validFutureRes.data?.data?.id);
  if (validFutureRes.statusCode === 201) {
    console.log('   >>> SUCCESS: Valid future date request was successfully accepted!');
  } else {
    console.log('   Response:', validFutureRes.data);
  }

  console.log('\n======================================================');
  console.log('  CALENDAR VALIDATION VERIFICATION COMPLETED CLEANLY!  ');
  console.log('======================================================');
}

testCalendarValidation().catch(console.error);
