var mysql = require("mysql");

// const con = mysql.createConnection({
//   host: "localhost",
//   user: "apifarmageotest_migracion",
//   password: "migracion_2309",
//   database: "apifarmageotest_bd",
//   charset: "utf8mb4",
// });
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "farmageo",
  charset: "utf8mb4",
});
con.query("SET GLOBAL connect_timeout=28800");
con.query("SET GLOBAL interactive_timeout=28800");
con.query("SET GLOBAL wait_timeout=28800");

module.exports = con;
