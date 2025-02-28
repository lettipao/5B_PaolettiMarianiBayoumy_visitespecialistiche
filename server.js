const express = require("express");
const http = require('http');
const path = require('path');
const app = express();
const fs = require('fs');
const mysql = require('mysql2');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const conf = JSON.parse(fs.readFileSync("public/conf.json")).dbLogin;

conf.ssl.ca = fs.readFileSync(__dirname + '/ca.pem');
const connection = mysql.createConnection(conf);

const database = module.require("./database.js")

app.use("/", express.static(path.join(__dirname, "public")));

app.post("/visite/add",async (req, res) => {
    //controllo validità
    const list = await database.select()
    const check = controlloPrenotazione(list,req.body)
    
    database.insert(req);
    res.json({"result":"OK"});
});
app.get('/visite',async (req, res) => {
    const list = await database.select();
    res.json(list);    
})
app.delete('/delete/:id',async (req, res) => {
    const id = req.params.id;
    await database.delete(id)  
    res.json({result: "ok"});   
})


const server = http.createServer(app);

server.listen(5600, () => {
  console.log("- server running");
});

//CREA ENTITA DELLE DIVERSE TIPOLOGIE
/*
const tipologie = ["Cardiologia","Psicologia","Oncologia","Ortopedia","Neurologia"];
tipologie.forEach((tipologia) => {
        database.initializeTypes(tipologia);
})
*/


const controlloPrenotazione = (tuttiDati,datiInput) => {
    tuttiDati.forEach(element => {
        if (element.type == datiInput.categoria){
            if (element.data == inputDati.data && element.ora == inputDati.ora){
                console.log("MATCH")
                return false;
            }
        }
    })
    return true;
}