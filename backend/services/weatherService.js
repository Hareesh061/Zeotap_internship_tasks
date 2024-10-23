const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

const fetchWeatherForAllCities = async () => {
  const weatherData = [];

  for (const city of cities) {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}`);
      const { main, dt } = response.data;
      const temp = main.temp - 273.15;
      const feels_like = main.feels_like - 273.15; 
      
      weatherData.push({
        city,
        temp,
        feels_like,
        main: response.data.weather[0].main,
        dt: dt,
      });
    } catch (error) {
      console.error(`Could not fetch data for ${city}:`, error.message);
    }
  }

  return weatherData;
};

module.exports = { fetchWeatherForAllCities };
