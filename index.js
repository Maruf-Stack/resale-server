const express = require('express')
const app = express('cors')
const port = process.env.PORT || 5000;
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { query } = require('express');
require('dotenv').config()
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ei8vvcb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}
async function run() {
    try {
        const alltypeCollection = client.db('Resale').collection('all categories');
        const bookingCollection = client.db('Resale').collection('booking bus')
        const userCollection = client.db('Resale').collection('users')
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
            const result = bookingCollection.insertOne(booking)
            res.send(result)
        })
        app.get('/bookings', verifyToken, async (req, res) => {
            const email = req.query.email;
            const decoded = req.decoded.email;
            if (email !== decoded) {
                res.status(403).send('Forbidden access')
            }
            const query = { email: email };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings)
        })
        app.get('/jwt', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const user = await userCollection.findOne(query)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '5h' })
                return res.send({ accessToken: token })
            }
            console.log(user)
            res.status(403).send({ accessToken: '' })

        })
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await userCollection.insertOne(users);
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray()
            res.send(users)

        })
        app.put('/users/admit/:id', jwt.verify, async (req, res) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = userCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send('forbidden access')
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const update = {
                $set: {
                    role: 'admin'
                }
            }
            const result = userCollection.updateOne(filter, update, option);
            res.send(result)
        })
        app.get('/users/admit/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })
        app.get('/users/seller/:option', async (req, res) => {
            const option = req.params.option;
            const query = { option }
            const user = await userCollection.findOne(query);
            res.send(user)
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