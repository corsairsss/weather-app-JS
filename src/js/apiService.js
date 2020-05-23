'use strict';
const baseUrl = 'https://pixabay.com/api/';

export default {
  idx: 1,
  query: '',
  API_KEY: '16160220-46340b64af859daa6e885b5af',

  async fetchArticles() {
    try {
      this.incrementIdx();
      const requestParam = `?q=${this.query}&image_type=photo&orientation=horizontal&page=1&category=places&per_page=30&key=${this.API_KEY}`;
      const a = await fetch(baseUrl + requestParam);
      const resp = await a.json();
      const data = await resp.hits;
      if (data.length <= this.idx) this.idx = data.length - 1;
      return data[this.idx].largeImageURL;
    } catch (error) {
      throw error;
    }
  },

  get searchquery() {
    return this.query;
  },

  set searchquery(str) {
    this.query = str;
  },

  incrementIdx() {
    return (this.idx = Math.floor(Math.random() * (29 - 1 + 1) + 1));
  },
};
