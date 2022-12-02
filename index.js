const express = require('express')
const app = express('cors')
const port = process.env.PORT || 5000;
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const http = require('http')
const { query } = require('express');
const { consumers } = require('stream');
const { send } = require('process');
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
        const myProductCollection = client.db('Resale').collection('Seller products')
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
                return res.status(403).send('Forbidden access')
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
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '24h' })
                return res.send({ accessToken: token })
            }
            console.log(user)
            res.status(403).send({ accessToken: '' })

        })
        // user 
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
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(filter)
            res.send(result)
        })
        // admin 
        app.put('/users/admin/:id', jwt.verify, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })


        // seller 
        app.get('/users/sellers/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' })
        })
        app.post('/myproducts', async (req, res) => {
            const product = req.body;
            const result = await myProductCollection.insertOne(product)
            res.send(result)
        })
        app.get('/myproducts', async (req, res) => {
            const query = {};
            const result = await myProductCollection.find(query).toArray();
            res.send(result)
        })
        app.delete('/myproducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await myProductCollection.deleteOne(filter)
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


server = http.createServer(function (req, res) {

    res.write('Hello, World!');

    res.setHeader('X-Foo', 'bar');

    res.setHeader('Content-Type', 'text/plain');

    res.end();

}).listen(8080);