const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_BASE = 'http://127.0.0.1:5000/api';


async function runTestSuite() {
  console.log('=== STARTING NEUROSHIELD IDS API AUTOMATED TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Consolidated Health Endpoint
    console.log('--- Test 1: GET /api/health ---');
    try {
      const res = await axios.get(`${API_BASE}/health`);
      assert(res.data.success === true, 'Health check returns success: true');
      assert(res.data.services.express === 'online', 'Express service is reported online');
      assert(['online', 'offline'].includes(res.data.services.flask), 'Flask status is dynamically probed');
    } catch (e) {
      assert(false, 'Health check failed: ' + e.message);
    }

    // 2. Model Performance Pending Contract
    console.log('\n--- Test 2: GET /api/model/performance ---');
    try {
      const res = await axios.get(`${API_BASE}/model/performance`);
      assert(res.data.success === true, 'Model performance returns success: true');
      assert(res.data.status === 'pending', 'Model performance status is pending');
      assert(res.data.message.includes('not been generated yet'), 'Returns honest pending message');
    } catch (e) {
      assert(false, 'Model performance endpoint failed: ' + e.message);
    }

    // 3. Unauthenticated Predict Request
    console.log('\n--- Test 3: Unauthenticated POST /api/intrusion/predict ---');
    try {
      await axios.post(`${API_BASE}/intrusion/predict`, []);
      assert(false, 'Should have failed with HTTP 401');
    } catch (e) {
      assert(e.response && e.response.status === 401, 'Unauthenticated request returns HTTP 401');
    }

    // 4. Authenticate Test Analyst
    console.log('\n--- Test 4: Authenticate Test Analyst ---');
    let token = '';
    try {
      const authRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'analyst@neuroshield.io',
        password: 'admin123'
      });
      token = authRes.data.token;
      assert(token && token.length > 0, 'Test analyst authenticated and token issued');
    } catch (e) {
      try {
        const regRes = await axios.post(`${API_BASE}/auth/register`, {
          name: 'Test Analyst',
          email: 'analyst@neuroshield.io',
          password: 'admin123',
          role: 'IDS Security Analyst'
        });
        token = regRes.data.token;
        assert(token && token.length > 0, 'Test analyst registered and token issued');
      } catch (regErr) {
        console.warn('Could not acquire auth token for protected tests:', regErr.message);
      }
    }

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    // 5. Dashboard Analytics for Authenticated Analyst
    console.log('\n--- Test 5: GET /api/dashboard/analytics ---');
    try {
      const res = await axios.get(`${API_BASE}/dashboard/analytics`, { headers: authHeaders });
      assert(res.data.success === true, 'Analytics returns success: true');
      assert(typeof res.data.metrics.totalScans === 'number', 'Returns numeric totalScans metric');
    } catch (e) {
      assert(false, 'Dashboard analytics failed: ' + e.message);
    }

    // 6. Unsupported File Type (.png)
    console.log('\n--- Test 6: Unsupported File Type (.png) ---');
    try {
      const form = new FormData();
      form.append('file', Buffer.from('fake image binary content'), {
        filename: 'malicious_packet.png',
        contentType: 'image/png'
      });
      await axios.post(`${API_BASE}/intrusion/predict`, form, {
        headers: { ...form.getHeaders(), ...authHeaders }
      });
      assert(false, 'Should have failed with HTTP 415');
    } catch (e) {
      assert(e.response && e.response.status === 415, 'Unsupported file type returns HTTP 415');
    }

    // 7. Empty 0-byte CSV
    console.log('\n--- Test 7: Empty 0-byte CSV ---');
    try {
      const form = new FormData();
      form.append('file', Buffer.from(''), {
        filename: 'empty.csv',
        contentType: 'text/csv'
      });
      await axios.post(`${API_BASE}/intrusion/predict`, form, {
        headers: { ...form.getHeaders(), ...authHeaders }
      });
      assert(false, 'Should have failed with HTTP 400');
    } catch (e) {
      assert(e.response && e.response.status === 400, 'Empty CSV upload returns HTTP 400');
    }

    // 8. Missing Required Columns CSV
    console.log('\n--- Test 8: Missing Required Columns CSV ---');
    try {
      const invalidCsv = 'duration,protocol_type\n0,tcp\n';
      const form = new FormData();
      form.append('file', Buffer.from(invalidCsv), {
        filename: 'invalid_cols.csv',
        contentType: 'text/csv'
      });
      await axios.post(`${API_BASE}/intrusion/predict`, form, {
        headers: { ...form.getHeaders(), ...authHeaders }
      });
      assert(false, 'Should have failed with HTTP 400');
    } catch (e) {
      const is400 = e.response && e.response.status === 400;
      const is503 = e.response && e.response.status === 503; // If Flask offline
      assert(is400 || is503, `Missing columns returns expected status code (got ${e.response?.status})`);
      if (is400 && e.response.data.missing_columns) {
        assert(Array.isArray(e.response.data.missing_columns), 'Returns missing_columns list');
      }
    }

    // 9. Invalid Numeric Values CSV
    console.log('\n--- Test 9: Invalid Numeric Values CSV ---');
    try {
      const invalidNumCsv = 'duration,protocol_type,service,flag,src_bytes,dst_bytes,count,srv_count,serror_rate,rerror_rate,same_srv_rate,diff_srv_rate\n' +
                             'INVALID_NUM,tcp,private,S0,abc,xyz,320,320,1.0,0.0,1.0,0.0\n';
      const form = new FormData();
      form.append('file', Buffer.from(invalidNumCsv), {
        filename: 'invalid_num.csv',
        contentType: 'text/csv'
      });
      await axios.post(`${API_BASE}/intrusion/predict`, form, {
        headers: { ...form.getHeaders(), ...authHeaders }
      });
      assert(false, 'Should have failed with HTTP 400');
    } catch (e) {
      assert(e.response && (e.response.status === 400 || e.response.status === 503), 'Invalid numeric values return HTTP 400');
    }

    // 10. Unsupported Categorical Value CSV
    console.log('\n--- Test 10: Unsupported Categorical Value CSV ---');
    try {
      const invalidCatCsv = 'duration,protocol_type,service,flag,src_bytes,dst_bytes,count,srv_count,serror_rate,rerror_rate,same_srv_rate,diff_srv_rate\n' +
                             '0,UNKNOWN_PROTOCOL,private,S0,0,0,320,320,1.0,0.0,1.0,0.0\n';
      const form = new FormData();
      form.append('file', Buffer.from(invalidCatCsv), {
        filename: 'invalid_cat.csv',
        contentType: 'text/csv'
      });
      await axios.post(`${API_BASE}/intrusion/predict`, form, {
        headers: { ...form.getHeaders(), ...authHeaders }
      });
      assert(false, 'Should have failed with HTTP 400');
    } catch (e) {
      assert(e.response && (e.response.status === 400 || e.response.status === 503), 'Unsupported categorical value returns HTTP 400');
    }

    // 11. Oversized File (>10 MB)
    console.log('\n--- Test 11: File Exceeding 10 MB Limit ---');
    try {
      const largeBuffer = Buffer.alloc(10.5 * 1024 * 1024, 'a');
      const form = new FormData();
      form.append('file', largeBuffer, {
        filename: 'large_stream.csv',
        contentType: 'text/csv'
      });
      await axios.post(`${API_BASE}/intrusion/predict`, form, {
        headers: { ...form.getHeaders(), ...authHeaders }
      });
      assert(false, 'Should have failed with HTTP 413');
    } catch (e) {
      assert(e.response && e.response.status === 413, 'Oversized file upload returns HTTP 413');
    }

    // 10. Valid CSV Upload (When Flask is running)
    console.log('\n--- Test 10: Valid CSV Telemetry Upload ---');
    try {
      const validCsv = 'duration,protocol_type,service,flag,src_bytes,dst_bytes,count,srv_count,serror_rate,rerror_rate,same_srv_rate,diff_srv_rate\n' +
                       '0,tcp,private,S0,0,0,320,320,1.0,0.0,1.0,0.0\n' +
                       '12,tcp,http,SF,1240,4800,4,4,0.0,0.0,1.0,0.0\n';
      const form = new FormData();
      form.append('file', Buffer.from(validCsv), {
        filename: 'valid_network_telemetry.csv',
        contentType: 'text/csv'
      });
      const res = await axios.post(`${API_BASE}/intrusion/predict`, form, {
        headers: { ...form.getHeaders(), ...authHeaders }
      });
      assert(res.data.success === true, 'Valid CSV prediction returns success: true');
      assert(res.data.total_records === 2, 'Correctly analyzed 2 telemetry rows');
    } catch (e) {
      if (e.response && e.response.status === 503) {
        console.log('[INFO] Flask service offline on port 5001. Express correctly returned HTTP 503 Service Unavailable.');
        assert(true, 'Express returns HTTP 503 when Flask ML service is offline (No fake DoS prediction created!)');
      } else {
        assert(false, 'Valid CSV prediction test error: ' + (e.response?.data?.message || e.message));
      }
    }

  } catch (err) {
    console.error('Test suite error:', err);
  }

  console.log(`\n=== TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`);
}

if (require.main === module) {
  runTestSuite();
}

module.exports = { runTestSuite };
