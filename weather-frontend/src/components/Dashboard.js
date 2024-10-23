import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [dailySummary, setDailySummary] = useState({});
  const [thresholdTemp, setThresholdTemp] = useState(35); 
  const [breachCount, setBreachCount] = useState({}); 

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchWeatherData();
    }, 300000); 

    fetchWeatherData(); 

    return () => clearInterval(intervalId); 
  }, []);

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/weather');
      console.log('Fetched weather data:', response.data);

      const uniqueData = response.data.reduce((acc, current) => {
        const existing = acc.find(item => item.city === current.city);
        return existing ? acc : [...acc, current];
      }, []);

      const formattedData = uniqueData.map(item => ({
        ...item,
        temp: parseFloat(item.temp.toFixed(1)),
        feels_like: parseFloat(item.feels_like.toFixed(1)),
      }));

      setWeatherData(formattedData);
      calculateDailySummary(formattedData);
      checkForAlerts(formattedData); 
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const calculateDailySummary = (data) => {
    console.log('Calculating daily summary for data:', data);

    const summaries = {};
    data.forEach((entry) => {
      if (!entry.createdAt) {
        console.warn('Skipping entry with missing timestamp:', entry);
        return;
      }

      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      const temp = entry.temp;
      const weatherCondition = entry.main;

      if (!summaries[date]) {
        summaries[date] = {
          totalTemp: temp,
          maxTemp: temp,
          minTemp: temp,
          count: 1,
          conditionCount: { [weatherCondition]: 1 },
        };
      } else {
        const summary = summaries[date];
        summary.totalTemp += temp;
        summary.maxTemp = Math.max(summary.maxTemp, temp);
        summary.minTemp = Math.min(summary.minTemp, temp);
        summary.count += 1;

        if (summary.conditionCount[weatherCondition]) {
          summary.conditionCount[weatherCondition] += 1;
        } else {
          summary.conditionCount[weatherCondition] = 1;
        }
      }
    });

    for (const date in summaries) {
      const summary = summaries[date];
      summary.averageTemp = summary.totalTemp / summary.count;
      summary.dominantCondition = Object.entries(summary.conditionCount).reduce(
        (a, b) => (b[1] > a[1] ? b : a)
      )[0];
    }

    console.log('Final daily summaries:', summaries);
    setDailySummary(summaries);
  };

  const checkForAlerts = (data) => {
    console.log('Checking for alert conditions...');

    const newBreachCount = { ...breachCount };

    data.forEach((entry) => {
      const { city, temp } = entry;

      if (temp > thresholdTemp) {
        newBreachCount[city] = (newBreachCount[city] || 0) + 1;
      } else {
        newBreachCount[city] = 0; 
      }

      if (newBreachCount[city] >= 2) {
        console.log(`Alert! Temperature in ${city} has exceeded ${thresholdTemp}°C for two consecutive updates.`);
        newBreachCount[city] = 0; 
      }
    });

    setBreachCount(newBreachCount);
  };

  return (
    <div>
      <h1>Weather Monitoring Dashboard</h1>

      <h2>Daily Summaries</h2>
      {Object.entries(dailySummary).length > 0 ? (
        <div>
          {Object.entries(dailySummary).map(([date, summary]) => (
            <div key={date}>
              <h3>{date}</h3>
              <p>Average Temperature: {summary.averageTemp.toFixed(2)} °C</p>
              <p>Maximum Temperature: {summary.maxTemp} °C</p>
              <p>Minimum Temperature: {summary.minTemp} °C</p>
              <p>Dominant Weather Condition: {summary.dominantCondition}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No data available.</p>
      )}

      <h2>Temperature Trend</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={weatherData}>
          <XAxis dataKey="city" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Line type="monotone" dataKey="temp" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      <h2>Configure Alert Threshold</h2>
      <input
        type="number"
        value={thresholdTemp}
        onChange={(e) => setThresholdTemp(Number(e.target.value))}
        placeholder="Set Temperature Threshold"
      />
    </div>
  );
};

export default Dashboard;
