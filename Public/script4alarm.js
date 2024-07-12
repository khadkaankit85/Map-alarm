//  logic to set the scene for the first time:)
const myLocationInformation = document.getElementById("my-location")
const myDestinationInformation = document.getElementById("your-destination")

// universal vars
let shownProvideLocationAlert, map, myLocationArray, locationOfUser
let circlesInTheMap = []

// Create popup container
const locationUpdatePopup = document.createElement("div");
locationUpdatePopup.classList.add("change-location-popup");
document.body.prepend(locationUpdatePopup);

// Create popup box
const popupBox = document.createElement("div");
popupBox.classList.add("change-location-popup-box");
locationUpdatePopup.appendChild(popupBox);

// Create close button
const closeButton = document.createElement("button");
closeButton.classList.add("close-popup");
closeButton.innerText = "Close";
popupBox.appendChild(closeButton);

// Create form elements
const form = document.createElement("form");
form.innerHTML = `
    <label for="address" >Address:</label>
    <input required type="text" id="address" name="address" placeholder="Enter address">
    <button type="button" id="find-address">Find and Update</button>
`;
popupBox.appendChild(form);

// Close popup on button click
closeButton.addEventListener("click", () => {
    locationUpdatePopup.style.display = "none";
});

function deleteAllSpecificMarker(markerType) {
    map.removeLayer(markerType)

}


// Find address handler
document.getElementById("find-address").addEventListener("click", () => {
    const address = document.getElementById("address").value;
    if (address) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
            .then(response => response.json())
            .then(data => {
                locationOfUser = data[0].display_name
                myLocationInformation.innerText = `Your current location is ${locationOfUser}`

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);
                    // Update map with new location
                    map.panTo([lat, lng]);  // Adjust the zoom level as needed

                    deleteAllSpecificMarker(...circlesInTheMap)
                    let circle = L.circle([lat, lng], {
                        color: 'blue',
                        fillOpacity: 0.5,
                        radius: 12,
                    }).addTo(map).bindPopup('You are here!')
                        .openPopup();
                    circlesInTheMap.push(circle)

                    console.log(data)

                    locationUpdatePopup.style.display = "none";
                } else {
                    alert("Location not found.");
                }
            })
            .catch(error => {
                console.error("Error finding location:", error);
                alert("Error finding location.");
            });
    } else {
        alert("Please enter an address.");
    }
});

async function fetchLocationFromCoords(coords) {
    // if coords is provided
    if (coords[0] && coords[1]) {
        const response = await fetch(`/get-location`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude: coords[0], longitude: coords[1] })
        })
        console.log("desired location's coords is ", coords)

        return await response.json()
    }
    // no coords provided
    return null

}

function setFirstScene() {
    function displayFirstMap() {
        navigator.geolocation.getCurrentPosition(gotLocation, deniedLocationPermission, {
            enableHighAccuracy: true,
            timeout: 10000
        })
    }

    async function gotLocation(locationData) {
        const myLatitude = locationData.coords.latitude

        const myLongitude = locationData.coords.longitude
        const accuracy = locationData.coords.accuracy
        console.log("the accuracy is ", accuracy)
        myLocationArray = [myLatitude, myLongitude]

        // fetch my location detail
        const mylocation = await fetchLocationFromCoords(myLocationArray)
        if (mylocation) {
            console.log(mylocation)
            locationOfUser = mylocation.display_name

            //  change your location button 
            myLocationInformation.innerText = `Your current location is ${locationOfUser}`
            const changeLocationButton = document.createElement("button")
            changeLocationButton.innerText = "change from here"
            changeLocationButton.classList.add("change-location-btn")
            myLocationInformation.append(changeLocationButton)

            // event listener to let users change their location
            changeLocationButton.addEventListener("click", () => {

                // Show popup (example usage)
                locationUpdatePopup.style.display = "block";
            })
        }


        console.log("my location array is ", myLocationArray)
        map = L.map('map').setView([myLatitude, myLongitude], 17);

        console.log("circle in the map are", circlesInTheMap)

        var circle = L.circle([myLatitude, myLongitude], {
            color: 'blue',
            fillOpacity: 0.5,
            radius: 12,
        }).addTo(map).bindPopup('You are here!')
            .openPopup();
        circlesInTheMap.push(circle)
        console.log("circle in the map are", circlesInTheMap)


        // Add class to the circle's path element
        circle._path.classList.add("beeping_circle");
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

    async function fetchCoordsFromLocation() {
        const response = await fetch(`/get-coords-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userQuery: searchInput })
        })
        const data = await response.json()
        const finedData = data[0]
        const marker = L.marker([finedData.lat, finedData.lon])
            .addTo(map)
            .bindPopup(`${finedData?.display_name || searchInput}`)
            .openPopup();;

        //after fetching that location, change the view of the map
        map.panTo([finedData.lat, finedData.lon])

        myDestinationInformation.innerHTML =
            `<p ">Your Destination is ${finedData?.display_name}
         would you like to <span class="setAlarmButton">set an alarm</span> for this location 
        </p>
        `
        let btns = document.getElementsByClassName("setAlarmButton")
        console.log(btns)
        for (const btn of btns) {
            btn.addEventListener("click", () => {
                console.log("set an alarm for coords ", finedData?.lat, finedData?.lon)
                addAlarm(finedData?.lat, finedData?.lon)
            })
        }


        console.log("marker added at ", finedData.lat, finedData.lon)

    }
    fetchCoordsFromLocation()


}

// Add event listener to search button
document.getElementById('search-button').addEventListener('click', searchLocation);

// Function to add alarm (you'll need to implement this)


// Haversine formula to calculate the distance between two geographic points
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

let watchId;

function addAlarm(lat, lon) {
    const destination = { lat, lon };
    alert(`Adding alarm for location: ${lat}, ${lon}`);

    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const distance = getDistance(latitude, longitude, destination.lat, destination.lon);

            console.log(`Current distance to destination: ${distance} meters`);

            if (distance <= 300) {
                document.getElementById('alarmSound').play();
                document.getElementById('alarmSound').style.display = "block"
                alert("You have arrived at your destination")
            }
        },
        (error) => {
            console.error('Error getting location', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    );
}
