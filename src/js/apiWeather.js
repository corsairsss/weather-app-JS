'use strict';
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

export default {
  page: 1,
  query: '',
  API_KEY: '70e4d4afc11760d4cac834026451a54c',
  timeZone: 0,
  lat: 0,
  lon: 0,
  async fetchArticles() {
    try {
      const requestParam = `?q=${this.query}&appid=${this.API_KEY}&units=metric`;
      const a = await fetch(baseUrl + requestParam);
      const resp = a.json();
      return resp;
    } catch (error) {
      console.log(`ERR::${error}`);
      throw error;
    }
  },

  async requestGeoParam() {
    try {
      const requestParam = `?lat=${this.lat}&lon=${this.lon}&appid=${this.API_KEY}&units=metric`;
      const a = await fetch(baseUrl + requestParam);
      const resp = a.json();
      return resp;
    } catch (error) {
      console.log(`ERR::${error}`);
      throw error;
    }
  },

  get searchquery() {
    return this.query;
  },

  set searchquery(str) {
    this.query = str;
  },
  set differSecondsFromUtc(number) {
    this.timeZone = number;
  },

  set latitude(str) {
    this.lat = str;
  },
  set longitude(str) {
    this.lon = str;
  },
};
