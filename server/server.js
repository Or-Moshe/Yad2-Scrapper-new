/*
const http = require('node:http');

const PORT = 8000;
const HOSTNAME = "127.0.0.1";


const server = http.createServer((req, res) => {
    req.on("data", (chunk) => {
        console.log(chunk);
    });

    // When all data has been received
    req.on("end", () => {
        console.log("end!!");
        // Send response back to client
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end();
        console.log(res);
    });
});

server.listen(PORT, HOSTNAME, () => {
    console.log("server is listening on", server.address());
});
*/

const { connectToDb, upsertManyIntoCollection} = require("./db");
const { getOrderData } = require("./helper");
const express = require('express')
const cors = require('cors');
const {writeToExcel} = require('./fileWriter');
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json()); // This will parse JSON payloads

app.post('/selling', async(req, res) => {
    try {

        // Insert into the 'cities' collection
        await upsertManyIntoCollection('sellingAssets', req.body);
        await writeToExcel(req.body);
        //await writeMany(req.body);
        res.send({statusCode: 200, message: "succeed"})
    } catch (error) {
        console.log(error);
        res.send({statusCode: 201, message: error})
    }

})

app.listen(PORT, async() => {
    try {
        db = await connectToDb();
        
        console.log(`Example app listening on port ${PORT}`)
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
})