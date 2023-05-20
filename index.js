const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


//  middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qagbjwf.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const toysCollection = client.db('toys').collection('toysCollection')

        const indexKeys = { SellerName: 1, ToyName: 1 };
        const indexOptions = { name: 'sellernameToyname' }

        const result = await toysCollection.createIndex(indexKeys, indexOptions);

        app.get('/alltoys', async (req, res) => {
            const query = {}
            const toys = await toysCollection.find(query).toArray()
            res.send(toys)
        })

        app.get('/toysearchByTitle/:text', async (req, res) => {
            const searchText = req.params.text;
            const result = await toysCollection.find({
                $or: [
                    { sellerName: { $regex: searchText, $options: 'i' } },
                    { ToyName: { $regex: searchText, $options: 'i' } },
                ],
            }).toArray()
            res.send(result)
        })

        app.post('/alltoys', async (req, res) => {
            const toys = req.body
            const result = await toysCollection.insertOne(toys)
            res.send(result);
        })
       
        app.get('/toy', async (req, res) => {
            const query = {}
            const toys = await toysCollection.find(query).toArray()
            res.send(toys)
        })


        app.get("/toys/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const singleToys = await toysCollection.findOne(query)
            res.send(singleToys)
        });

        app.get('/toy/:email', async (req, res) => {
            console.log(req.query);
            const email = req.params.email
            console.log(email);
            const query = { sellerEmail: email }
            console.log(query);
            const myToy = await toysCollection.find(query).toArray()
            res.send(myToy);


        });
      
        

        app.patch('/toy/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const updateToy = req.body;
            console.log(updateToy);
            const updateDoc = {
                $set: {
                  status: updateToy.status
                },
              };
            const result = await toysCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result)

        })

        // await client.connect();


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('port running')
})
app.listen(port, () => {
    console.log(`toys server is running on port ${port}`);
})