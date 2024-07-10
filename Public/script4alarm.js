//  logic to set the scene for the first time:)


let shownProvideLocationAlert, map

function setFirstScene() {

    function displayFirstMap() {
        navigator.geolocation.getCurrentPosition(gotLocation, deniedLocationPermission, {
            enableHighAccuracy: true,
            timeout: 10000
        })
    }

    function gotLocation(locationData) {
        const myLatitue = locationData.coords.latitude
        const myLongitude = locationData.coords.longitude
        const accuracy = locationData.coords.accuracy
        console.log("the accuracy is ", accuracy)

        console.log(myLatitue, myLongitude)

        map = L.map('map').setView([myLatitue, myLongitude], 17);

        function addMarkerAtMyLocation() {

            var circle = L.circle([myLatitue, myLongitude], {
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.5,
                radius: 10
            }).addTo(map).bindPopup('You are here!')
                .openPopup();

            // console.log(circle)
            circle._path.classList.add("beeping_circle")
        }

        addMarkerAtMyLocation()


        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

    }
    function deniedLocationPermission(error) {
        if (error.code === 1 && !shownProvideLocationAlert) {
            alert("Please provide the access to your location")
            shownProvideLocationAlert = true
            displayFirstMap()
        }
        if (error.code != 1) {
            alert("Error fetching user location")
            console.log(error)
        }
    }

    displayFirstMap()
}

setFirstScene()

//  logic to get the lat and long of user's destination:) quite simple and concise
// Search function
function searchLocation() {
    const searchInput = document.getElementById('location-search').value;

    async function fetchDestination() {
        const response = await fetch(`/get-my-destination`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userQuery: searchInput })
        })
        const data = await response.json()
        const finedData = data[0]
        const marker = L.marker([finedData.lat, finedData.lon]).addTo(map);

        console.log("marker added at ", finedData.lat, finedData.lon)
        // display_name
        // lat
        // lon
        // type
        // :
        // "house"


        // console.log(data[0])
    }
    fetchDestination()


}

// Add event listener to search button
document.getElementById('search-button').addEventListener('click', searchLocation);

// Function to add alarm (you'll need to implement this)
function addAlarm(lat, lon) {
    // Implement your alarm adding logic here
    console.log(`Adding alarm for location: ${lat}, ${lon}`);
}