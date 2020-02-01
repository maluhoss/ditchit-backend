var MongoClient = require('mongodb').MongoClient
require('dotenv').config()
var express = require('express')
var app = express()
var cors = require('cors')
var bodyParser = require('body-parser')
var axios = require('axios')


app.use(cors())
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var router = express.Router();


router.post('/recommendations', function(req, res) {
  const quizResponses = req.body
  const options = []

  // res.json({
  //   location: req.body.address,
  //   options
  // })
})

// router.get('/populate', function(req, res) {
//   const category = req.query.category
//   const queryString = category.split(' ').join('+')
//   const collectionName = category.split(' ').join('')
//   console.log(category, queryString, collectionName)
//   axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${queryString}&location=43.6532, -79.3832&key=AIzaSyBG-hTTarn0IDtzzosUYB_nHy4mJiZV4_M`)
//   .then(function(response) {
//     const locationData = response.data.results.map(function(locationPoint) {
//       return {
//         name: locationPoint.name,
//         address: locationPoint.formatted_address,
//         lat: locationPoint.geometry.location.lat,
//         lng: locationPoint.geometry.location.lng,
//         label: 'clothing donation centre',
//         type: 'Good to donate'
//       }
//     })

//     MongoClient.connect('mongodb://localhost:27017/ditch-options', 
//       {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       }, function(err, client) {
//         if (!err) {
//           console.log('You are connected')
//           var db = client.db('ditch-options')
//           var collection = db.collection(collectionName)
//           collection.insertMany(locationData)
//         }
//     })
//   })
// })

app.use((err, req, res, next) => {
  console.error(err)
  const { message } = err
  res.status(err.status || 500).json( { message })
})

app.use('/ditchit', router)
app.listen(8080, () => {
  console.log(`Example app listening on port 8080!`);
});