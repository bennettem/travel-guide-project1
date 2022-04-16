$(function () {
  var weatherApiKey = "e0a6afee4ced0e5525c4a7c68c4ed596";
  var geoDBApiKey = "04b70b2d63msh45674d1edc560a3p1163d0jsnfd2052c4c8cc";
  // var exchangeRateApiKey = "8a34dc1b22d9b731f3e0d0da";
  var form1 = $("#form1");
  var form2 = $("#form2");
  var liked1 = $("#liked1");
  var liked2 = $("liked2");

  function handleFormSubmit(event) {
    event.preventDefault();
    var city = $(event.target).find("input").val();
    getLocationData(city, event.target.id);
  }

  // Use the input city and fetch data from openweathermap
  function getLocationData(city, formId) {
    $("#" + formId)
      .siblings(".add-data-upper")
      .empty();
    $("#" + formId)
      .siblings(".add-data-lower")
      .empty();
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
        // executer function to populate forecast weather data cards using the city lat and lon
        getCountryData(cityData[0].country, formId);
        getFutureWeather(cityData[0].lat, cityData[0].lon, formId);
        var cityCard = $("<div>").addClass("card");
        var cityCardBody = $("<div>").addClass("card-section");
        var cityLabel = $("<h2>").text(
          cityData[0].name + ", " + cityData[0].country
        );
        cityCardBody.append(cityLabel);
        cityCard.append(cityCardBody);
        $("#" + formId)
          .siblings(".add-data-upper")
          .prepend(cityCard);
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
          // Set a header to the card with the date
          var dayCardHeader = $("<div>")
            .addClass("card-divider")
            .html(moment().add(i, "d").format("MM/DD/YYYY"));
          // Create a div for the body of the card
          var dayCardBody = $("<div>").addClass("card-section");
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
      })
      .catch((err) => console.error(err));
  }

  form1.on("submit", handleFormSubmit);

  form2.on("submit", handleFormSubmit);

  function saveData() {
    var cities = document.getElementById("input").value;
    localStorage.setItem("list", JSON.stringify(cities));
    var savedCity = JSON.parse(localStorage.getItem("list"));

    localStorage.setItem("list", JSON.stringify(savedCity));
    var result = JSON.parse(localStorage.getItem("list"));
    console.log(result);
  }

  liked1.on("click", saveData);
  liked2.on("click", saveData);
});
