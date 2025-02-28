const { exec } = require("child_process");
const fs = require("fs");
const mysql = require("mysql2")
const conf = JSON.parse(fs.readFileSync("public/conf.json")).dbLogin;


conf.ssl = {
    ca: fs.readFileSync(__dirname + '/ca.pem')
}

//console.log(conf)
const connection = mysql.createConnection(conf)
//console.log(connection);

const executeQuery = (query,parametri) => {
    return new Promise((resolve, reject) => {      
          connection.query(query,parametri, (err, result) => {
             if (err) {
                console.error(err);
                reject();     
             }   
             console.log('done');
             resolve(result);         
       });
    })
}

const database = {

    createTable: () => {
        executeQuery(`
        CREATE TABLE IF NOT EXISTS type (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name varchar(20)
        )`);
        return executeQuery(`
        CREATE TABLE IF NOT EXISTS booking (
        id INT PRIMARY KEY AUTO_INCREMENT,
        data DATE NOT NULL,
        ora INT NOT NULL,
        nominativa VARCHAR(50) NOT NULL,
        idType INT NOT NULL,
        FOREIGN KEY (idType) REFERENCES type(id)
        )`) ;
    },

    initializeTypes: (name) => {
        let sql = `INSERT INTO type (name) VALUES (?)`;

        values = [
            name
        ];
        
        return executeQuery(sql,values)
    },

    insert: (booking) => {
        sql = `INSERT INTO booking (data,ora,nominativo,categoria) VALUES (?,?,?,?)`;

        values = [
            booking.data,
            booking.ora,
            booking.nominativo,
            booking.categoria
        ];

        return executeQuery(sql, values);
    },

    select: () => {
        const sql = `SELECT "type".id, "booking".data, "booking".ora, "booking".nominativa 
             FROM "booking" JOIN "type" ON "booking".idType = "type".id`;
    return executeQuery(sql);
    },

    delete: (id) => {
        const sql = `DELETE FROM booking WHERE id = ?`;

        return new Promise((resolve, reject) => {
            connection.query(sql, [id], (err, result) => {
                if (err) {
                    console.error("Errore:", err);
                    reject(err);
                }
                resolve(console.log("OK"));
            });
    });
    }
}

database.createTable().then(() => {
    //PER RESETTARE LA TABELLA
    //executeQuery("DROP TABLE booking");
});

module.exports = database;