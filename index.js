const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
app.use(cors());
app.use(bodyParser.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l574mko.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Done!!! Full Yeaaaaaaaahh!!!');
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("myDB").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

   //main work

   //Add event via admin
  app.post('/addEvent', (req, res) => {
    const eventData = req.body;
     client.db('myDB').collection('events').insertOne(eventData)
     .then( (result) => {
        res.send(result.acknowledged);
     })
  })

  app.get('/events', (req,res) => {
    const events = client.db('myDB').collection('events').find({});
    events.toArray().then(documents => res.send(documents))
  })

  app.get('/singleEvent/:id', (req, res) => {
    //console.log(req.params.id);
    const singleEvent = client.db('myDB').collection('events').find({_id: new ObjectId(req.params.id)});
    singleEvent.toArray().then(documents => {
      res.send(documents[0])})
  })
  

  //User registration event
  app.post('/userEvent', (req, res) => {
    const userSelectedEvent = req.body;
   const queryEmail = req.query.email;

    const isAlreadySelectedEvent =  client.db('myDB').collection('userEvents').find({email: queryEmail, eventName: req.body.eventName});
    isAlreadySelectedEvent.toArray().then(result => {
       if(result.length > 0){
        console.log(result);
       res.send(false);
       }
       else{
        client.db('myDB').collection('userEvents').insertOne(userSelectedEvent)
        .then(result => res.send(result))
       }
   })
  
})

  app.get('/userEvents', (req, res) => {
    const queryEmail = req.query.email;

    const registeredEvent = client.db('myDB').collection('userEvents').find({email: queryEmail});
    registeredEvent.toArray().then(result => res.send(result))
  })

  app.delete('/deleteUserEvent/:id', (req, res) => {
    const deletedItemID = req.params.id;
    client.db('myDB').collection('userEvents').deleteOne({_id : new ObjectId(deletedItemID)})
    .then(result => {
      console.log(result);
      res.send(result.deletedCount > 0);
     
    })
  })


  //get all volunteer
  app.get('/allVolunteer', (req, res) => {
   const allVolunteer =  client.db('myDB').collection('userEvents').find({});
   allVolunteer.toArray().then(result => res.send(result));
  })

  app.delete('/adminDeleteEvent/:id', (req, res) => {
    const deletedEventId = req.params.id;
    client.db('myDB').collection('userEvents').deleteOne({_id: new ObjectId(deletedEventId)})
    .then(result => {
      console.log(result);
      res.send(result.deletedCount > 0);
    })

  })


  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);





app.listen(process.env.PORT || 5000, () => console.log("Port is Running"));