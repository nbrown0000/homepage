const express = require('express')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient
const axios = require('axios')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { redirectHome } = require('../middleware/redirects')
const {
  DB_URL,
  DB_NAME,
  WEATHER_API_KEY
} = require('../config')

async function getLatLon(city, country) {
  const countryData = require('../data/countryData')
  const data = await countryData.find(c => c.Name.toLowerCase() === country.toLowerCase())
  const countryCode = data.Code
  const latlonData = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${WEATHER_API_KEY}`
  )
  return latlonData
}

router.get('/', redirectHome, (req, res) => {
  res.render('register')
})

router.post('/', (req, res) => {
  const { name, city, country, email, password } = req.body
  if (!(name && city && country && email && password)) { // TODO: validation
    res.status(401).json({ error: 'Name, city, country, email and/or password not supplied'})
  }

  MongoClient.connect(DB_URL, async (err, client) => {
    if (err) return console.log(err)

    const latlonResponse = await getLatLon(city, country)
    const { lat, lon } = latlonResponse.data.coord
    
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) { console.error(err) }
      
      db = client.db(DB_NAME)
      db.collection('users').insertOne({
        name,
        geoData: { lat, lon },
        email,
        password: hash
      })
        .then(success => {
          res.redirect('/login')
        })
        .catch(err => console.error(err))
    })

    
  })
})

module.exports = router