function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
  formatDate,
  delay,
  generateRandomInt
};