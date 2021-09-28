const MongoClient = require('mongodb').MongoClient
const { ObjectId } = require('mongodb')
const axios = require('axios')

const {
  DB_URL,
  DB_NAME,
  WEATHER_API_KEY
} = require('../config')


const getWeatherData = async (req, res, next) => {
  
  const client = await MongoClient.connect(DB_URL)
    .catch(err => console.error(err))

  if(!client) { return }

  // check if weather up to date
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('weather')
    let query = { user_id: ObjectId(req.session.userId) }
    const response = await collection.findOne(query)
    
    if(response) {
      const dateLastFetched = new Date(response.weatherData.dateFetched)
      const dateLastFetched_date = dateLastFetched.getDate()
      const dateLastFetched_month = dateLastFetched.getMonth() + 1
      const today = new Date()
      const today_date = today.getDate()
      const today_month = today.getMonth() + 1
      
      // Check DB for last datetime accessed
      // If within the same day pass stored weather data to app.locals
      if (today_date <= dateLastFetched_date && today_month == dateLastFetched_month) {
        res.locals.weatherData = response.weatherData
        return next()
      }
    }

  } catch (err) {
    console.error(err)
  }

  // get user geoData
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('geolocation')
    let query = { "user_id": ObjectId(req.session.userId) } 
    const response = await collection.findOne(query)
    const { lat, lon } = response
    res.locals.geoData = { lat, lon }
  } catch (err) { console.error(err) }

  // get date of last weather fetch
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('weather')
    let query = { "user_id": ObjectId(req.session.userId) } 
    const response = await collection.findOne(query)
    if(response) {
      res.locals.dateWeatherFetched = response.weatherData.dateWeatherFetched
    }
  } catch (err) { console.error(err) }

  // fetch new weather report
  // and store in app.locals with dateFetched timestamp
  try {
    const { lat, lon } = res.locals.geoData
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,current,alerts&units=metric&appid=${WEATHER_API_KEY}`)
    res.locals.weatherData = response.data
    res.locals.weatherData.dateFetched = new Date().toUTCString()
  } catch (err) { console.error(err) }

  // store weather in DB
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('weather')
    let query = { user_id: ObjectId(req.session.userId) }
    let update = { $set: { weatherData: res.locals.weatherData } }
    const response = collection.updateOne(query, update, {upsert:true})

  } catch (err) { console.error(err) }
  
  next()
}


module.exports = {
  getWeatherData
}