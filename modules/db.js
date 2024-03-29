import pg from 'pg'
import { venues } from '../src/utils/enum.js'

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
    const queryValues = [
      imageId,
      sessionId,
      venue,
      plantName,
      userName,
      drawingPrompt,
      createdTimestamp,
      moderationState,
      featured,
    ]
    await client.query(queryText, queryValues)
    await client.query('COMMIT')
    await client.release()
  } catch (error) {
    await client.query('ROLLBACK')
    await client.release(true)
    console.log(error)
    throw error
  }
}

export async function deleteMetadata(imageId) {
  const client = await pool.connect()
  try {
    await client.query(`delete from metadata where image_id='${imageId}'`)
    await client.release()
  } catch (error) {
    await client.release(true)
    throw error
  }
}

export async function getNumImages({ loggedInVenue, filters }) {
  const client = await pool.connect()
  try {
    const filterClause = buildFilterClause(loggedInVenue, filters)
    const res = await client.query(`select count (*) from metadata ${filterClause}`)
    await client.release()
    return parseInt(res.rows[0].count)
  } catch (error) {
    await client.release(true)
    throw error
  }
}

export async function getImages({ loggedInVenue, page, imagesPerPage, filters }) {
  const client = await pool.connect()
  try {
    const filterClause = buildFilterClause(loggedInVenue, filters)
    const res = await client.query(
      `select * from metadata ${filterClause} order by created_timestamp desc offset ${
        (page - 1) * imagesPerPage
      } rows fetch next ${imagesPerPage} rows only`
    )
    await client.release()
    return res.rows
  } catch (error) {
    await client.release(true)
    throw error
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
    throw error
  }
}

export async function countUnmoderatedImages(loggedInVenue) {
  try {
    const res = await pool.query(
      `select count (*) from metadata where moderation_state=0 ${
        loggedInVenue === 'Global' ? '' : `and venue='${loggedInVenue}'`
      }`
    )
    return res.rows[0].count
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getNextUnmoderatedImageMetadata(loggedInVenue) {
  try {
    const res = await pool.query(
      `select * from metadata where moderation_state=0 ${
        loggedInVenue === 'Global' ? '' : `and venue='${loggedInVenue}'`
      }order by created_timestamp limit 1`
    )
    return res.rows[0]
  } catch (error) {
    console.log(error)
    throw error
  }
}

//get latest images, split between global and venue
export async function getLatestImages(numImages, venue, featuredSplit, venueSplit) {
  try {
    const venueList = Object.keys(venues)
    const numVenues = venueList.length
    const desiredNumVenueImages = Math.round(numImages * featuredSplit * venueSplit)
    const recentVenueImages100 = await pool.query(
      `select * from metadata where venue='${venue}' and moderation_state=1 order by created_timestamp desc limit 100`
    )
    const randomizedRecentVenueImages = getMultipleRandom(recentVenueImages100.rows, desiredNumVenueImages)
    const desiredNumOtherVenueImages = Math.round((numImages * featuredSplit * (1 - venueSplit)) / numVenues)
    const otherVenueList = venueList.filter((x) => x !== venue)
    const otherVenueImages = []
    for await (const otherVenue of otherVenueList) {
      const recentOtherVenueImages100 = await pool.query(
        `select * from metadata where venue!='${otherVenue}' and moderation_state=1 order by created_timestamp desc limit 100`
      )
      otherVenueImages.push(...getMultipleRandom(recentOtherVenueImages100.rows, desiredNumOtherVenueImages))
    }

    const numFeaturedImages = numImages - randomizedRecentVenueImages.length - otherVenueImages.length
    const venueAndOtherVenueImages = [...randomizedRecentVenueImages, ...otherVenueImages]
    const featuredImages = await pool.query(`select * from metadata where featured=true and moderation_state=1`)
    const randomFeaturedImages = getMultipleRandom(featuredImages.rows, numFeaturedImages)
    return [...venueAndOtherVenueImages, ...randomFeaturedImages]
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getCredentialsFromUsername(username) {
  try {
    const res = await pool.query(`select * from users where name='${username}'`)
    return res.rows[0]
  } catch (error) {
    console.log(error)
    throw error
  }
}

//sets an image's featured state (boolean)
export async function setFeaturedState(imageId, featured) {
  const client = await pool.connect()
  try {
    const res = await client.query(`update metadata set featured=${featured} where image_id='${imageId}'`)
    await client.release()
    return res.rows
  } catch (error) {
    await client.release(true)
    throw error
  }
}

function buildFilterClause(loggedInVenue, filters) {
  const venueFilterClause =
    loggedInVenue !== 'Global'
      ? ` venue='${loggedInVenue}' `
      : filters.venue !== 'Global'
      ? ` venue='${filters.venue}' `
      : ''
  const statusFilterClause = statusClauseLookup[filters.status]

  return `${!!(venueFilterClause || statusFilterClause) ? 'where ' : ''} ${venueFilterClause} ${
    !!(venueFilterClause && statusFilterClause) ? 'and ' : ''
  }${statusFilterClause}`
}

const statusClauseLookup = {
  All: '',
  Featured: 'featured=true',
  Approved: 'moderation_state=1',
  Denied: 'moderation_state=2',
  Unmoderated: 'moderation_state=0',
}

function getMultipleRandom(arr, num) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, num)
}
