const searchForm = $('#search-form');
const citySearch = $('#city-search');

// This gets the input from the search bar
function handleSearch(event) {
    event.preventDefault();

    const cityInput = citySearch.val().trim();

    if (!cityInput) {
        console.error('Enter a city');
        return;
    }

    getCityData(cityInput);
}

// This gets the latitude and longitude of the city that was searched for
function getCityData(city) {
    const apiUrlLocation = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=277c46f57468f3138e65fa03700986ba`

    fetch(apiUrlLocation)
    .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                const cityCoords = data;
                const lat = cityCoords.lat;
                const lon = cityCoords.lon;
                getWeatherData(lat, lon);
            });
        } else {
            alert('Error');
        }
    })
    .catch(function (error) {
        alert('Unable to connect to OpenWeather');
    });
}

function getWeatherData(latitude, longitude) {
    const apiUrl = `api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=277c46f57468f3138e65fa03700986ba`

    fetch(apiUrl)
    .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayWeather(data);
            });
        } else {
            alert('Error');
        }
    })
    .catch(function (error) {
        alert('Error');
    });
}

function displayWeather(weather) {

}



searchForm.on('submit', handleSearch);