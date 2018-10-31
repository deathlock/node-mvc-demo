// var config = require("./config.js").get(process.env.NODE_ENV);

var config = {
  production: {
    mode: "production"
  },
  development: {
    database: "mongodb://localhost/nodemvc",
    mode: "development",
  },
  default: {
    database: "mongodb://localhost/nodemvc",
    mode: "default"
  }

}

exports.get = function get(env){
  return  config[env] || config.default;
}
