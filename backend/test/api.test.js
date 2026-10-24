const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
process.env.NODE_ENV = 'test';
process.env.DATABASE_FILE = ':memory:';
const app = require('../src/app');
const db = require('../src/db');
const seed = require('../src/seed');
let server, base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.on('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
beforeEach(() => seed());
after(async () => {
  await new Promise(resolve => server.close(resolve));
  db.close();
});
async function call(path, method = 'GET', body, expected = 200) {
  const response = await fetch(base + '/api' + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  assert.equal(response.status, expected, method + ' ' + path);
  assert.equal(response.headers.get('x-student-id'), 'N23DCPT019');
  const data = await response.json();
  if (expected >= 400) {
    assert.equal(typeof data.error, 'string');
    assert.ok(Array.isArray(data.details));
  }
  return data;
}
async function sample(overrides = {}) {
  const classes = await call('/lop');
  return { mssv: 'N23DCPT099', hoTen: 'Sinh viên kiểm thử', ngaySinh: '2004-01-01',
    email: 'n23dcpt099@student.ptithcm.edu.vn', gpa: 3.5, lopId: classes[0].id, ...overrides };
}

test('seed, pagination, personal identity and statistics', async () => {
  const classes = await call('/lop'); assert.equal(classes.length, 3);
  const list = await call('/sinh-vien');
  assert.deepEqual(Object.keys(list).sort(), ['data', 'limit', 'page', 'total', 'totalPages'].sort());
  assert.equal(list.limit, 8); assert.equal(list.data.length, 8); assert.equal(list.total, 15); assert.equal(list.totalPages, 2);
  const page2 = await call('/sinh-vien?page=2'); assert.equal(page2.data.length, 7);
  assert.ok(!page2.data.some(s => list.data.some(first => first.id === s.id)));
  const owner = [...list.data, ...page2.data].find(s => s.mssv === 'N23DCPT019');
  assert.ok(owner.hoTen.includes('Nguyễn Ngọc Gia Hân'));
  assert.equal(owner.email, 'n23dcpt019@student.ptithcm.edu.vn');
  assert.ok(owner.hoTen.includes('N23DCPT019'));
  const stats = await call('/sinh-vien/stats');
  assert.deepEqual(stats.byClass.map(c => c.averageGpa), [3.04, 2.7, 2.6]);
  assert.deepEqual(stats.byRank.map(r => r.count), [4, 3, 3, 2, 3]);
});

test('class CRUD, duplicate POST/PUT and occupied class protection', async () => {
  const classes = await call('/lop');
  const created = await call('/lop', 'POST', { maLop: 'TEST01', tenLop: 'Lớp kiểm thử', khoa: 'K26' }, 201);
  const updated = await call('/lop/' + created.id, 'PUT', { maLop: 'TEST02', tenLop: 'Đã sửa', khoa: 'K27' });
  assert.equal(updated.tenLop, 'Đã sửa');
  await call('/lop', 'POST', { maLop: 'TEST02', tenLop: 'Trùng', khoa: 'K26' }, 409);
  await call('/lop/' + created.id, 'PUT', { ...updated, maLop: classes[0].maLop }, 409);
  await call('/lop/' + classes[0].id, 'DELETE', undefined, 409);
  await call('/lop/' + created.id, 'DELETE');
  await call('/lop/' + created.id, 'DELETE', undefined, 404);
});

test('student CRUD, decimal GPA, joined class and duplicate POST/PUT', async () => {
  const input = await sample();
  const created = await call('/sinh-vien', 'POST', input, 201);
  assert.equal(created.gpa, 3.5); assert.equal(created.xepLoai, 'Giỏi'); assert.ok(created.maLop);
  const detail = await call('/sinh-vien/' + created.id); assert.equal(detail.id, created.id);
  const updated = await call('/sinh-vien/' + created.id, 'PUT', { ...input, gpa: 3.75 });
  assert.equal(updated.xepLoai, 'Xuất sắc');
  const duplicate = await call('/sinh-vien', 'POST', input, 409);
  assert.ok(duplicate.details.some(d => d.field === 'mssv'));
  const first = (await call('/sinh-vien')).data[0];
  await call('/sinh-vien/' + created.id, 'PUT', { ...input, mssv: first.mssv, email: first.email }, 409);
  await call('/sinh-vien/' + created.id, 'DELETE');
  await call('/sinh-vien/' + created.id, 'GET', undefined, 404);
  await call('/sinh-vien/' + created.id, 'PUT', input, 404);
});

test('field validation rejects empty/incorrect types, date, age, email and missing class', async () => {
  const input = await sample();
  const invalid = [
    ['mssv', 'n23dcpt099'], ['mssv', 123], ['hoTen', '  '], ['hoTen', 'a'.repeat(61)], ['hoTen', 123],
    ['ngaySinh', '2004-02-30'], ['ngaySinh', new Date().getFullYear() + '-01-01'],
    ['email', 'other@student.ptithcm.edu.vn'], ['email', 'n23dcpt099@gmail.com'],
    ['gpa', null], ['gpa', ''], ['gpa', '  '], ['gpa', false], ['gpa', []], ['gpa', -1], ['gpa', 4.1],
    ['lopId', null], ['lopId', 1.5], ['lopId', 999999],
  ];
  for (const [field, value] of invalid) {
    const result = await call('/sinh-vien', 'POST', { ...input, [field]: value }, 400);
    assert.ok(result.details.some(d => d.field === field), field + ': ' + JSON.stringify(value));
  }
  await call('/sinh-vien', 'POST', [], 400);
  for (const value of ['   ', 123, null]) {
    const result = await call('/lop', 'POST', { maLop: value, tenLop: 'Test', khoa: 'K26' }, 400);
    assert.ok(result.details.some(d => d.field === 'maLop'));
  }
});

test('exact seventeenth birthday accepted; birthday tomorrow rejected', async () => {
  const today = new Date();
  const birth = new Date(Date.UTC(today.getFullYear() - 17, today.getMonth(), today.getDate()));
  const input = await sample({ ngaySinh: birth.toISOString().slice(0, 10) });
  await call('/sinh-vien', 'POST', input, 201);
  birth.setUTCDate(birth.getUTCDate() + 1);
  await call('/sinh-vien', 'POST', { ...input, ngaySinh: birth.toISOString().slice(0, 10) }, 400);
});

test('search, combined filters, ascending/descending sorting and rank boundaries', async () => {
  const byName = await call('/sinh-vien?q=' + encodeURIComponent('Gia Hân'));
  assert.equal(byName.total, 1);
  assert.equal((await call('/sinh-vien?q=N23DCPT019')).total, 1);
  assert.equal((await call('/sinh-vien?q=%25')).total, 0);
  const classId = byName.data[0].lopId;
  const query = new URLSearchParams({ lopId: classId, xepLoai: 'Xuất sắc', gpaMin: '3.7', sort: 'gpa', order: 'desc' });
  assert.equal((await call('/sinh-vien?' + query)).total, 1);
  for (const sort of ['gpa', 'mssv', 'hoTen']) {
    const asc = (await call('/sinh-vien?limit=100&sort=' + sort)).data;
    const desc = (await call('/sinh-vien?limit=100&sort=' + sort + '&order=desc')).data;
    assert.deepEqual(asc.map(s => s[sort]), desc.map(s => s[sort]).reverse());
  }
  for (const [gpa, rank] of [[0, 'Yếu'], [2, 'Trung bình'], [2.5, 'Khá'], [3.2, 'Giỏi'], [3.599999, 'Giỏi'], [3.6, 'Xuất sắc'], [4, 'Xuất sắc']]) {
    const input = await sample({ gpa });
    const created = await call('/sinh-vien', 'POST', input, 201);
    assert.equal(created.xepLoai, rank);
    const filtered = await call('/sinh-vien?xepLoai=' + encodeURIComponent(rank) + '&limit=100');
    assert.ok(filtered.data.some(s => s.id === created.id));
    await call('/sinh-vien/' + created.id, 'DELETE');
  }
});

test('invalid query parameters return 400 instead of SQL errors', async () => {
  for (const query of ['page=1.5', 'page=-1', 'page=Infinity', 'limit=1.5', 'limit=101', 'gpaMin=abc', 'gpaMin=5', 'sort=bad', 'order=bad', 'xepLoai=bad', 'lopId=abc', 'q=a&q=b']) {
    await call('/sinh-vien?' + query, 'GET', undefined, 400);
  }
});

test('CSV matches all filtered rows in requested order and quotes user values', async () => {
  await call('/sinh-vien', 'POST', await sample({ hoTen: 'Sinh viên, \"CSV\"', gpa: 3.99 }), 201);
  const query = 'gpaMin=3.6&sort=gpa&order=desc&limit=1';
  const list = await call('/sinh-vien?' + query);
  const response = await fetch(base + '/api/sinh-vien/export?' + query);
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('content-type').startsWith('text/csv'));
  assert.match(response.headers.get('content-disposition'), /attachment/);
  const csv = await response.text();
  const rows = csv.split('\r\n');
  assert.equal(rows.length - 1, list.total);
  assert.ok(rows[1].startsWith('"' + list.data[0].mssv + '"'));
  assert.ok(csv.includes('"Sinh viên, ""CSV"""'));
});

test('identity and JSON error shape on invalid JSON, preflight and unknown routes', async () => {
  const malformed = await fetch(base + '/api/sinh-vien', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.headers.get('x-student-id'), 'N23DCPT019');
  assert.ok(Array.isArray((await malformed.json()).details));
  const preflight = await fetch(base + '/api/lop', { method: 'OPTIONS', headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'POST' } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('x-student-id'), 'N23DCPT019');
  await call('/unknown', 'GET', undefined, 404);
  await call('/sinh-vien/not-an-id', 'GET', undefined, 400);
});

test('empty database statistics include every rank and CSV still has a header', async () => {
  db.exec('DELETE FROM sinh_vien; DELETE FROM lop;');
  const stats = await call('/sinh-vien/stats');
  assert.equal(stats.byClass.length, 0);
  assert.equal(stats.byRank.length, 5);
  assert.ok(stats.byRank.every(r => r.count === 0));
  const list = await call('/sinh-vien');
  assert.equal(list.total, 0); assert.equal(list.totalPages, 0);
  const response = await fetch(base + '/api/sinh-vien/export');
  assert.equal((await response.text()).split('\r\n').length, 1);
});
