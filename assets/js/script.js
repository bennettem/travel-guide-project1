$(function () {
  var weatherApiKey = "e0a6afee4ced0e5525c4a7c68c4ed596";
  var geoDBApiKey = "04b70b2d63msh45674d1edc560a3p1163d0jsnfd2052c4c8cc";
  // var exchangeRateApiKey = "8a34dc1b22d9b731f3e0d0da";
  var form1 = $("#form1");
  var form2 = $("#form2");
  var liked1 = $("#liked1");
  var liked2 = $("#liked2");
  var cities = [];

  // Handle click event from search button
  function handleFormSubmit(event) {
    // Block default refresh
    event.preventDefault();
    // Grab the input field value nearest the target
    var city = $(event.target).find("input").val();
    // Pass both the city value and the form id to the next function so we know where to load the data to in the UI
    getLocationData(city, event.target.id);
  }

  // Use the input city and fetch data from openweathermap
  function getLocationData(city, formId) {
    // Clear out the 2 data display sections from any previous searches
    $("#" + formId)
      .siblings(".add-data-upper")
      .empty();
    $("#" + formId)
      .siblings(".add-data-lower")
      .empty();
    // Fetch location data from openweathermap
    fetch(
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
        city +
        "&appid=" +
        weatherApiKey
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (cityData) {
        // execture function to get the currency code by passing the country code and the formId
        getCountryData(cityData[0].country, formId);
        // execute function to populate forecast weather data cards using the city lat and lon and formId
        getFutureWeather(cityData[0].lat, cityData[0].lon, formId);
        // Create an overall card div for displaying the city name and country abbreviation
        var cityCard = $("<div>").addClass("card");
        // Create div for the card body
        var cityCardBody = $("<div>").addClass("card-section");
        // Create an h2 to include the name and country from the api
        var cityLabel = $("<h2>").text(
          cityData[0].name + ", " + cityData[0].country
        );
        // Add a class to the h2
        cityLabel.addClass("dynamicHeader");
        // Add the header to the cardbody
        cityCardBody.append(cityLabel);
        // Add the card body to the card
        cityCard.append(cityCardBody);
        // Find the upper data section on the ID where the user submitted and add the card
        $("#" + formId)
          .siblings(".add-data-upper")
          .prepend(cityCard);
        $(".dynamicHeader").css("font-family", "'Comfortaa'");
        $(".card").css("border-radius", "15px");
      })
      .catch((err) => console.error(err));
  }

  // Take the city lat and lon and fetch the forecast data for the next 5 days
  function getFutureWeather(lat, lon, formId) {
    fetch(
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=" +
        weatherApiKey +
        "&exclude=hourly,minutely&units=imperial"
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (futureData) {
        // Loop through the array of dates; start at 1 since 0 is the current date; end before 6 to limit to 5 days
        for (i = 0; i < 6; i++) {
          // Create a card for each day
          var dayCard = $("<div>").addClass("card");
          $(".card").css("border-radius", "15px");
          // Set a header to the card with the date
          var dayCardHeader = $("<div>")
            .addClass("card-divider")
            .html(moment().add(i, "d").format("MM/DD/YYYY"));
            $(".card-divider").css("font-family", "'Comfortaa'");
          // Create a div for the body of the card
          var dayCardBody = $("<div>").addClass("card-section");
          $(".card-section").css("font-family", "'Dosis'");
          $(".card-section").css("font-size", "20px");
          // Create an icon for the weather
          var dayWeatherIcon = $("<img>").attr(
            "src",
            "http://openweathermap.org/img/wn/" +
              futureData.daily[i].weather[0].icon +
              ".png"
          );
          // Create a text line for the temp max
          var dayTempMax = $("<p>").text(
            "High: " + futureData.daily[i].temp.max + "\xB0F"
          );
          // Create a text line for the temp min
          var dayTempMin = $("<p>").text(
            "Low: " + futureData.daily[i].temp.min + "\xB0F"
          );
          // Create a text line for the humidity
          var dayHum = $("<p>").text(
            "Humidity: " + futureData.daily[i].humidity + "%"
          );
          // Create a text line for the wind speed
          var dayWind = $("<p>").text(
            "Wind: " + futureData.daily[i].wind_speed + " MPH"
          );

          // Add the weather data to the card body
          dayCardBody.append(
            dayWeatherIcon,
            dayTempMax,
            dayTempMin,
            dayHum,
            dayWind
          );
          // Add the card header and card body to the card
          dayCard.append(dayCardHeader, dayCardBody);

          // Add the card to the correct data element based on the selected form
          $("#" + formId)
            .siblings(".add-data-lower")
            .append(dayCard);
        }
        // Set the current time for the selected city in a variable
        var curTime = moment()
          .utc()
          .add(futureData.timezone_offset, "seconds")
          .format("MMM Do, YYYY, h:mm A");
        // Add the time to an html element
        var timeEl = $("<p>").text(curTime);
        // Create a card for the time
        var timeCard = $("<div>").addClass("card");
        $(".card").css("border-radius", "15px");
        // Create a header for the time card
        var timeCardHeader = $("<div>")
          .addClass("card-divider")
          .text("Local Time");
        // Create the body section of the time card
        var timeCardBody = $("<div>").addClass("card-section");

        // Build the card and add to the correct form data element
        timeCardBody.append(timeEl);
        timeCard.append(timeCardHeader, timeCardBody);
        $("#" + formId)
          .siblings(".add-data-upper")
          .append(timeCard);
        $(".card-divider").css("font-family", "'Comfortaa'");
        $(".card-section").css("font-family", "'Dosis'");
        $(".card-section").css("font-size", "20px");
      })
      .catch((err) => console.error(err));
  }

  // Grab country information based on the country code from openweather and the clicked formID
  function getCountryData(countryId, formId) {
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        "X-RapidAPI-Key": geoDBApiKey,
      },
    };

    // Data from geo-db with inputs for the country code and the api key
    fetch(
      "https://wft-geo-db.p.rapidapi.com/v1/geo/countries/" + countryId + "",
      options
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (countryDetails) {
        // Pass the first currency code and the formID
        getCurrencyData(countryDetails.data.currencyCodes[0], formId);
      })
      .catch((err) => console.error(err));
  }

  // Using the currency code from geo-db and the formID, show exchange rates for the entered country
  function getCurrencyData(currencyCode, formId) {
    fetch(
      "https://api.exchangerate.host/latest/?base=USD&symbols=" + currencyCode
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (currencyData) {
        // Declare the exchangeRate as found in the currency data
        var exchangeRate = Object.values(currencyData.rates);
        // Create the overall card for the Currency details
        var currencyCard = $("<div>").addClass("card");
        $(".card").css("border-radius", "15px");
        // Create a header for the currency card
        var currencyCardHeader = $("<div>")
          .addClass("card-divider")
          .text("Current Exchange Rate");
        // Create the body section of the currency card
        var currencyCardBody = $("<div>").addClass("card-section");
        // Create the text stating the exchange rate from default (EUR) to the selected country
        var currencyExchange = $("<p>").text(
          "USD to " + currencyCode + ": " + exchangeRate
        );
        // Create text stating an example of the currency conversion
        var currencyExample = $("<p>").text(
          "15 USD = " + (15 * exchangeRate).toFixed(2) + " " + currencyCode
        );

        // Add the exchange and example to the currency card body
        currencyCardBody.append(currencyExchange, currencyExample);
        // Add the currecy card body and header to teh currency card
        currencyCard.append(currencyCardHeader, currencyCardBody);
        // Attach the currency card to the beginning of the data div related to the selected form
        $("#" + formId)
          .siblings(".add-data-lower")
          .prepend(currencyCard);
        $(".card-divider").css("font-family", "'Comfortaa'");
        $(".card-section").css("font-family", "'Dosis'");
        $(".card-section").css("font-size", "20px");
      })
      .catch((err) => console.error(err));
  }



  // Save data to local storage
  function saveData() {
    // Set value for the city by checking the sibling label and finding the value of the input inside it
    var newCity = $(this).siblings("label").find("input").val();
    // Add the newCity to the beginning of the array
    cities.unshift(newCity);
    // Check if too many saved cities are in localstorage
    if (cities.length > 5) {
      // If too many then prune the oldest
      cities.length = 5;
    }
    // Add the array to local storage
    localStorage.setItem("cities", JSON.stringify(cities));
    // Update favorite buttons
    loadData();
  }

  function loadData() {
    // Grab and parse array from local storage
    var tempCities = JSON.parse(localStorage.getItem('cities'));
    // Check if the array is empty and then stop
    if (!tempCities) {
      return;
    }
    // Set the cities array to the value from localStorage
    cities = tempCities;
    // Clear out the favorites section of any previously generated buttons
    $('#favorites').empty();

    // Loop through the array to add buttons to the favorites list
    for (i = (cities.length - 1); i >= 0; i--) {
      // Create a button for each item in the array 
      var cityItem = $('<button>')
          .text(cities[i])
          .attr('type', 'button')
          .addClass('button-like')
          // Add listener to the button to pass in the button value to the search on click
          .on('click', function(event) {
              event.preventDefault();
              // Pass on value of the button and load to form 1
              getLocationData($(this).text(), "form1");
          })
      // Add each item button to the beginning of the history div
      $('#favorites').prepend(cityItem);
    }
  }

  form1.on("submit", handleFormSubmit);

  form2.on("submit", handleFormSubmit);

  liked1.on("click", saveData);

  liked2.on("click", saveData);

  loadData();
});
