const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const MongoClient = require('mongodb').MongoClient
const expressLayouts = require('express-ejs-layouts')
const axios = require('axios')
const dotenv = require('dotenv')
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
    res.redirect('/login')
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

app.get('/', redirectLogin, (req, res) => {
  const { userId } = req.session
  if (!userId) {
    return res.redirect('/login')
  }

  res.render('index')
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