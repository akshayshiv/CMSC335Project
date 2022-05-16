const path = require("path");
const fetch = require('node-fetch');

require("dotenv").config({ path: path.resolve(__dirname, 'env/.env') }) 

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
 /* Our database and collection */
 const databaseAndCollection = {db: "finalDB", collection:"card"};
/****** DO NOT MODIFY FROM THIS POINT ONE ******/
const { MongoClient, ServerApiVersion, GridFSBucketReadStream } = require('mongodb');
let http = require('http');


const express = require('express');
const app = express();

app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));

app.set('view engine', 'ejs');



let bodyParser = require("body-parser"); /* To handle post parameters */ 
const { resourceLimits } = require("worker_threads");
app.use(bodyParser.urlencoded({extended:false})); 
var tempHTML = "";



async function main(){

    const uri = `mongodb+srv://${userName}:${password}@cluster0.qplqm.mongodb.net/${databaseAndCollection.db}s?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect();
    http.createServer(app).listen(8000);
    console.log(`Web server started and running at http://localhost:${8000}`);

    app.get('/', function(req, res) {
        res.render('../templates/', );
    });
    app.post('/', async function(req, res) {	
        let {name} =  req.body;
        await insertData(client, databaseAndCollection, {name:name});
        let html = `${name.charAt(0).toUpperCase() + name.slice(1)}'s abilities<br><br><table border=1><th>Abilities</th>`;
        let url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
        await fetch(url)
	    .then(response => response.json())
        .then(json => processObject(json))
        .catch(error => console.log("Not a Pokemon Error: " + error), tempHTML = "");
        res.render('../templates/displayPic', {poke:html+tempHTML})
    });

    app.get('/search', async function(req, res){
        const cursor = client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .find({});
        const result = await cursor.toArray();
        let html = `<table border = 1 ><caption>Search History</caption><th>Name</th><br>`;
        for(let i = 0; i < result.length; i++){
            html+=`<tr><td>${result[i].name}</td></tr>` ;
        }
        html+= '</table>';
        res.render('../templates/search', {table:html})
    });



    async function processObject(json){
        tempHTML = "";
        for(let i = 0; i < json['abilities'].length; i++){
            tempHTML += `<tr><td>${json['abilities'][i]['ability']['name']}</td></tr>`;
       }
       tempHTML += "</table>";
       
    }
    async function insertData(client, databaseAndCollection, data) {
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(data);
    }

}
main().catch(console.error);
