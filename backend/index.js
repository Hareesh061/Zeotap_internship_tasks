const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const dotenv = require('dotenv');
const cors = require('cors');

const { fetchWeatherForAllCities } = require('./services/weatherService');
const WeatherSummary = require('./models/WeatherSummary');
const { sendAlertEmail } = require('./services/alertService');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

cron.schedule('*/5 * * * *', async () => {
  const data = await fetchWeatherForAllCities();
  console.log('Weather Data:', data);

  data.forEach(async (weather) => {
    await WeatherSummary.create(weather);
   
    if (weather.temp > 35) {
      sendAlertEmail(weather.city, weather.temp);
    }
  });
});

app.get('/weather', async (req, res) => {
  const summaries = await WeatherSummary.find().limit(50).sort({ createdAt: -1 });
  res.json(summaries);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
