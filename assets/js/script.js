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

    citySearch.val('');
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

                // Create city object
                const newCity = {
                    name: city,
                    latitude: lat,
                    longitude: lon,
                }

                // Push city object to local storage
                let cities = readCitiesFromStorage();
                const cityExists = cities.some(city => city.name === newCity.name);
                if (!cityExists) {
                    cities.push(newCity);
                    localStorage.setItem('cities', JSON.stringify(cities));
                }


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

function convertDate(day) {
    // Convert Unix timestamp to milliseconds
    let milliseconds = (day) * 1000;
    // Create a new Date object with the milliseconds
    let dateObject = new Date(milliseconds);
    // Format the date as a string with only the date
    let formattedDate = dateObject.toLocaleDateString();
    return formattedDate;
}

// The main display function, this displays all of the weather data
function displayWeather(weather) {
    console.log(weather);
    const currentDay = weather.list[0].dt
    let formattedDate = convertDate(currentDay);

    $('#current-weather').empty();
    $('#future-row').empty();
    $('#city-history').empty();

    // Create and display card containing the current weather
    const currentCard = $('<div>')
    .addClass('col-md-9 border border-dark m-3');

    const h2 = $('<h2>')
    .text(`${weather.city.name} (${formattedDate}) `);
    // Gets the weather icon from OpenWeather by plugging in the icon code
    let iconUrl = `https://openweathermap.org/img/w/${weather.list[0].weather[0].icon}.png`;
    let iconImg = $('<img>').attr('src', iconUrl);
    h2.append(iconImg);

    const p1 = $('<p>')
    .text(`Temp: ${weather.list[0].main.temp}°F`);

    const p2 = $('<p>')
    .text(`Wind: ${weather.list[0].wind.speed} MPH`);

    const p3 = $('<p>')
    .text(`Humidity: ${weather.list[0].main.humidity} %`);

    $('#current-weather').append(currentCard);
    currentCard.append(h2, p1, p2, p3);
    
    // Getting the next five days and creating cards for each day
    const futureWeather = getNextFiveDays(weather);
    console.log(futureWeather);
    
    const forcastHeaderEl = $('<h2>')
    .text('5-Day Forcast:');

    $('#future-row').append(forcastHeaderEl);
    
    for (let i = 0; i < futureWeather.length; i++) {
        
        formattedDate = convertDate(futureWeather[i].dt);
        
        const cardRow = $('<div>')
        .addClass('col-xl-2 col-lg-3 col-md-4 col-sm-4 col-6 p-3 m-2');

        const futureCard = $('<article>')
        .addClass('card bg-primary text-light p-3 text-nowrap');

        const h3El = $('<h3>')
        .text(`${formattedDate}`)
        .addClass('card-title');

        // Gets the weather icon from OpenWeather by plugging in the icon code
        iconUrl = `https://openweathermap.org/img/w/${futureWeather[i].weather[0].icon}.png`;
        iconImg = $('<img>').attr('src', iconUrl).addClass('weather-icon');

        const p1El = $('<p>')
        .text(`Temp: ${futureWeather[i].main.temp}°F`)
        .addClass('text-light');

        const p2El = $('<p>')
        .text(`Wind: ${futureWeather[i].wind.speed} MPH`)
        .addClass('text-light');

        const p3El = $('<p>')
        .text(`Humidity: ${futureWeather[i].main.humidity} %`)
        .addClass('text-light');

        futureCard.append(h3El, iconImg, p1El, p2El, p3El);
        
        cardRow.append(futureCard);

        $('#future-row').append(cardRow);
    }

    renderHistory();
}

// Filters through all of the weather data and grabs the 3:00pm data for the next 5 days
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
    if (time.includes('15:00') && date !== todayDate) {
        if (!groupedByDate[date]) {
            groupedByDate[date] = entry;
        }
    }
    });

    // Extract one forecast entry for each day at noon
    const filteredForecast = Object.values(groupedByDate);
    return filteredForecast;
}

// Gets the cities array from local storage
function readCitiesFromStorage() {
    let cities = JSON.parse(localStorage.getItem('cities'));

    if (!cities) {
        cities = [];
    }

    return cities;
}

// Displays the city history list
function renderHistory() {
    let cities = readCitiesFromStorage();

    for (let city of cities) {
        let cityBtn = $('<button>')
        .addClass('btn btn-secondary history-btn col-12 m-2')
        .text(city.name)
        .attr('data-name', city.name);
        $('.history-btn').on('click', handleHistoryClick);

        $('#city-history').append(cityBtn);
    }

}

// This changes the weather results to whatever city button that is clicked on
function handleHistoryClick() {
    const cityName = $(this).attr('data-name');

    // Finding the city in the array that matches the button that was clicked on
    let cities = readCitiesFromStorage();
    const selectedCity = cities.find(city => city.name === cityName);
    
    // Plugging in the latitude and longitude of the city that was clicked on
    if(selectedCity) {
        const lat = selectedCity.latitude;
        const lon = selectedCity.longitude;
        getWeatherData(lat, lon);
    } else {
        console.log('City not found in storage');
    }
}

// This is making sure the page is fully loaded before running anything
$(document).ready(function () {
    // Displays the city history
    renderHistory();
    
    searchForm.on('submit', handleSearch);

    // Event delegation for the city history buttons
    $('#city-history').on('click', '.history-btn', handleHistoryClick);
});
