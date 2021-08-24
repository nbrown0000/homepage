const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const MongoClient = require('mongodb').MongoClient
const expressLayouts = require('express-ejs-layouts')
const axios = require('axios')
const dotenv = require('dotenv')
const { ObjectId } = require('mongodb')
dotenv.config()

const DAY =  1000 * 60 * 60 * 24

const {
  PORT = 3000,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_SECRET = 'something!that$is%secret&',
  SESS_LIFETIME = DAY,
  DB_URL = 'mongodb://localhost/',
  DB_PORT = '27017',
  DB_NAME = 'homepage',
  WEATHER_API_KEY
} = process.env

const IN_PROD = NODE_ENV === 'production'

const app = express()

// Static Files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))

// Set Templating Engine
app.use(expressLayouts)
app.set('layout', './layouts/full-width')
app.set('view engine', 'ejs')

app.use(express.urlencoded({
  extended: true
}))

app.use(session({
  name: SESS_NAME,
  resave: false,
  saveUninitialized: false,
  secret: SESS_SECRET,
  store: MongoStore.create({ mongoUrl: DB_URL }),
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite: true, // TODO: CSRF
    secure: IN_PROD
  }
}))

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login')
  } else {
    next()
  }
}

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/')
  } else {
    next()
  }
}

const getWeatherData = async (req, res, next) => {
  
  const client = await MongoClient.connect(DB_URL)
    .catch(err => console.log(err))

  if(!client) { return }

  // check if weather up to date
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('users')
    let query = { _id: ObjectId(req.session.userId) }
    const response = await collection.findOne(query)
    
    const dateLastFetched = new Date(response.weatherData.dateFetched)
    const dateLastFetched_date = dateLastFetched.getDate()
    const dateLastFetched_month = dateLastFetched.getMonth() + 1
    const today = new Date()
    const today_date = today.getDate()
    const today_month = today.getMonth() + 1
    
    // Check DB for last datetime accessed
    // If within the same day pass stored weather data to app.locals
    if (today_date <= dateLastFetched_date && today_month == dateLastFetched_month) {
      app.locals.weatherData = response.weatherData
      next()
    }

  } catch (err) {
    console.log(err)
  }

  // get user geoData
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('users')
    let query = { "_id": ObjectId(req.session.userId) } 
    const response = await collection.findOne(query)
    // app.locals.dateWeatherFetched = response.dateWeatherFetched
    app.locals.geoData = response.geoData
  } catch (err) { console.log(err) }

  // fetch new weather report
  // and store in app.locals with dateFetched timestamp
  try {
    const { lat, lon } = app.locals.geoData
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,current,alerts&units=metric&appid=${WEATHER_API_KEY}`)
    app.locals.weatherData = response.data
    app.locals.weatherData.dateFetched = new Date().toUTCString()
  } catch (err) { console.log(err) }

  // store weather in DB
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('users')
    let query = { _id: ObjectId(req.session.userId) }
    let update = { $set: { weatherData: app.locals.weatherData } }
    const response = collection.updateOne(query, update)

  } catch (err) { console.log(err) }
  
  next()
}

app.get('/', redirectLogin, getWeatherData, (req, res) => {
  const { weatherData }  = app.locals
  console.log(weatherData.daily)
  res.render('index', { weatherData })
})

app.get('/login', redirectHome, (req, res) => {
  const error = req.session.error || ''
  
  res.render('login', { error })
})

app.get('/register', redirectHome, (req, res) => {
  res.render('register')
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  if (email && password) { // TODO: validation

    MongoClient.connect(DB_URL, (err, client) => {
      if (err) return console.log(err)
      db = client.db(DB_NAME)
      db.collection('users')
        .findOne({ "email": email })
        .then(user => {
          if (user.email === email && user.password === password) {
            req.session.userId = user._id.toHexString()
            return res.redirect('/')
          }
          req.session.error = 'Incorrect username or password'
          res.redirect('/login')
        })
        .catch(err => console.error(err))
    })

  }
  else {
    res.status(401).json({ error: 'Username or password not supplied'})
  }
})

async function getLatLon(city, country) {
  const countryData = require('./data/countryData')
  const data = await countryData.find(c => c.Name.toLowerCase() === country.toLowerCase())
  const countryCode = data.Code
  const latlonData = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${WEATHER_API_KEY}`
  )
  return latlonData
}

app.post('/register', (req, res) => {
  const { name, city, country, email, password } = req.body
  if (name && city && country && email && password) { // TODO: validation

    MongoClient.connect(DB_URL, async (err, client) => {
      if (err) return console.log(err)

      const latlonResponse = await getLatLon(city, country)
      const { lat, lon } = latlonResponse.data.coord

      db = client.db(DB_NAME)
      db.collection('users').insertOne({
        name,
        geoData: { lat, lon },
        email,
        password // TODO: Hash password
      })
        .then(success => {
          res.redirect('/login')
        })
        .catch(err => console.error(err))
    })

  }
  else {
    res.status(401).json({ error: 'Name, city, country, email and/or password not supplied'})
  }
})

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if(err) {
      return res.redirect('/')
    }
    res.clearCookie(SESS_NAME)
    res.redirect('/login')
  })

})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})