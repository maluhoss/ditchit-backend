var MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
var axios = require("axios");

app.use(cors());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var router = express.Router();

router.post("/recommendations", async function(req, res) {
  const quizResponses = req.body;
  // quizResponses = {
  //     location: {city: "j", address: "iu", postalCode: ",", country: ","}
  //      itemType: "Clothing"
  //      canDonate: false
  //   }

  // query #1 : convert address to long and latt coordinates:
  let initialCoordinates = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${quizResponses.location.address}+${quizResponses.location.city}+${quizResponses.location.province}&key=${process.env.GOOGLE_API_KEY}`
  );

  // query #2 : get list of locations
  let queryTypesList = canDonate
    ? ["clothing+donation+centres", "homeless+shelters"]
    : ["fabric+recycling", "animal+shelters"];
  let placeListResults = {};
  for (queryType of queryTypesList) {
    optionsList = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${queryType}&location=${initialCoordinates.results.geometry.location.lat},${initialCoordinates.results.geometry.location.lng}&radius=${quizResponses.location.radius}&key=${process.env.GOOGLE_API_KEY}`
    );

    placeListResults[queryType] = optionList.results.slice(0, 5);
  }

  // query 3: get details for each place using geoplace query
  let detailedPlaceList = [];
  for (queryType in placeListResults) {
    for (initalOption of placeListResults[queryType]) {
      // get details of initial option:
      const details = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${initalOption.place_id}=formatted_phone_number,website,url&key=${process.env.GOOGLE_API_KEY}}`
      );

      const detailedPlaceOption = {
        category: queryType,
        name: initialOption.name,
        address: initialOption.formatted_address,
        coordinates: initialOption.geometry.location,
        isOpen: initialOption.opening_hours.open_now,
        phone: details.result.formatted_phone_number,
        url: details.result.url,
        website: details.result.website
      };

      detailedPlaceList.push(detailedPlaceOption);
    }
  }

  res.json({
    initialCoordinates: initialCoordinates,
    options: detailedPlaceList
  });
});

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
  console.error(err);
  const { message } = err;
  res.status(err.status || 500).json({ message });
});

app.use("/ditchit", router);
app.listen(8080, () => {
  console.log(`Example app listening on port 8080!`);
});
