const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const axios = require("axios")
const app = express()
require("dotenv").config()

// body parser here
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Parse application/json
app.use(bodyParser.json());
app.use(bodyParser.text())


const HOST = "0.0.0.0"
app.use(express.static(path.join(__dirname, "Public")))

app.get("/", (req, res) => {
    res.status(201).send(path.join(__dirname, "Public", "index.html"))
})

app.post("/get-coords-data", (req, res) => {
    const body = req.body
    const userRequestedLocation = body?.userQuery
    // console.log(userRequestedLocation)

    // this is the place where i am gonna do that reverse location thing

    async function forwardGeocoding() {
        const destURL = `https://us1.locationiq.com/v1/search?key=${process.env.LOCATION_API_KEY}&q=${encodeURIComponent(userRequestedLocation)}&format=json&`
        const response = await axios.get(destURL)
        return res.status(201).send(response?.data)
    }

    forwardGeocoding()
})

app.post("/get-location", (req, res) => {
    const body = req.body
    const userRequestedCoords = [body?.latitude, body?.longitude]

    async function reverseGeocoding() {
        const destURL = `https://us1.locationiq.com/v1/reverse?key=${process.env.LOCATION_API_KEY}&lat=${userRequestedCoords[0]}&lon=${userRequestedCoords[1]}&format=json&`
        const response = await axios.get(destURL)
        return res.status(201).send(response?.data)
    }

    reverseGeocoding()
})

app.listen(process.env.PORT || 5000, HOST)