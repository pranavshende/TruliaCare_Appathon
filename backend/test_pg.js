const { Pool } = require('pg');

const pool = new Pool({ connectionString: undefined });

async function test() {
  try {
    await pool.query('SELECT NOW()');
  } catch (err) {
    console.error(err);
  }
}

test();
