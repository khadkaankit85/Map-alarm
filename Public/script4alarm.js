//  logic to set the scene for the first time:)
const myLocationInformation = document.getElementById("my-location")
const myDestinationInformation = document.getElementById("your-destination")

// universal vars
let shownProvideLocationAlert, map, myLocationArray, locationOfUser, watchId
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

// To get the saved alarms
const savedAlarmsString = localStorage.getItem("savedAlarms");
if (savedAlarmsString) {
    const savedAlarms = JSON.parse(savedAlarmsString);
    savedAlarms.map((savedAlarms) => {
        console.log(savedAlarms)
        addAlarm(savedAlarms?.lat, savedAlarms?.lon)
        console.log("alarm set for ", savedAlarms?.display_name)
    })
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
        }).addTo(map).bindPopup('<p style="color:black">You are here!</p>')
            .openPopup();
        circlesInTheMap.push(circle)
        console.log("circle in the map are", circlesInTheMap)


        // Add class to the circle's path element
        circle._path.classList.add("beeping_circle");
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            className: 'map-tiles'
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
            .bindPopup(`<p style="color:black">${finedData?.display_name || searchInput} <div class="setAlarmButton">set an alarm</div></p>
                `)
            .openPopup();;

        //after fetching that location, change the view of the map
        map.panTo([finedData.lat, finedData.lon])

        myDestinationInformation.innerHTML =
            `<p ">Your Destination is ${finedData?.display_name}
         .Would you like to <span class="setAlarmButton">set an alarm</span> for this location 
        </p>
        `
        let btns = document.getElementsByClassName("setAlarmButton")
        console.log(btns)
        for (const btn of btns) {
            btn.addEventListener("click", () => {
                console.log("set an alarm for coords ", finedData?.lat, finedData?.lon)

                // To save the alarms
                if (!savedAlarmsString) {
                    localStorage.setItem("savedAlarms", JSON.stringify([{
                        display_name: finedData?.display_name,
                        lat: finedData?.lat,
                        lon: finedData?.lon
                    }]));
                    addAlarm(finedData?.lat, finedData?.lon)
                    alert("set alarms from localstorage")
                }
                else {
                    let prev = JSON.parse(localStorage.getItem("savedAlarms"))
                    prev.push({
                        display_name: finedData?.display_name,
                        lat: finedData?.lat,
                        lon: finedData?.lon
                    })
                    localStorage.setItem("savedAlarms", JSON.stringify(prev))
                }
            })
        }


        console.log("marker added at ", finedData.lat, finedData.lon)

    }
    fetchCoordsFromLocation()
}

document.getElementById('search-button').addEventListener('click', searchLocation);

function addAlarm(lat, lon) {
    // Check if the geolocation API is available
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    // Function to calculate the distance between two coordinates in meters
    function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Radius of the Earth in meters
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in meters
        return distance;
    }

    // Define the success callback function
    function success(position) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // Calculate the distance between the user's current location and the target location
        const distance = getDistanceFromLatLonInMeters(userLat, userLon, lat, lon);

        // Check if the distance is within the threshold (200-300 meters)
        if (distance <= 500) {
            // Play the alarm sound
            const alarmSound = document.getElementById('alarmSound');
            alarmSound.play();

            // Make the audio element visible
            document.getElementById('audio-container').style.display = "block";

            // Stop watching the location
            navigator.geolocation.clearWatch(watchId);
        }
    }

    // Define the error callback function
    function error(err) {
        console.error(`ERROR(${err.code}): ${err.message}`);
    }

    // Define the options for the geolocation API
    const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0 // No caching of the position
    };

    // Optional: Add throttling to limit the number of location checks
    let lastCheckTime = 0;
    const checkInterval = 10000; // 10 seconds

    function throttledSuccess(position) {
        const currentTime = new Date().getTime();
        if (currentTime - lastCheckTime >= checkInterval) {
            success(position);
            lastCheckTime = currentTime;
        }
    }

    // Watch the user's location with throttling
    const watchId = navigator.geolocation.watchPosition(throttledSuccess, error, options);

    // Return a function to stop watching the location
    return function stopWatchingLocation() {
        navigator.geolocation.clearWatch(watchId);
    };
}

// part to showcase saved alarms
