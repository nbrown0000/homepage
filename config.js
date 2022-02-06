const DAY = 1000 * 60 * 60 * 24;

const {
  NODE_ENV = "development",
  SESS_NAME = "sid",
  SESS_SECRET = "something!that$is%secret&",
  SESS_LIFETIME = DAY,
  DB_URL = process.env.MONGODB_URI,
  DB_PORT = "27017",
  DB_NAME = "homepage",
  WEATHER_API_KEY,
  NEWS_API_KEY,
} = process.env;

module.exports = {
  NODE_ENV,
  SESS_NAME,
  SESS_SECRET,
  SESS_LIFETIME,
  DB_URL,
  DB_PORT,
  DB_NAME,
  WEATHER_API_KEY,
  NEWS_API_KEY,
};
