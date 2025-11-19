(async function(){
  const base = 'http://localhost:5001/api';
  const headersJson = { 'Content-Type': 'application/json' };
  try {
    console.log('1) Signup (ignore if already exists)');
    await fetch(base + '/auth/signup', { method: 'POST', headers: headersJson, body: JSON.stringify({ email: 'demo@local', password: 'demo' }) })
      .then(r => { console.log('signup status', r.status); return r.text(); })
      .then(t => console.log('signup body:', t));

    console.log('\n2) Login');
    const loginRes = await fetch(base + '/auth/login', { method: 'POST', headers: headersJson, body: JSON.stringify({ email: 'demo@local', password: 'demo' }) });
    const loginJson = await loginRes.json();
    console.log('login status', loginRes.status, 'body', loginJson);
    const token = loginJson.token;
    if (!token) throw new Error('No token returned from login');

    const authHeaders = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

    console.log('\n3) Create category');
    const catRes = await fetch(base + '/categories', { method: 'POST', headers: authHeaders, body: JSON.stringify({ name: 'Food', color: '#ff6666' }) });
    const catJson = await catRes.json();
    console.log('create category status', catRes.status, 'body', catJson);

    console.log('\n4) Get categories');
    const cats = await (await fetch(base + '/categories', { headers: { Authorization: 'Bearer ' + token } })).json();
    console.log('categories:', cats);
    const catId = cats[0]?._id || cats[0]?.id;
    if (!catId) throw new Error('No category id found');

    console.log('\n5) Create budget for month 2025-11');
    const budRes = await fetch(base + '/budgets', { method: 'POST', headers: authHeaders, body: JSON.stringify({ categoryId: catId, month: '2025-11', limit: 1000 }) });
    console.log('create budget status', budRes.status, 'body', await budRes.json());

    console.log('\n6) Add expense amount 1200 (over budget)');
    const expRes = await fetch(base + '/expenses', { method: 'POST', headers: authHeaders, body: JSON.stringify({ categoryId: catId, amount: 1200, date: '2025-11-05' }) });
    const expJson = await expRes.json();
    console.log('expense created status', expRes.status, 'body', expJson);

    console.log('\n7) Get report for 2025-11');
    const rep = await (await fetch(base + '/reports/2025-11', { headers: { Authorization: 'Bearer ' + token } })).json();
    console.log('report:', JSON.stringify(rep, null, 2));

    console.log('\nTest flow completed. If all responses are 200/201, API is reachable and working.');
  } catch (err) {
    console.error('Test flow error:', err);
    process.exitCode = 1;
  }
})();
