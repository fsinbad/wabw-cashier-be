import pg from 'pg';
import config from '../config/index.js';

const pool = new pg.Pool({
  connectionString: config.db.url,
});

export default pool;