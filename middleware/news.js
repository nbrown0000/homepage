const MongoClient = require("mongodb").MongoClient
const { ObjectId } = require("mongodb")
const axios = require("axios")

const {
  DB_URL,
  DB_NAME,
  NEWS_API_KEY
} = require("../config")

const getNewsData = async (req, res, next) => {
  console.log('Fetching News (feature coming soon!)')

  next()
}

module.exports = {
  getNewsData,
}
