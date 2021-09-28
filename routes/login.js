const express = require('express')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator')
const { redirectHome } = require('../middleware/redirects')
const {
  DB_URL,
  DB_NAME,
} = require('../config')

const loginValidate = [
  check('email')
    .isEmail().withMessage('Must be valid email')
    .trim().escape().normalizeEmail(),
  check('password')
    .trim().escape()
]

router.get('/', redirectHome, (req, res) => {
  const error = req.session.error || ''
  
  res.render('login', { error })
})

router.post('/', loginValidate, (req, res) => {
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    const errorMessage = validationErrors.array().reduce((acc, cur) => {
      return acc + cur.msg + '. '
    }, '')
    req.session.error = `${errorMessage}`
    return res.redirect('/login')
  }

  const { email, password } = req.body

  MongoClient.connect(DB_URL, (err, client) => {
    if (err) return console.error(err)
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

})

module.exports = router