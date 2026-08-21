const { parse } = require('pg-connection-string');
const url = "postgresql://postgres.pnibklyloklrarccxflg:2241%40PROnity@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
console.log(parse(url));
