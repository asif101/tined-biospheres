import pg from 'pg'
// import format from 'pg-format'
// import { venues } from '../src/utils/enum.js'

const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
})

export async function getNumMetadata() {
  console.time('get')
  try {
    const res = await pool.query('select count (*) from metadata where moderation_state=0')
    console.log(res.rows[0])
    console.timeEnd('get')
    return res.rows[0].count
  } catch (error) {
    console.log(error)
  }
}
