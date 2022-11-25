const express = require('express')
const app = express('cors')
const port = process.env.PORT || 5000;
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
app.use(cors())
app.use(express.json())

//resaledb
//9jm39RWsv3uWHHFK



const uri = "mongodb+srv://resaledb:9jm39RWsv3uWHHFK@cluster0.ei8vvcb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const alltypeCollection = client.db('Resale').collection('all categories');
        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await alltypeCollection.find(query).toArray();
            res.send(categories)
        })
        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const category = await (alltypeCollection.findOne(query));
            res.send(category)
        })
    }
    finally {

    }
}
run().catch(error => console.error(error))


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})