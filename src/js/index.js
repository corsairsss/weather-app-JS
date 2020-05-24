import Swiper from 'swiper';
import 'swiper/css/swiper.css';

// import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/dist/basicLightbox.min.css';
import pixabayServices from './apiService.js';
import openWeatherMap from './apiWeather.js';
import fiveDays from './api5DaysWearher.js';
import templateCurrentWeather from '../templates/weather-today.hbs';
import templateFiveDays from '../templates/fiveDays.hbs';
import templateFvoritCities from '../templates/favoriteCity.hbs';
import date from 'date-and-time';
import '../css/normalize.css';
import '../css/style.css';
import regeneratorRuntime from 'regenerator-runtime';
import quote from './quote.js';

//--------------------------------------------------------
// const mySwiper = new Swiper('.swiper-container', {
//   slidesPerView: 3,
//   spaceBetween: 15,
//   freeMode: false,
//   loop: false,
//   pagination: {
//     el: '.swiper-pagination',
//     clickable: true,
//   },
// });
// geolocation--------------------------------------------
const getGeoPosition = options => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

getGeoPosition()
  .then(position => {
    openWeatherMap.latitude = position.coords.latitude;
    openWeatherMap.longitude = position.coords.longitude;

    weatherWithGeoPosition();

    favoriteCityTemplate();
    const mySwiper = new Swiper('.swiper-container', {
      slidesPerView: 3,
      spaceBetween: 15,
      freeMode: false,
      loop: false,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  })
  .catch(error => {
    console.log(`dkjfhkjfh${error.message}`);
  });
// -------------

// ------------------------------------------------------------
const refs = {
  mainContainer: document.querySelector('.container'),
  searchForm: document.querySelector('.search-form'),
  btnAddFavoriteCity: document.querySelector('.js-btnFavoriteCity'),
  removeFavoriteCity: document.querySelector('.close'),
  buttonsPeriodWeather: document.querySelector('.js-buttons'),
  blockCurrentWeather: document.querySelector('.js-current-weather'),
  blockCurrentDayTime: document.querySelector('.js-current-date-time'),
  blockQuote: document.querySelector('.quote'),
  quoteText: document.querySelector('.quote__text'),
  quoteAuthor: document.querySelector('.quote__author'),
  blockFiveDays: document.querySelector('.five-days-info'),
  fiveDaysBlock: document.querySelector('.weather-info'),
  mainblockWeatherFiveDays: document.querySelector('.container-fiveDays'),
  favoriteCityContainer: document.querySelector('.favorite-city'),
};
let intervalId;
//------------------   LISTENERs----------------------

refs.searchForm.addEventListener('submit', showWeather);
refs.buttonsPeriodWeather.addEventListener('click', showAnotherDaysWearher);
refs.btnAddFavoriteCity.addEventListener('click', addFavoriteCity);
refs.favoriteCityContainer.addEventListener('click', getWeatherByFavoriteCity);
// ---------------------------------------------------
function showWeather(e) {
  e.preventDefault();
  const queryValue = e.target.elements.inputSearch.value;
  openWeatherMap.searchquery = queryValue;
  fiveDays.searchquery = queryValue;
  getWeatherByCity();
  getFiveDaysWeather();
  favoriteCityTemplate();
}

function addFavoriteCity(e) {
  e.preventDefault();
  addCityToLocalStorage();
  favoriteCityTemplate();
}

async function crateBackGroungImg() {
  try {
    const url = await pixabayServices.fetchArticles();
    refs.mainContainer.style.backgroundImage = `url(${url})`;
  } catch (error) {
    refs.mainContainer.style.backgroundImage = `url(https://pixabay.com/get/55e4dd4b4c51ae14f6da8c7dda7936781439dee751516c4870267bd7974ec758bf_1280.jpg)`;

    console.dir(`error:${error}`);
  }
}
async function weatherWithGeoPosition() {
  try {
    const weatherGeo = await openWeatherMap.requestGeoParam();
    showQuotes();
    weatherALL(weatherGeo);
  } catch (error) {
    console.log(`error:${error}`);
  }
}
async function getWeatherByCity() {
  try {
    const objWithWeather = await openWeatherMap.fetchArticles();
    weatherALL(objWithWeather);
  } catch (error) {
    console.log(`error:${error}`);
  }
}

async function getFiveDaysWeather() {
  try {
    const fiveDaysObj = await fiveDays.get5DaysWeather();
    document.querySelector(
      '.js-city',
    ).innerHTML = `${fiveDaysObj.city.name}, ${fiveDaysObj.city.country}`;
    const listWeather = fiveDaysObj.list;
    showFiveDaysWeather(listWeather);
  } catch (error) {
    console.log(`error:${error}`);
  }
}

function iconWeather(info) {
  const icon = info.weather[0].icon;
  const refsImgForIcon = document.querySelector('.icon');
  const urlIcon = `https://openweathermap.org/img/w/${icon}.png`;
  refsImgForIcon.attributes.src.nodeValue = urlIcon;
}

function dateCurrent() {
  const currentMilisecs = Date.now() + openWeatherMap.timeZone;
  const dayString = date.format(new Date(currentMilisecs), 'ddd', true);
  const dayNumber = date.format(new Date(currentMilisecs), 'DD', true);
  const month = date.format(new Date(currentMilisecs), 'MMMM', true);
  document.querySelector('.day').innerHTML = `${dayString} ${dayNumber}`;
  document.querySelector('.month').innerHTML = `${month}`;
}

function timeCurrent() {
  const hours = date.format(
    new Date(Date.now() + openWeatherMap.timeZone),
    'HH',
    true,
  );
  const mins = date.format(new Date(), 'mm');
  const secs = date.format(new Date(), 'ss');
  document.querySelector('.time').innerHTML = `${hours}:${mins}:${secs}`;
}
function showSunSetSunRise(object) {
  const sunRise = date.format(
    new Date(object.sys.sunrise * 1000 + openWeatherMap.timeZone),
    'HH:mm',
    true,
  );
  const sunSet = date.format(
    new Date(object.sys.sunset * 1000 + openWeatherMap.timeZone),
    'HH:mm',
    true,
  );
  document.querySelector('.sunrise').innerHTML = sunRise;
  document.querySelector('.sunset').innerHTML = sunSet;
}

function showQuotes() {
  const idx = Math.floor(Math.random() * quote.length);
  refs.quoteText.innerHTML = quote[idx].quote;
  refs.quoteAuthor.innerHTML = quote[idx].author;
}

function weatherALL(object) {
  if (intervalId) clearInterval(intervalId);
  pixabayServices.searchquery = object.name;
  fiveDays.searchquery = object.name;
  if (object.cod !== '404') {
    refs.blockCurrentWeather.innerHTML = '';
  } else return;
  object.main.temp = Math.round(object.main.temp);
  object.main.temp_min = Math.round(object.main.temp_min);
  object.main.temp_max = Math.round(object.main.temp_max);
  openWeatherMap.differSecondsFromUtc = object.timezone * 1000;

  const templatesHtmlWeather = templateCurrentWeather(object);
  refs.blockCurrentWeather.insertAdjacentHTML(
    'beforeend',
    templatesHtmlWeather,
  );
  iconWeather(object);
  setInterval(timeCurrent, 1000);
  crateBackGroungImg();
  setTimeout(dateCurrent, 1000);
  showSunSetSunRise(object);
  const idInterval = setInterval(showQuotes, 7000);
  intervalId = idInterval;
}

// ////////////////////////////////////////////////------5 DAYS-----------------
function showAnotherDaysWearher(e) {
  const nameBtn = e.target.name;
  const currentBtn = e.target;
  if (nameBtn === 'fiveDays') {
    currentBtn.classList.remove('current-date-time-unactive');
    e.currentTarget.children.today.classList.add('current-date-time-unactive');
    hideWeatherToday();
    getFiveDaysWeather();
  }
  if (nameBtn === 'today') {
    currentBtn.classList.remove('current-date-time-unactive');
    e.currentTarget.children.fiveDays.classList.add(
      'current-date-time-unactive',
    );
    showWeatherToday();
  }
}

function hideWeatherToday() {
  refs.blockCurrentWeather.classList.add('unvisible');
  refs.blockCurrentDayTime.classList.add('unvisible');
  refs.blockQuote.classList.add('unvisible');
  refs.blockFiveDays.classList.remove('unvisible');
  refs.mainblockWeatherFiveDays.classList.remove('unvisible');
}
function showWeatherToday() {
  refs.blockCurrentWeather.classList.remove('unvisible');
  refs.blockCurrentDayTime.classList.remove('unvisible');
  refs.blockQuote.classList.remove('unvisible');
  refs.mainblockWeatherFiveDays.classList.add('unvisible');
}

function showFiveDaysWeather(arr) {
  const allDays = arr.map(elem => {
    const dayNumber = +date.format(new Date(elem.dt * 1000), 'DD', true);
    const dayString = date.format(new Date(elem.dt * 1000), 'dddd', true);
    const month = date.format(new Date(elem.dt * 1000), 'MMM', true);

    const obj = {
      day: dayNumber,
      dayString: dayString,
      month: month,
      icon: elem.weather[0].icon,
      temMin: elem.main.temp_min,
      temMax: elem.main.temp_max,
    };
    return obj;
  });
  const arrayFivDeays = crateObjectsWithInfoWeatherForFiveDays(arr, allDays);
  fiveDaysFromTempalte(arrayFivDeays);
  const mySwiper = new Swiper('.swiper-container', {
    slidesPerView: 3,
    spaceBetween: 15,
    freeMode: false,
    loop: false,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });
}

function crateObjectsWithInfoWeatherForFiveDays(arr, allDays) {
  let dayNumber = +date.format(new Date(arr[0].dt * 1000), 'DD', true);
  const firstDAy = allDays.filter(el => el.day === dayNumber);
  const day1 = allDays.find(el => el.day === dayNumber);
  dayNumber++;
  const secondDAy = allDays.filter(el => el.day === dayNumber);
  const day2 = allDays.find(el => el.day === dayNumber);
  dayNumber++;
  const thirdDAy = allDays.filter(el => el.day === dayNumber);
  const day3 = allDays.find(el => el.day === dayNumber);
  dayNumber++;
  const fourDAy = allDays.filter(el => el.day === dayNumber);
  const day4 = allDays.find(el => el.day === dayNumber);
  dayNumber++;
  const fiveDAy = allDays.filter(el => el.day === dayNumber);
  const day5 = allDays.find(el => el.day === dayNumber);

  day1.temMin = Math.round(Math.min(...firstDAy.map(el => el.temMin)));
  day1.temMax = Math.round(Math.max(...firstDAy.map(el => el.temMax)));
  day2.temMin = Math.round(Math.min(...secondDAy.map(el => el.temMin)));
  day2.temMax = Math.round(Math.max(...secondDAy.map(el => el.temMax)));
  day3.temMin = Math.round(Math.min(...thirdDAy.map(el => el.temMin)));
  day3.temMax = Math.round(Math.max(...thirdDAy.map(el => el.temMax)));
  day4.temMin = Math.round(Math.min(...fourDAy.map(el => el.temMin)));
  day4.temMax = Math.round(Math.max(...fourDAy.map(el => el.temMax)));
  day5.temMin = Math.round(Math.min(...fiveDAy.map(el => el.temMin)));
  day5.temMax = Math.round(Math.max(...fiveDAy.map(el => el.temMax)));

  const objectFiveDays = [];
  objectFiveDays.push(day1, day2, day3, day4, day5);
  return objectFiveDays;
}

function fiveDaysFromTempalte(array) {
  refs.fiveDaysBlock.innerHTML = '';
  const cards = array.map(item => templateFiveDays(item)).join('');
  refs.fiveDaysBlock.insertAdjacentHTML('beforeend', cards);
}

function addCityToLocalStorage() {
  if (!localStorage.getItem('city')) {
    const localArray = JSON.stringify(openWeatherMap.query);
    localStorage.setItem('city', localArray);
  }
  const cityFromLocalStorage = JSON.parse(localStorage.getItem('city'));

  if (cityFromLocalStorage.includes(openWeatherMap.query)) return;
  const addCityToString = cityFromLocalStorage + ',' + openWeatherMap.query;
  localStorage.setItem('city', JSON.stringify(addCityToString));
}

function favoriteCityTemplate() {
  if (localStorage.getItem('city') === null) return;
  const cityFromLocalStorage = JSON.parse(localStorage.getItem('city'));
  const array = cityFromLocalStorage.split(',');
  const newArray = array.map(el => {
    return { city: el };
  });
  refs.favoriteCityContainer.innerHTML = '';
  const stringWithHtmlCode = newArray
    .map(itemMenu => templateFvoritCities(itemMenu))
    .join('');
  refs.favoriteCityContainer.insertAdjacentHTML(
    'beforeend',
    stringWithHtmlCode,
  );
}

function getWeatherByFavoriteCity(e) {
  if (e.target.dataset.close === 'closeMe') {
    const currentCityForDelete = e.target.name;
    removeCityFromFavorite(currentCityForDelete);
  }

  if (e.target.dataset.city === 'openCity') {
    openWeatherMap.searchquery = e.target.textContent;
    fiveDays.searchquery = e.target.textContent;
    getWeatherByCity();
    getFiveDaysWeather();
  }
}

function removeCityFromFavorite(city) {
  const cityFromLocalStorage = JSON.parse(localStorage.getItem('city'));
  const array = cityFromLocalStorage.split(',');
  const idx = array.indexOf(city);
  const arrayAfterRemovCity = array.filter(el => el !== array[idx]);
  const joinedCity = arrayAfterRemovCity.join(',');
  localStorage.setItem('city', JSON.stringify(joinedCity));
  favoriteCityTemplate();
  if (arrayAfterRemovCity.length === 0) {
    localStorage.removeItem('city');
    refs.favoriteCityContainer.innerHTML = '';
  }
}
