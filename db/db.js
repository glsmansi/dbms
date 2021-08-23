var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Gubba0408',
    database: 'BRANCHFEST'
});

connection.connect(function (err) {
    if (err) throw err;
});


module.exports = connection;
