const express = require('express')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient
const bcrypt = require('bcrypt');
const { redirectHome } = require('../middleware/redirects')
const {
  DB_URL,
  DB_NAME,
} = require('../config')

router.get('/', redirectHome, (req, res) => {
  const error = req.session.error || ''
  
  res.render('login', { error })
})

router.post('/', (req, res) => {
  const { email, password } = req.body
  if (email && password) { // TODO: validation

    MongoClient.connect(DB_URL, (err, client) => {
      if (err) return console.log(err)
      db = client.db(DB_NAME)
      db.collection('users')
        .findOne({ "email": email })
        .then(async user => {
          
          const match = await bcrypt.compare(password, user.password)
          if (user.email === email && match) {
            req.session.error = ''
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

module.exports = router