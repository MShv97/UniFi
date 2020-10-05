const mysql = require("mysql");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "UniFi"
});

con.connect((err) => {
    if (err) console.log(err);
    else console.log("connected to database..");
});

module.exports = con;