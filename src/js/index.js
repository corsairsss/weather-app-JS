import Swiper from 'swiper';
import 'swiper/css/swiper.css';
import notyfOptions from '../config/notyf-options.js';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import pixabayServices from './apiService.js';
import openWeatherMap from './apiWeather.js';
import fiveDays from './api5DaysWearher.js';
import templateCurrentWeather from '../templates/weather-today.hbs';
import templateFiveDays from '../templates/fiveDays.hbs';
import templateFvoritCities from '../templates/favoriteCity.hbs';
import templateWeatherDetails from '../templates/weather_info_details.hbs';
import date from 'date-and-time';
import '../css/normalize.css';
import '../css/style.css';
import '../css/spiner-overlay.css';
import regeneratorRuntime from 'regenerator-runtime';
import quote from './quote.js';

const notyf = new Notyf(notyfOptions);
const windowWidth = window.screen.width;
// -------------------------------------
const getGeoPosition = options => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

getGeoPosition()
  .then(position => {
    openWeatherMap.latitude = position.coords.latitude;
    openWeatherMap.longitude = position.coords.longitude;
    setTimeout(addClass, 1000);
    weatherWithGeoPosition();
    favoriteCityTemplate();
    if (localStorage.getItem('city')) {
      const mySwiper = new Swiper('.swiper1', {
        slidesPerView: 3,
        spaceBetween: 15,
        freeMode: false,
        loop: false,
        breakpoints: {
          768: {
            slidesPerView: 4,
            spaceBetween: 5,
          },
        },
        pagination: {
          el: '.sw1',
          clickable: true,
        },
      });
    }
  })
  .catch(error => {
    console.log(`GEO-ERROR:${error.message}`);
  });
// -------------

// ------------------------------------------------------------
const refs = {
  overlay: document.querySelector('.overlay'),
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
  blockWeatherPerHour: document.querySelector('.weather-per-3hour'),
  btnCloseMoreInfoWeather: document.querySelector('.js-close-more-info'),
};
let intervalId;
//------------------   LISTENERs----------------------

refs.searchForm.addEventListener('submit', showWeather);
refs.buttonsPeriodWeather.addEventListener('click', showAnotherDaysWearher);
refs.btnAddFavoriteCity.addEventListener('click', addFavoriteCity);
refs.favoriteCityContainer.addEventListener('click', getWeatherByFavoriteCity);
refs.fiveDaysBlock.addEventListener('click', showMoreInfoWeather);
function addClass() {
  refs.overlay.classList.add('unvisible');
}
function removeClass() {
  refs.overlay.classList.remove('unvisible');
}
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
    pixabayServices.searchquery = 'weather';
    const url = await pixabayServices.fetchArticles();
    refs.mainContainer.style.backgroundImage = `url(${url})`;
    console.dir(`error:${error}`);
  }
}
async function weatherWithGeoPosition() {
  try {
    const weatherGeo = await openWeatherMap.requestGeoParam();

    weatherALL(weatherGeo);
  } catch (error) {
    console.log(`error:${error}`);
  }
}
async function getWeatherByCity() {
  try {
    removeClass();
    setTimeout(addClass, 2000);
    const objWithWeather = await openWeatherMap.fetchArticles();
    weatherALL(objWithWeather);
  } catch (error) {
    console.log(`error_getWeatherByCity:${error}`);
  }
}
// ========================

async function returnWeatherForFiveDays() {
  try {
    const fiveDaysObj = await fiveDays.get5DaysWeather();
    return fiveDaysObj;
  } catch (error) {
    console.log(`error:${error}`);
  }
}
// ========================

async function getFiveDaysWeather() {
  try {
    const fiveDaysObj = await returnWeatherForFiveDays();
    document.querySelector(
      '.js-city',
    ).innerHTML = `${fiveDaysObj.city.name}, ${fiveDaysObj.city.country}`;
    const listWeather = fiveDaysObj.list;
    showFiveDaysWeather(listWeather);
  } catch (error) {
    notyf.open({ type: 'badRequest' });
    console.log(`error_getFiveDaysWeather:${error}`);
  }
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
  document.querySelector('.block-more-info').classList.add('unvisible');
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
  showQuotes();
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
    if (window.screen.width >= 768)
      refs.buttonsPeriodWeather.style.paddingTop = '328px';
    currentBtn.classList.remove('current-date-time-unactive');
    e.currentTarget.children.today.classList.add('current-date-time-unactive');
    hideWeatherToday();
    getFiveDaysWeather();
  }
  if (nameBtn === 'today') {
    refs.buttonsPeriodWeather.style.paddingTop = '25px';

    currentBtn.classList.remove('current-date-time-unactive');
    e.currentTarget.children.fiveDays.classList.add(
      'current-date-time-unactive',
    );
    showWeatherToday();
    closeBlockWeatherPerHour();
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
    const dayNumber = +date.format(
      new Date(elem.dt * 1000 + openWeatherMap.timeZone),
      'DD',
      true,
    );
    const dayString = date.format(
      new Date(elem.dt * 1000 + openWeatherMap.timeZone),
      'dddd',
      true,
    );
    const month = date.format(
      new Date(elem.dt * 1000 + openWeatherMap.timeZone),
      'MMM',
      true,
    );

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
  refs.btnCloseMoreInfoWeather.classList.add('unvisible');

  const mySwiper = new Swiper('.swiper2', {
    slidesPerView: 3,
    spaceBetween: 15,
    freeMode: false,
    loop: false,
    pagination: {
      el: '.sw2',
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 5,
        spaceBetween: 15,
        pagination: {
          el: '',
        },
      },
    },
  });
}

