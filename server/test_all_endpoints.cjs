const http = require('http');

async function req(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:5000' + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const request = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

async function run() {
  console.log('--- 1. AUTH & SETUP ---');
  let email = 'audit_test_' + Date.now() + '@example.com';
  let reg = await req('/api/auth/register', 'POST', {
    email: email,
    password: 'Password123!',
    name: 'Audit Test User'
  });
  console.log('Register status:', reg.status);
  let token = reg.data.token;
  if (!token) {
    let login = await req('/api/auth/login', 'POST', {
      email: email,
      password: 'Password123!'
    });
    token = login.data.token;
  }
  console.log('Got token:', token ? 'YES' : 'NO');

  // Setup MSME profile if not present
  let profileSetup = await req('/api/msme/profile', 'POST', {
    business_name: 'Audit Test Enterprise Ltd',
    gstin: '27AAAAA' + Math.floor(1000 + Math.random()*9000) + 'A1Z' + Math.floor(1+Math.random()*9),
    udyam_number: 'UDYAM-MH-00-' + Math.floor(100000 + Math.random()*900000),
    business_type: 'MANUFACTURING',
    sector: 'Auto Components',
    state: 'Maharashtra',
    district: 'Pune',
    employee_count: 50,
    annual_turnover_lakh: 150.5,
    is_food_business: false
  }, token);
  console.log('MSME Profile setup status:', profileSetup.status, profileSetup.data?.message || '');

  console.log('\n--- 2. SUPPLIER TRUST ENDPOINTS ---');
  const stEndpoints = [
    ['GET', '/api/supplier-trust/profile'],
    ['GET', '/api/supplier-trust/timeline'],
    ['GET', '/api/supplier-trust/metadata'],
    ['GET', '/api/supplier-trust/config'],
    ['GET', '/api/supplier-trust/decision'],
    ['GET', '/api/supplier-trust/snapshot'],
    ['POST', '/api/supplier-trust/evaluate'],
    ['POST', '/api/supplier-trust/automation/re-evaluate'],
    ['GET', '/api/supplier-trust/automation/dependency-graph'],
    ['GET', '/api/supplier-trust/automation/metrics']
  ];

  let stSlug = null;
  for (let [method, path] of stEndpoints) {
    let res = await req(path, method, null, token);
    console.log([]  , res.status === 200 ? 'OK' : JSON.stringify(res.data || res.raw));
    if (path === '/api/supplier-trust/profile' && res.data?.data?.public_slug) {
      stSlug = res.data.data.public_slug;
    }
  }

  if (stSlug) {
    let pubRes = await req('/api/supplier-trust/public/' + stSlug, 'GET');
    console.log([] GET /api/supplier-trust/public/, pubRes.status === 200 ? 'OK' : JSON.stringify(pubRes.data));
  }

  console.log('\n--- 3. TRUST DISTRIBUTION ENDPOINTS ---');
  const tdEndpoints = [
    ['GET', '/api/trust-distribution/identity'],
    ['GET', '/api/trust-distribution/config'],
    ['GET', '/api/trust-distribution/timeline'],
    ['GET', '/api/trust-distribution/channels'],
    ['POST', '/api/trust-distribution/qr/generate'],
    ['POST', '/api/trust-distribution/qr/regenerate'],
    ['GET', '/api/trust-distribution/experience/share-link'],
    ['GET', '/api/trust-distribution/experience/widget-config'],
    ['GET', '/api/trust-distribution/experience/badge-config'],
    ['POST', '/api/trust-distribution/assets/generate'],
    ['GET', '/api/trust-distribution/assets/download/certificate'],
    ['POST', '/api/trust-distribution/orchestration/synchronize'],
    ['POST', '/api/trust-distribution/orchestration/impact-analysis', { eventType: 'TrustLevelChanged' }],
    ['GET', '/api/trust-distribution/orchestration/metrics']
  ];

  for (let [method, path, body] of tdEndpoints) {
    let res = await req(path, method, body, token);
    console.log([]  , res.status === 200 ? 'OK' : JSON.stringify(res.data || res.raw));
  }
}

run().catch(console.error);
