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

  // Get weather data
  const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=${countryCode}&apiKey=${NEWS_API_KEY}`)

  // Store weather in res.locals so '/' route can read and pass it to views
  res.locals.newsData = response.data

  next()
}

module.exports = {
  getNewsData
}
