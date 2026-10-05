/**
 * Aura Tab - Weather Service (Open-Meteo API, 100% Free & No API Key Required)
 */
class WeatherWidget {
  constructor() {
    this.container = document.getElementById('weather-widget');
    this.unit = 'c'; // 'c' or 'f'
    this.currentData = null;
  }

  async init() {
    const settings = await window.StorageService.get(['weatherUnit', 'customLocation']);
    this.unit = settings.weatherUnit || 'c';

    // Load cached weather first for instant rendering
    const cached = await window.StorageService.get('cachedWeather');
    if (cached.cachedWeather && (Date.now() - cached.cachedWeather.timestamp < 1800000)) {
      this.render(cached.cachedWeather);
    }

    if (settings.customLocation) {
      this.fetchWeather(settings.customLocation.lat, settings.customLocation.lon, settings.customLocation.name);
    } else {
      this.detectLocation();
    }
  }

  detectLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const name = await this.reverseGeocode(lat, lon);
          this.fetchWeather(lat, lon, name);
        },
        async (err) => {
          console.log('Geolocation denied or unavailable, trying IP-based fallback...', err);
          await this.fallbackIpLocation();
        },
        { timeout: 7000 }
      );
    } else {
      this.fallbackIpLocation();
    }
  }

  async fallbackIpLocation() {
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        this.fetchWeather(parseFloat(data.latitude), parseFloat(data.longitude), data.city || data.region || 'Current Location');
        return;
      }
    } catch (e) {
      console.warn('IP location fetch failed', e);
    }
    // Default fallback to London or San Francisco
    this.fetchWeather(51.5074, -0.1278, 'London');
  }

  async reverseGeocode(lat, lon) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      return data.address.city || data.address.town || data.address.village || data.address.suburb || 'Local';
    } catch (e) {
      return 'Local';
    }
  }

  async searchCity(query) {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
      const data = await res.json();
      return data.results || [];
    } catch (e) {
      console.error('City search failed', e);
      return [];
    }
  }

  async fetchWeather(lat, lon, cityName = 'Current Location') {
    try {
      const tempParam = this.unit === 'f' ? '&temperature_unit=fahrenheit' : '';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto${tempParam}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data || !data.current) return;

      const weatherObj = {
        city: cityName,
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        code: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.wind_speed_10m),
        tempMax: data.daily ? Math.round(data.daily.temperature_2m_max[0]) : null,
        tempMin: data.daily ? Math.round(data.daily.temperature_2m_min[0]) : null,
        unit: this.unit === 'f' ? '°F' : '°C',
        timestamp: Date.now()
      };

      await window.StorageService.set({ cachedWeather: weatherObj });
      this.render(weatherObj);
    } catch (e) {
      console.error('Weather fetch failed', e);
    }
  }

  getWeatherIcon(code) {
    // WMO Weather interpretation codes (WW)
    if (code === 0) return { icon: '☀️', desc: 'Clear Sky' };
    if (code === 1) return { icon: '🌤️', desc: 'Mainly Clear' };
    if (code === 2) return { icon: '⛅', desc: 'Partly Cloudy' };
    if (code === 3) return { icon: '☁️', desc: 'Overcast' };
    if (code >= 45 && code <= 48) return { icon: '🌫️', desc: 'Foggy' };
    if (code >= 51 && code <= 55) return { icon: '🌦️', desc: 'Drizzle' };
    if (code >= 61 && code <= 65) return { icon: '🌧️', desc: 'Rain' };
    if (code >= 71 && code <= 77) return { icon: '❄️', desc: 'Snow' };
    if (code >= 80 && code <= 82) return { icon: '🌧️', desc: 'Heavy Showers' };
    if (code >= 95 && code <= 99) return { icon: '⛈️', desc: 'Thunderstorm' };
    return { icon: '🌤️', desc: 'Fair' };
  }

  render(data) {
    if (!this.container) return;
    this.currentData = data;
    const info = this.getWeatherIcon(data.code);

    this.container.innerHTML = `
      <div class="weather-pill" id="weather-pill" title="${info.desc} • Feels like ${data.feelsLike}${data.unit} • Humidity: ${data.humidity}%">
        <span class="weather-icon">${info.icon}</span>
        <div class="weather-text">
          <span class="weather-temp">${data.temp}${data.unit}</span>
          <span class="weather-city">${data.city}</span>
        </div>
      </div>
    `;

    const pill = document.getElementById('weather-pill');
    if (pill) {
      pill.addEventListener('click', () => {
        window.AuraApp?.openCityPicker();
      });
    }
  }
}

window.WeatherWidget = new WeatherWidget();
