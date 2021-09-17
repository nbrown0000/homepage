const MongoClient = require("mongodb").MongoClient
const { ObjectId } = require("mongodb")
const axios = require("axios")

const {
  DB_URL,
  DB_NAME,
  NEWS_API_KEY
} = require("../config")

const getTasksData = async (req, res, next) => {

  let tasks = [
    {
      id: 1,
      name: "Shopping",
      todos: [
        {
          id: 1,
          text: "eat pizza",
          done: false
        },
        {
          id: 2,
          text: "buy socks",
          done: true
        },
        {
          id: 3,
          text: "code stuff!",
          done: false
        }
      ]
    },
    {
      id: 2,
      name: "Study",
      todos: [
        {
          id: 4,
          text: "read chapter 4",
          done: false
        },
        {
          id: 5,
          text: "start assignment 2",
          done: false
        }
      ]
    }
  ]

  // Store weather in res.locals so '/' route can read and pass it to views
  res.locals.tasksData = tasks

  next()
}

module.exports = {
  getTasksData
}
