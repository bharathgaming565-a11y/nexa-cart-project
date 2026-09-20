const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', 'config.env') });
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { maxPoolSize: 10 });
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    const result = {};
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      result[c.name] = count;
    }
    console.log(JSON.stringify({ host: db.s.host, database: db.databaseName, collections: result }, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
