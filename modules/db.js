import pg from 'pg'
// import format from 'pg-format'
// import { venues } from '../src/utils/enum.js'

const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  max: 30
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

export async function insertMetadata(
  imageId,
  sessionId,
  venue,
  plantName,
  userName,
  createdTimestamp,
  moderationState
) {
  try {
    const client = await pool.connect()
    await client.query('BEGIN')
    const queryText =
      'INSERT INTO metadata (image_id, session_id, venue, plant_name, user_name, created_timestamp, moderation_state) VALUES($1, $2, $3, $4, $5, $6, $7)'
    const queryValues = [imageId, sessionId, venue, plantName, userName, createdTimestamp, moderationState]
    await client.query(queryText, queryValues)
    await client.query('COMMIT')
    await client.release()
  } catch (error) {
    await client.query('ROLLBACK')
    await client.release(true)
    console.log(error)
    return error
  }
}

export async function deleteMetadata(imageId) {
  try {
    const client = await pool.connect()
    await client.query(`delete from metadata where image_id='${imageId}'`)
    await client.release()
  } catch (error) {
    await client.release(true)
    return error
  }
}

export async function getNumImages() {
  try {
    const client = await pool.connect()
    const res = await client.query('select count (*) from metadata')
    await client.release()
    return res.rows[0].count
  } catch (error) {
    await client.release(true)
    return error
  }
}

export async function getImages({page, imagesPerPage}) {
  //TODO: needs filters
  try {
    const client = await pool.connect()
    const res = await client.query(`select * from metadata order by created_timestamp desc offset ${(page - 1) * imagesPerPage} rows fetch next ${imagesPerPage} rows only`)
    await client.release()
    return res.rows
  } catch (error) {
    await client.release(true)
    return error
  }
}
