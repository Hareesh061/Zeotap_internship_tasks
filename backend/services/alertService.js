const sendAlertEmail = (city, temp) => {
  console.log(`Alert! Temperature in ${city} is ${temp}°C.`);
};

module.exports = { sendAlertEmail };