function crateObjectsWithInfoWeatherForFiveDays(arr, allDays) {
  let currDay = +date.format(
    new Date(arr[0].dt * 1000 + openWeatherMap.timeZone),
    'DD',
    true,
  );
  let day6 = [];
  const firstDAy = allDays.filter(el => el.day === currDay);
  const secondDAy = allDays.slice(firstDAy.length, firstDAy.length + 8);
  const thirdDAy = allDays.slice(firstDAy.length + 8, firstDAy.length + 16);
  const fourDAy = allDays.slice(firstDAy.length + 16, firstDAy.length + 24);
  const fiveDAy = allDays.slice(firstDAy.length + 24, firstDAy.length + 32);
  const sixDAy = allDays.slice(firstDAy.length + 32);

  const day1 = firstDAy[0];
  const day2 = secondDAy[0];
  const day3 = thirdDAy[0];
  const day4 = fourDAy[0];
  const day5 = fiveDAy[0];
  if (sixDAy.length !== 0) {
    day6 = sixDAy[0];
    day6.temMin = Math.round(Math.min(...sixDAy.map(el => el.temMin)));
    day6.temMax = Math.round(Math.max(...sixDAy.map(el => el.temMax)));
  }
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
  firstDAy.length === 1
    ? objectFiveDays.push(day2, day3, day4, day5, day6)
    : objectFiveDays.push(day1, day2, day3, day4, day5);

  return objectFiveDays;
}

function fiveDaysFromTempalte(array) {
  refs.fiveDaysBlock.innerHTML = '';
  const cards = array.map(item => templateFiveDays(item)).join('');
  refs.fiveDaysBlock.insertAdjacentHTML('beforeend', cards);
}

function addCityToLocalStorage() {
  if (openWeatherMap.query === '') {
    notyf.open({ type: 'nocity' });
    return;
  }

  if (!localStorage.getItem('city')) {
    const localArray = JSON.stringify(openWeatherMap.query);
    localStorage.setItem('city', localArray);
  }
  const cityFromLocalStorage = JSON.parse(localStorage.getItem('city'));

  if (cityFromLocalStorage.includes(openWeatherMap.query)) {
    notyf.error({ type: 'error' });
    return;
  }
  notyf.open({ type: 'info' });
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
    refs.btnCloseMoreInfoWeather.classList.add('unvisible');

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

async function showMoreInfoWeather(e) {
  const currentDay = e.target.dataset.day;

  styleForDayItem(currentDay);
  const fullObjectFromRequest = await returnWeatherForFiveDays();
  const listWithObjectForFiveDays = fullObjectFromRequest.list;
  const weatherOneDay = listWithObjectForFiveDays.filter(el => {
    const dayNumber = date.format(
      new Date(el.dt * 1000 + openWeatherMap.timeZone),
      'D',
      true,
    );
    return dayNumber === currentDay;
  });
  weatherOneDay.forEach(el => {
    el.dt = date.format(
      new Date(el.dt * 1000 + openWeatherMap.timeZone),
      'HH:mm A',
      true,
    );
    el.main.temp = Math.round(el.main.temp);
  });
  const itemHour = weatherOneDay
    .map(item => templateWeatherDetails(item))
    .join('');
  refs.blockWeatherPerHour.insertAdjacentHTML('beforeend', itemHour);
  refs.btnCloseMoreInfoWeather.classList.remove('unvisible');
  refs.btnCloseMoreInfoWeather.addEventListener(
    'click',
    closeBlockWeatherPerHour,
  );
  console.log(window.innerHeight);
  console.log(document.body.clientHeight);
  const scrollTo = document.body.clientHeight - window.innerHeight;
  window.scrollTo({
    top: scrollTo,
    behavior: 'smooth',
  });
  const mySwiper = new Swiper('.swiper3', {
    slidesPerView: 2,
    spaceBetween: 10,
    freeMode: false,
    loop: false,
    pagination: {
      el: '.sw3',
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 4,
        spaceBetween: 15,
      },
      1280: {
        slidesPerView: 8,
        spaceBetween: 5,
        pagination: {
          el: '',
        },
      },
    },
  });
}

function styleForDayItem(currentDay) {
  removeStyleFor5DayItem();
  document
    .querySelector(`.dayItem[data-day="${currentDay}"]`)
    .classList.add('bg-dayItem');
  document.querySelector(
    `.dayItem__weekDay[data-day="${currentDay}"]`,
  ).style.color = '#ff6b08';
  document.querySelector(
    `.dayItem__moreInfo[data-day="${currentDay}"]`,
  ).style.color = '#ffffff';
}

function removeStyleFor5DayItem() {
  refs.blockWeatherPerHour.innerHTML = '';
  document.querySelector('.block-more-info').classList.remove('unvisible');
  document
    .querySelectorAll('.dayItem')
    .forEach(el => el.classList.remove('bg-dayItem'));
  document
    .querySelectorAll('.dayItem__moreInfo')
    .forEach(el => (el.style.color = 'hsla(0, 0%, 100%, 0.3)'));
  document
    .querySelectorAll('.dayItem__weekDay')
    .forEach(el => (el.style.color = 'hsla(0, 0%, 100%, 0.54)'));
}

function closeBlockWeatherPerHour() {
  removeStyleFor5DayItem();
  document.querySelector('.block-more-info').classList.add('unvisible');
  refs.btnCloseMoreInfoWeather.classList.add('unvisible');
}
