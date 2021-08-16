const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const MongoClient = require('mongodb').MongoClient

const DAY =  1000 * 60 * 60 * 24

const {
  PORT = 3000,
  NODE_ENV = 'development',
  SESS_NAME = 'sid',
  SESS_SECRET = 'something!that$is%secret&',
  SESS_LIFETIME = DAY,
  DB_URL = 'mongodb://localhost/',
  DB_PORT = '27017',
  DB_NAME = 'homepage'
} = process.env

const IN_PROD = NODE_ENV === 'production'

// TODO: DB
const users = [
  { id: 1, name: 'Alex', email: 'alex@gmail.com', password: 'secret' },
  { id: 2, name: 'Max', email: 'max@gmail.com', password: 'secret' },
  { id: 3, name: 'Bruce', email: 'bruce@gmail.com', password: 'secret' }
]

const app = express()

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

app.get('/', (req, res) => {
  const { userId } = req.session
  if (userId) {
    return res.redirect('/dashboard')
  }
  res.redirect('/login')
})

app.get('/dashboard', (req, res) => {
  res.send(`
    <h1>Dashboard</h1>
    <p>Weather</p>
    <p>News</p>
    <p>Todo List</p>
  `)
})

app.get('/login', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form method='post' action='/login'>
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Password' required />
      <input type='submit' />
    </form>
    <a href='/register'>Register</a>
  `)
})

app.get('/register', (req, res) => {
  res.send(`
    <h1>Register</h1>
    <form method='post' action='/register'>
      <input name='name' placeholder='Name' required />
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Password' required />
      <input type='submit' />
    </form>
    <a href='/login'>Login</a>
  `)
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  if (email && password) { // TODO: validation

    MongoClient.connect(DB_URL, (err, client) => {
      if (err) return console.log(err)
      db = client.db(DB_NAME)
      db.collection('users').find().toArray()
        .then(results => {
          const user = results[0]
          if (user.email === email && user.password === password) {
            req.session.userId = user._id.toHexString()
            return res.redirect('/dashboard')
          }
        })
        .catch(err => console.error(err))
    })

  }
})

app.post('/register', (req, res) => {

})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})