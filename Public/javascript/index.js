navigator.geolocation.getCurrentPosition(success, err);

function success(position) {
    console.log(position);

    const userLocation = [position.coords.latitude, position.coords.longitude];
    const map = L.map('map').setView(userLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const myPosition = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map)

    let destinations = [];

    map.on('click', function (e) {
        const marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        console.log(e.latlng.lat, e.latlng.lng);
        destinations.push(marker);
    });

    document.getElementById('set-alarm').addEventListener('click', function () {
        const selectedSound = document.getElementById('alarm-sounds').value;

        if (destinations.length > 0) {
            navigator.geolocation.watchPosition(function (position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                destinations.forEach((destination) => {
                    const destLatLng = destination.getLatLng();
                    const distance = map.distance([userLat, userLng], [destLatLng.lat, destLatLng.lng]);

                    if (distance < 100) { // 100 meters radius
                        const audio = new Audio(`sounds/${selectedSound}`);
                        console.log("audio playing...");
                        audio.play();
                    }
                });
            }, function (error) {
                console.error(error);
            });
        } else {
            alert('Please select a destination on the map.');
        }
    });
}

function err(error) {
    console.error("Error occurred while getting location: ", error);
}
