const MongoClient = require("mongodb").MongoClient
const { ObjectId } = require("mongodb")
const axios = require("axios")

const {
  DB_URL,
  DB_NAME,
  NEWS_API_KEY
} = require("../config")

const getNewsData = async (req, res, next) => {

  // Connect to Mongo DB Client
  const client = await MongoClient.connect(DB_URL)
    .catch(err => console.log(err))

  if(!client) {
    console.error('Error connecting to DB')
    return
  }

  // check if news up to date
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('news')
    let query = { user_id: ObjectId(req.session.userId) }
    const response = await collection.findOne(query)
    
    if(response) {
      const dateLastFetched = new Date(response.newsData.dateFetched)
      const dateLastFetched_minute = dateLastFetched.getMinutes()
      const today = new Date()
      const today_minute = today.getMinutes()

      const daysPassed = today.getDate() -  dateLastFetched.getDate()
      const minutesPassed = today_minute - dateLastFetched_minute
      
      // Check DB for last datetime accessed
      // If within the last 2 hour pass stored news data to app.locals
      if (daysPassed < 1 && minutesPassed < 120) {
        res.locals.newsData = response.newsData
        return next()
      }
    }

  } catch (err) {
    console.error(err)
  }

  // get country data from user account
  let userCountry
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('users')
    let query = { _id: ObjectId(req.session.userId) }
    const response = await collection.findOne(query)
    const { country } = response
    userCountry = country

  } catch (err) { return console.error(err) }

  // convert country name to country code
  const countryData = require('../data/countryData')
  const data = await countryData.find(c => c.Name.toLowerCase() === userCountry.toLowerCase())
  const countryCode = data.Code

  // Get news data
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=${countryCode}&apiKey=${NEWS_API_KEY}`)
    // Store news in res.locals so '/' route can read and pass it to views
    res.locals.newsData = response.data
    res.locals.newsData.dateFetched = new Date().toUTCString()
  } catch (err) { console.error(err) }

  // store news in DB
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('news')
    let query = { user_id: ObjectId(req.session.userId) }
    let update = { $set: { newsData: res.locals.newsData } }
    const response = await collection.updateOne(query, update, {upsert:true})

  } catch (err) { console.error(err) }

  next()
}

module.exports = {
  getNewsData
}
