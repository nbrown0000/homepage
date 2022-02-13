const DAY = 1000 * 60 * 60 * 24;

const {
  NODE_ENV = process.env.NODE_ENV || "development",
  SESS_NAME,
  SESS_SECRET,
  SESS_LIFETIME = process.env.SESS_LIFETIME || DAY,
  DB_URL = process.env.MONGODB_URI,
  DB_PORT,
  DB_NAME,
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
