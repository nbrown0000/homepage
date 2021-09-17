function showWeather() {
  document.getElementsByClassName('weather-section')[0].classList.remove('hidden-mobile');
  document.getElementsByClassName('news-section')[0].classList.add('hidden-mobile');
  document.getElementsByClassName('tasks-section')[0].classList.add('hidden-mobile');
}

function showNews() {
  document.getElementsByClassName('weather-section')[0].classList.add('hidden-mobile');
  document.getElementsByClassName('news-section')[0].classList.remove('hidden-mobile');
  document.getElementsByClassName('tasks-section')[0].classList.add('hidden-mobile');
}

function showTasks() {
  document.getElementsByClassName('weather-section')[0].classList.add('hidden-mobile');
  document.getElementsByClassName('news-section')[0].classList.add('hidden-mobile');
  document.getElementsByClassName('tasks-section')[0].classList.remove('hidden-mobile');
}