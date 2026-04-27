// 初始化 pente 数据库和专用用户
db = db.getSiblingDB('fivex');
db.createUser({
  user: 'fivex',
  pwd: 'fivex123',
  roles: [{ role: 'readWrite', db: 'fivex' }]
});
