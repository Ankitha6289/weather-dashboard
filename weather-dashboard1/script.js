const API_KEY = "0b2886e0d001622aeb7c6d631333b6ec";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("cityInput");
const currentWeatherDiv = document.getElementById("currentWeather");
const forecastDiv = document.getElementById("forecast");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");

let chart;

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

async function fetchCurrentWeather(city) {
  const res = await fetch(
    `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
  );
  if (!res.ok) throw new Error("City not found.");
  return res.json();
}

async function fetchForecast(city) {
  const res = await fetch(
    `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`
  );
  if (!res.ok) throw new Error("Forecast unavailable.");
  return res.json();
}

function showLoading() {
  loadingDiv.classList.remove("hidden");
}

function hideLoading() {
  loadingDiv.classList.add("hidden");
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
}

function clearError() {
  errorDiv.classList.add("hidden");
}

function renderCurrentWeather(data) {
  currentWeatherDiv.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
         alt="${data.weather[0].description}">
    <p><strong>${data.main.temp}°C</strong></p>
    <p>${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind: ${data.wind.speed} m/s</p>
  `;
}

function getDailyForecast(data) {
  return data.list.filter(item => item.dt_txt.includes("12:00:00"));
}

function renderForecast(data) {
  forecastDiv.innerHTML = "";
  const daily = getDailyForecast(data);

  daily.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString();
    forecastDiv.innerHTML += `
      <div class="forecast-card">
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" 
             alt="${day.weather[0].description}">
        <p>${day.main.temp}°C</p>
      </div>
    `;
  });

  renderChart(daily);
}

function renderChart(dailyData) {
  const labels = dailyData.map(day =>
    new Date(day.dt_txt).toLocaleDateString()
  );
  const temps = dailyData.map(day => day.main.temp);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("weatherChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperature (°C)",
        data: temps,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true
    }
  });
}

async function loadWeather(city) {
  try {
    clearError();
    showLoading();

    const current = await fetchCurrentWeather(city);
    const forecast = await fetchForecast(city);

    renderCurrentWeather(current);
    renderForecast(forecast);

  } catch (err) {
    showError(err.message);
    currentWeatherDiv.innerHTML = "";
    forecastDiv.innerHTML = "";
  } finally {
    hideLoading();
  }
}

const handleSearch = debounce((e) => {
  const city = e.target.value.trim();
  if (city.length > 2) {
    loadWeather(city);
  }
}, 500);

cityInput.addEventListener("input", handleSearch);

// Load default city
loadWeather("London");