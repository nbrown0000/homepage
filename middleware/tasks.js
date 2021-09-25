const MongoClient = require("mongodb").MongoClient
const { ObjectId } = require("mongodb")

const {
  DB_URL,
  DB_NAME,
} = require("../config")

const getTasksData = async (req, res, next) => {

  // Connect to Mongo DB Client
  const client = await MongoClient.connect(DB_URL)
    .catch(err => console.log(err))

  if(!client) {
    console.error('Error connecting to DB')
    return
  }

  // get tasks from DB
  try {
    const db = client.db(DB_NAME)
    let collection = db.collection('tasks')
    let query = { user_id: ObjectId(req.session.userId) }
    const response = await collection.find(query).toArray()
    
    if(response) {
      // store tasks in res.locals
      res.locals.tasksData = response
    }

  } catch (err) {
    console.log(err)
  }

  next()
}

module.exports = {
  getTasksData
}
