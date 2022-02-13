const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const expressLayouts = require('express-ejs-layouts')
const dotenv = require('dotenv')
dotenv.config()

const {
  PORT,
  NODE_ENV,
  SESS_NAME,
  SESS_SECRET,
  SESS_LIFETIME,
  DB_URL,
} = require('./config')

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
    maxAge: Number(SESS_LIFETIME),
    sameSite: true, // TODO: CSRF
    secure: IN_PROD
  }
}))

const { redirectLogin } = require('./middleware/redirects')
const { getWeatherData } = require('./middleware/weather')
const { getNewsData } = require('./middleware/news')
const { getTasksData } = require('./middleware/tasks')

const loginRoute = require('./routes/login')
const registerRoute = require('./routes/register')

app.get('/', redirectLogin, getWeatherData, getNewsData, getTasksData, (req, res) => {
  const { weatherData, newsData, tasksData }  = res.locals
  res.render('index', { weatherData, newsData, tasksData })
})

app.use('/login', loginRoute)
app.use('/register', registerRoute)

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if(err) {
      return res.redirect('/')
    }
    res.clearCookie(SESS_NAME)
    res.redirect('/login')
  })

})

module.exports = app