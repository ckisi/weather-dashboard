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
    const apiUrlLocation = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=277c46f57468f3138e65fa03700986ba`

    fetch(apiUrlLocation)
    .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                const cityCoords = data;
                const lat = cityCoords[0].lat;
                const lon = cityCoords[0].lon;
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

// This gets the weather data for the city that was searched using it's latitude and longitude
function getWeatherData(lat, lon) {
   const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=277c46f57468f3138e65fa03700986ba`

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
    console.log(weather);
    // Convert Unix timestamp to milliseconds
    var milliseconds = (weather.list[0].dt) * 1000;
    // Create a new Date object with the milliseconds
    var dateObject = new Date(milliseconds);
    // Format the date as a string with only the date
    var formattedDate = dateObject.toLocaleDateString();

    const currentCard = $('<div>')
    .addClass('col-md-9 border border-dark');

    const h2El = $('<h2>')
    .text(`${weather.city.name} (${formattedDate})`);

    const p1 = $('<p>')
    .text(`Temp: ${weather.list[0].main.temp}°F`);

    const p2 = $('<p>')
    .text(`Wind: ${weather.list[0].wind.speed} MPH`);

    const p3 = $('<p>')
    .text(`Humidity: ${weather.list[0].main.humidity} %`);

    $('#current-weather').append(currentCard);
    currentCard.append(h2El, p1, p2, p3);
    
    getNextFiveDays(weather);
}

function getNextFiveDays(forcast) {
    // Get today's date
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    // Group forecast entries by date
    const groupedByDate = {};
    forcast.list.forEach(entry => {
    const date = entry.dt_txt.split(' ')[0]; // Extract date from timestamp
    const time = entry.dt_txt.split(' ')[1]; // Extract time from timestamp

    // Check if the time is around noon and the date is not today
    if (time.includes('12:00') && date !== todayDate) {
        if (!groupedByDate[date]) {
            groupedByDate[date] = entry;
        }
    }
    });

    // Extract one forecast entry for each day at noon
    const filteredForecast = Object.values(groupedByDate);
}


searchForm.on('submit', handleSearch);