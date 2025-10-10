import pg from 'pg';
import config from '../config/index.js';

const pool = new pg.Pool({
  connectionString: config.db.url,
  idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 20000,
});

pool.on('error', (err, client) => {
  console.error('an error occured', err);
});

export default pool;