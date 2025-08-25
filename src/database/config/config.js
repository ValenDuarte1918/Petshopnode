require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DB_USER || "335850",
    "password": process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "grupo7DH",
    "database": process.env.DB_NAME || "petshop-innovador_db",
    "host": process.env.DB_HOST || "mysql-petshop-innovador.alwaysdata.net",
    "port": process.env.DB_PORT || 3306,
    "dialect": "mysql",
    "logging": process.env.DEBUG_SQL === 'true' ? console.log : false,
    "dialectOptions": {
      "connectTimeout": 60000
    },
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "petshop_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT || 3306,
    "dialect": "mysql",
    "logging": false,
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
