$(function () {
  var weatherApiKey = "e0a6afee4ced0e5525c4a7c68c4ed596";
  // var city = 'Milwaukee';
  var form1 = $("#form1");
  var form2 = $("#form2");

  function handleFormSubmit(event) {
    event.preventDefault();
    console.log(event.target.id);
    var city = $(event.target).find("input").val();
    getLocationData(city, event.target.id);
  }

  // Use the input city and fetch data from openweathermap
  function getLocationData(city, formId) {
    $("#" + formId)
      .siblings(".addData")
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
        getFutureWeather(cityData[0].lat, cityData[0].lon, formId);
      });
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
        console.log(futureData);
        console.log(formId);
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
          // Create a text line for the temp
          var dayTemp = $("<p>").text(
            "Temp: " + futureData.daily[i].temp.max + "\xB0F"
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
          dayCardBody.append(dayWeatherIcon, dayTemp, dayHum, dayWind);
          // Add the card header and card body to the card
          dayCard.append(dayCardHeader, dayCardBody);
          // Add the card to the forecast row

          $("#" + formId)
            .siblings(".addData")
            .append(dayCard);
        }
      });
  }
  // getLocationData(city);
  form1.on("submit", handleFormSubmit);

  form2.on("submit", handleFormSubmit);

  function saveData(city) {
    const cities = this.getFromData();
    cities.push(city);

    //add new array
    localStorage.setItem("cities", JSON.stringify(cities));
  }
});
