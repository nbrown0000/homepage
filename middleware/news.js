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

  // Get weather data
  const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=au&apiKey=${NEWS_API_KEY}`)

  // Store weather in res.locals so '/' route can read and pass it to views
  res.locals.newsData = response.data

  next()
}

module.exports = {
  getNewsData
}
