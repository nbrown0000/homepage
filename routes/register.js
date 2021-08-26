const express = require('express')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient
const axios = require('axios')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { check, validationResult } = require('express-validator')
const { redirectHome } = require('../middleware/redirects')
const {
  DB_URL,
  DB_NAME,
  WEATHER_API_KEY
} = require('../config')

const registerValidate = [
  check('name')
    .not().isEmpty().trim().escape(),
  check('city')
    .not().isEmpty().trim().escape(),
  check('country')
    .not().isEmpty().trim().escape(),
  check('email')
    .isEmail().withMessage('Must be valid email')
    .trim().escape().normalizeEmail(),
  check('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches('[0-9]').withMessage('Password must contain a number')
    .matches('[A-Z]').withMessage('Password must contain an uppercase letter')
    .trim().escape()
]

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
  const error = req.session.error || ''

  res.render('register', { error })
})

router.post('/', registerValidate, (req, res) => {
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    const errorMessage = validationErrors.array().reduce((acc, cur) => {
      return acc + cur.msg + '. '
    }, '')
    req.session.error = `${errorMessage}`
    return res.redirect('/register')
  }

  // const { name, city, country, email, password } = req.body
  // if (!(name && city && country && email && password)) { // TODO: validation
  //   res.status(401).json({ error: 'Name, city, country, email and/or password not supplied'})
  // }

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
          req.session.error = ''
          res.redirect('/login')
        })
        .catch(err => console.error(err))
    })

    
  })
})

module.exports = router