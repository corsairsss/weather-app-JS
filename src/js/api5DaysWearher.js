'use strict';
const baseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
export default {
  page: 1,
  query: '',
  API_KEY: '70e4d4afc11760d4cac834026451a54c',
  timeZone: 0,
  lat: 0,
  lon: 0,
  async get5DaysWeather() {
    try {
      const requestParam = `?q=${this.query}&appid=${this.API_KEY}&units=metric`;
      const responce = await fetch(baseUrl + requestParam);
      const data = responce.json();
      return data;
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
};
