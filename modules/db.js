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
  drawingPrompt,
  createdTimestamp,
  moderationState,
  featured
) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const queryText =
      'INSERT INTO metadata (image_id, session_id, venue, plant_name, user_name, drawing_prompt, created_timestamp, moderation_state, featured) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)'
    const queryValues = [imageId, sessionId, venue, plantName, userName, drawingPrompt, createdTimestamp, moderationState, featured]
    await client.query(queryText, queryValues)
    await client.query('COMMIT')
    await client.release()
  } catch (error) {
    await client.query('ROLLBACK')
    await client.release(true)
    console.log(error)
    throw(error) 
  }
}

export async function deleteMetadata(imageId) {
  const client = await pool.connect()
  try {
    await client.query(`delete from metadata where image_id='${imageId}'`)
    await client.release()
  } catch (error) {
    await client.release(true)
    throw(error)
  }
}

export async function getNumImages({loggedInVenue, filters}) {
  const client = await pool.connect()
  try {
    const venueFilterClause = loggedInVenue !== 'Global' ? ` where venue='${loggedInVenue}'` : filters.venue !== 'Global' ? ` where venue='${filters.venue}'` : ''
    const res = await client.query(`select count (*) from metadata${venueFilterClause}`)
    await client.release()
    return parseInt(res.rows[0].count)
  } catch (error) {
    await client.release(true)
    throw(error)
  }
}

export async function getImages({ loggedInVenue, page, imagesPerPage, filters }) {
  const client = await pool.connect()
  try {
    const venueFilterClause = loggedInVenue !== 'Global' ? `where venue='${loggedInVenue}' ` : filters.venue !== 'Global' ? `where venue='${filters.venue}' ` : ''
    const res = await client.query(
      `select * from metadata ${venueFilterClause}order by created_timestamp desc offset ${(page - 1) * imagesPerPage} rows fetch next ${imagesPerPage} rows only`
    )
    await client.release()
    return res.rows
  } catch (error) {
    await client.release(true)
    throw(error)
  }
}

//moderationState should be either 0,1,2 (unmoderated, pass, fail)
export async function setModeration(imageId, moderationState) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `update metadata set moderation_state=${moderationState} where image_id='${imageId}'`
    )
    await client.release()
    return res.rows
  } catch (error) {
    await client.release(true)
    throw(error)
  }
}

export async function countUnmoderatedImages(loggedInVenue) {
  try {
    const res = await pool.query(`select count (*) from metadata where moderation_state=0 ${loggedInVenue === 'Global' ? '' : `and venue='${loggedInVenue}'`}`)
    return res.rows[0].count
  } catch (error) {
    console.log(error)
    throw(error)
  }
}

export async function getNextUnmoderatedImageMetadata(loggedInVenue) {
  try {
    const res = await pool.query(`select * from metadata where moderation_state=0 ${loggedInVenue === 'Global' ? '' : `and venue='${loggedInVenue}'`}order by created_timestamp limit 1`)
    return res.rows[0]
  } catch (error) {
    console.log(error)
    throw(error)
  }
}

//get latest images, split between global and venue
export async function getLatestImages(numImages, venue, venueSplit) {
  try {
    let desiredNumVenueImages = Math.round(numImages * venueSplit)
    let desiredNumGlobalImages =  numImages - desiredNumVenueImages
    const numGlobalImagesQuery = await pool.query(`select count (*) from metadata where venue!='${venue}' and moderation_state=1`)
    const numGlobalImages = numGlobalImagesQuery.rows[0].count
    const isEnoughGlobalImages = numGlobalImages >= desiredNumGlobalImages
    if(!isEnoughGlobalImages) {
      desiredNumVenueImages = desiredNumVenueImages + (desiredNumGlobalImages - numGlobalImages)
      desiredNumGlobalImages = numGlobalImages
    }
    const venueImages = await pool.query(
      `select * from metadata where venue='${venue}' and moderation_state=1 order by created_timestamp desc limit ${desiredNumVenueImages}`
    )
    desiredNumGlobalImages = numImages - venueImages.rows.length
    const globalImages = await pool.query(
      `select * from metadata where venue!='${venue}' and moderation_state=1 order by created_timestamp desc limit ${desiredNumGlobalImages}`
    )
    // console.log(venueImages.rows.length, globalImages.rows.length)
    return [...venueImages.rows, ...globalImages.rows]
  } catch (error) {
    console.log(error)
    throw(error)
  }
}

export async function getCredentialsFromUsername(username) {
  try {
    const res = await pool.query(`select * from users where name='${username}'`)
    return res.rows[0]
  } catch (error) {
    console.log(error)
    throw(error)
  }
}

//sets an image's featured state (boolean)
export async function setFeaturedState(imageId, featured) {
  const client = await pool.connect()
  try {
    const res = await client.query(
      `update metadata set featured=${featured} where image_id='${imageId}'`
    )
    await client.release()
    return res.rows
  } catch (error) {
    await client.release(true)
    throw(error)
  }
}