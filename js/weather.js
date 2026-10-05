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
          try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const name = await this.reverseGeocode(lat, lon);
            this.fetchWeather(lat, lon, name);
          } catch (e) {
            await this.fallbackIpLocation();
          }
        },
        async () => {
          // Geolocation permission denied or unavailable, use IP location
          await this.fallbackIpLocation();
        },
        { timeout: 5000, maximumAge: 600000 }
      );
    } else {
      this.fallbackIpLocation();
    }
  }

  async fallbackIpLocation() {
    // 1. Try ipapi.co
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const city = data.city || data.region || 'Local';
          this.fetchWeather(parseFloat(data.latitude), parseFloat(data.longitude), city);
          return;
        }
      }
    } catch (e) {
      // Continue to next fallback
    }

    // 2. Try geojs.io
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const city = data.city || data.region || 'Local';
          this.fetchWeather(parseFloat(data.latitude), parseFloat(data.longitude), city);
          return;
        }
      }
    } catch (e) {
      // Continue to next fallback
    }

    // 3. Try ipwho.is
    try {
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const city = data.city || data.region || 'Local';
          this.fetchWeather(parseFloat(data.latitude), parseFloat(data.longitude), city);
          return;
        }
      }
    } catch (e) {
      // Ignore
    }

    // 4. Safe cached or default fallback
    const cached = await window.StorageService.get('cachedWeather');
    if (cached.cachedWeather) {
      this.render(cached.cachedWeather);
    } else {
      this.fetchWeather(28.6139, 77.2090, 'Local');
    }
  }

  async reverseGeocode(lat, lon) {
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      if (res.ok) {
        const data = await res.json();
        return data.city || data.locality || data.principalSubdivision || 'Local';
      }
    } catch (e) {
      // Ignore
    }
    return 'Local';
  }

  async searchCity(query) {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        return data.results || [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  async fetchWeather(lat, lon, cityName = 'Local') {
    try {
      const tempParam = this.unit === 'f' ? '&temperature_unit=fahrenheit' : '';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto${tempParam}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
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
      console.warn('Weather fetch failed, using fallback/cached data:', e.message || e);
      const cached = await window.StorageService.get('cachedWeather');
      if (cached.cachedWeather) {
        this.render(cached.cachedWeather);
      } else {
        this.render({
          city: cityName || 'Weather',
          temp: '--',
          feelsLike: '--',
          code: 1,
          humidity: 50,
          wind: 5,
          unit: this.unit === 'f' ? '°F' : '°C'
        });
      }
    }
  }

  getWeatherIcon(code) {
    // WMO Weather interpretation codes (WW) with clean vector SVGs (Rule 1: No Emojis)
    const sunSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    const cloudSunSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`;
    const cloudSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
    const fogSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14h16"/><path d="M4 10h16"/><path d="M4 18h16"/></svg>`;
    const rainSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 14H9a5 5 0 1 1 4.9-6H17.5a3.5 3.5 0 1 1 0 7Z"/><path d="M8 19v2"/><path d="M12 19v2"/><path d="M16 19v2"/></svg>`;
    const snowSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="M2 12h20"/><path d="m4.93 19.07 14.14-14.14"/></svg>`;
    const stormSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 14H9a5 5 0 1 1 4.9-6H17.5a3.5 3.5 0 1 1 0 7Z"/><path d="m13 16-3 5h4l-1 4"/></svg>`;

    if (code === 0) return { icon: sunSvg, desc: 'Clear Sky' };
    if (code === 1) return { icon: cloudSunSvg, desc: 'Mainly Clear' };
    if (code === 2) return { icon: cloudSunSvg, desc: 'Partly Cloudy' };
    if (code === 3) return { icon: cloudSvg, desc: 'Overcast' };
    if (code >= 45 && code <= 48) return { icon: fogSvg, desc: 'Foggy' };
    if (code >= 51 && code <= 55) return { icon: rainSvg, desc: 'Drizzle' };
    if (code >= 61 && code <= 65) return { icon: rainSvg, desc: 'Rain' };
    if (code >= 71 && code <= 77) return { icon: snowSvg, desc: 'Snow' };
    if (code >= 80 && code <= 82) return { icon: rainSvg, desc: 'Heavy Showers' };
    if (code >= 95 && code <= 99) return { icon: stormSvg, desc: 'Thunderstorm' };
    return { icon: cloudSunSvg, desc: 'Fair' };
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
