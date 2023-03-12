import pg from 'pg'
// import format from 'pg-format'
// import { venues } from '../src/utils/enum.js'

const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  max: 30,
})

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

export async function getNumImages(venue) {
  try {
    const client = await pool.connect()
    const res = await client.query(`select count (*) from metadata${venue ? ` where venue='${venue}'` : ''}`)
    await client.release()
    return res.rows[0].count
  } catch (error) {
    await client.release(true)
    return error
  }
}

export async function getImages({ loggedInVenue, page, imagesPerPage }) {
  //TODO: needs filters
  try {
    const client = await pool.connect()
    const res = await client.query(
      `select * from metadata ${
        loggedInVenue === 'Global' ? '' : `where venue='${loggedInVenue}' `
      }order by created_timestamp desc offset ${(page - 1) * imagesPerPage} rows fetch next ${imagesPerPage} rows only`
    )
    await client.release()
    return res.rows
  } catch (error) {
    await client.release(true)
    return error
  }
}

//moderationState should be either 0,1,2 (unmoderated, pass, fail)
export async function setModeration(imageId, moderationState) {
  try {
    const client = await pool.connect()
    const res = await client.query(
      `update metadata set moderation_state=${moderationState} where image_id='${imageId}'`
    )
    await client.release()
    return res.rows
  } catch (error) {
    await client.release(true)
    return error
  }
}

export async function countUnmoderatedImages(loggedInVenue) {
  try {
    const res = await pool.query(`select count (*) from metadata where moderation_state=0 ${loggedInVenue === 'Global' ? '' : `and venue='${loggedInVenue}'`}`)
    return res.rows[0].count
  } catch (error) {
    console.log(error)
    return error
  }
}

export async function getNextUnmoderatedImageMetadata(loggedInVenue) {
  try {
    const res = await pool.query(`select * from metadata where moderation_state=0 ${loggedInVenue === 'Global' ? '' : `and venue='${loggedInVenue}'`}order by created_timestamp limit 1`)
    return res.rows[0]
  } catch (error) {
    console.log(error)
    return error
  }
}

//get latest images, split between global and venue
export async function getLatestImages(numImages, venue, venueSplit) {
  try {
    const numVenueImages = Math.round(numImages * venueSplit)
    const venueImages = await pool.query(
      `select * from metadata where venue='${venue}' and moderation_state=1 order by created_timestamp desc limit ${numVenueImages}`
    )
    const numGlobalImages = numImages - venueImages.rows.length
    const globalImages = await pool.query(
      `select * from metadata where venue!='${venue}' and moderation_state=1 order by created_timestamp desc limit ${numGlobalImages}`
    )
    return [...venueImages.rows, ...globalImages.rows]
  } catch (error) {
    console.log(error)
    return error
  }
}

export async function getCredentialsFromUsername(username) {
  try {
    const res = await pool.query(`select * from users where name='${username}'`)
    return res.rows[0]
  } catch (error) {
    console.log(error)
    return error
  }
}
