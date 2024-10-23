const mongoose = require('mongoose');

const WeatherSummarySchema = new mongoose.Schema({
  city: { type: String, required: true },
  temp: { type: Number, required: true },
  feels_like: { type: Number, required: true },
  main: { type: String, required: true },
  dt: { type: Date, required: true },
}, { timestamps: true });

const WeatherSummary = mongoose.model('WeatherSummary', WeatherSummarySchema);

module.exports = WeatherSummary;
