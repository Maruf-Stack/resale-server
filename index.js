const express = require('express')
const app = express('cors')
const port = process.env.PORT || 5000;
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config()
app.use(cors())
app.use(express.json())

//resaledb
//9jm39RWsv3uWHHFK



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ei8vvcb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const alltypeCollection = client.db('Resale').collection('all categories');
        const bookingCollection = client.db('Resale').collection('booking bus')
        const buyerCollection = client.db('Resale').collection('buyers')
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
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking)
            const result = bookingCollection.insertOne(booking)
            res.send(result)
        })
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings)
        })
        app.post('/buyers', async (req, res) => {
            const buyer = req.body;
            const result = await buyerCollection.insertOne(buyer);
            res.send(result)
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