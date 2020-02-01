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
  const quizResponses = req.body
  
  // console.log(req.body.location.city, typeof req.body.location.city)
  const addressString = quizResponses.location.address.replace(/\s/g,'+')
  const cityString = quizResponses.location.city.replace(/\s/g,'+')


  // quizResponses = {
  //     location: {city: "j", address: "iu", province: "ON", radius: 10000}
  //      itemType: "Clothing"
  //      canDonate: false
  //   }

  // query #1 : convert address to long and lat coordinates:
 
  const initialCoordinatesResults = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${addressString},+${cityString},+ON&key=${process.env.GOOGLE_API_KEY}`
  )

  const initialCoordinates = initialCoordinatesResults.data.results[0].geometry.location
  

  // query #2 : get list of locations
  let queryTypesList = req.body.canDonate
    ? ["clothing+donation+centres", "homeless+shelters"]
    : ["fabric+recycling", "animal+shelters"];
  let placeListResults = {};
  for (queryType of queryTypesList) {
    const optionsList = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${queryType}&location=${initialCoordinates.lat},${initialCoordinates.lng}&radius=${quizResponses.location.radius}&key=${process.env.GOOGLE_API_KEY}`
    );

    placeListResults[queryType] = optionsList.data.results.slice(0, 5);
  }

  // // query 3: get details for each place using geoplace query
  let detailedPlaceList = [];
  for (queryType in placeListResults) {
    for (initialOption of placeListResults[queryType]) {
      // get details of initial option:
        const details = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${initialOption.place_id}&fields=formatted_phone_number,website,url&key=${process.env.GOOGLE_API_KEY}`
        );
   
      const detailedPlaceOption = {
        category: queryType,
        name: initialOption.name,
        address: initialOption.formatted_address,
        coordinates: initialOption.geometry.location,
        isOpen: initialOption.opening_hours,
        phone: details.data.result.formatted_phone_number,
        url: details.data.result.url,
        website: details.data.result.website
      };

      detailedPlaceList.push(detailedPlaceOption);
    }
  }

  res.json({
    initialCoordinates: initialCoordinates,
    options: detailedPlaceList
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  const { message } = err;
  res.status(err.status || 500).json({ message });
});

app.use("/ditchit", router);
app.listen(8080, () => {
  console.log(`Example app listening on port 8080!`);
});
