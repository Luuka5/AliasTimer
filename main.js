import './css/style.css';
import './css/hourglass.css';
import './css/editwindow.css';
import * as Tone from 'tone';

const app = document.querySelector('#app');

const reflectionImageContainer = document.querySelector('.hourglass .reflectionImageContainer');
const hourglassImageContainer = document.querySelector('.hourglass .hourglassImageContainer');
const hourglass = document.querySelector('.hourglass');

const timer = document.querySelector('.timer');
const startButton = document.querySelector('#start');
const clickArea = document.querySelector('#clickArea');

const editButton = document.querySelector('#edit');
const editWindow = document.querySelector('.editWindow');

const saveButton = document.querySelector('#save');
const cancelButton = document.querySelector('#cancel');

const editMinutes = document.querySelector('#editMinutes');
const edtiSeconds = document.querySelector('#editSeconds');

const recomendationElement = document.querySelector('.recomendations');

const images = [];

const recomendations = [
  { name: 'Short', duration: 60000 },
  { name: 'Medium', duration: 75000 },
  { name: 'Long', duration: 120000 },
  { name: 'Marathon', duration: 600000 }
];

const defaultImage = document.createElement('img');
function getImage(i) {
  return images[i] || defaultImage;
}

function getMinutes(time) {
  return Math.floor(time / 60000);
}

function getSeconds(time) {
  return Math.floor(time / 1000) % 60;
}

function getFileName(x) {
  return `/images/frames/${new Array(4 - (x+'').length + 1).join('0') + x}.svg`;
}

function fixedLenght(number, length = 2) {
  return ('' + number).padStart(length, '0');
}

function showTime(time) {
  const timeAsDate = new Date(time);
  timer.innerHTML = `${fixedLenght(timeAsDate.getMinutes())}:${fixedLenght(timeAsDate.getSeconds())}.${fixedLenght(Math.floor(timeAsDate.getMilliseconds() / 10))}`;
}

function sound() {
  const now = Tone.now();
  synth.triggerAttackRelease("C4", "8n", now);
  synth.triggerAttackRelease("E4", "8n", now + 0.1);
  synth.triggerAttackRelease("G4", "8n", now + 0.2);
}

const synth = new Tone.Synth().toDestination();

let startTime = 0, duration = 75000, isRunning = false;
let intervalId = 0, frame = 0;
let editValue = duration;

function loop() {

  if (!isRunning) return;

  const time = Date.now() - startTime;
  const timeLeft = duration - time;

  if (timeLeft < 0) {

    document.body.style.setProperty('--bg', 'var(--green)');
    stopTimer();
    sound();
    return;
  }

  hourglass.style.setProperty('--time', Math.max((time - 1000) / (duration - 1000), 0) * 100 +'%');
  
  showTime(timeLeft);
  requestAnimationFrame(loop);
}

function startTimer() {
  startButton.innerHTML = 'CANCEL';
  isRunning = true;
  startTime = Date.now();
  clearInterval(intervalId);
  hourglassImageContainer.classList.add('animate');
  startAnimation();
  console.log('start');
  
  loop();
}

function stopTimer() {
  isRunning = false;
  startTime = Date.now() - duration;
  clearInterval(intervalId);
  hourglassImageContainer.classList.remove('animate');
  startButton.innerHTML = 'START';
  hourglass.style.setProperty('--time', '0%');
  frame = 0;
  console.log('stop');
  showTime(duration);
  initHourglass();
}

function startAnimation() {
  document.body.style.setProperty('--bg', 'var(--red)');
  frame = 0;
  intervalId = setInterval(() => {
    frame++;
    if (frame >= 60) {
      frame = 0;
      clearInterval(intervalId);
    }
    reflectionImageContainer.innerHTML = '';
    reflectionImageContainer.appendChild(getImage(frame));
  }, 1000 / 60);
}

function initHourglass() {
  reflectionImageContainer.innerHTML = '';
  reflectionImageContainer.appendChild(getImage(0));
  hourglassImageContainer.classList.remove('animate'); 
  hourglass.style.setProperty('--time', '0%');
}

function initRecomendations() {
  recomendationElement.innerHTML = '';
  
  for (let r of recomendations) {
    const element = document.createElement('div');
    if (editValue === r.duration) {
      element.classList.add('selected');
    }
    element.innerHTML = `<div class="selectedIcon"><div></div></div><p>${r.name}</p><p class="num">${Math.floor(r.duration / 60000)}:${Math.floor(r.duration % 60000 / 1000)}</p>`;
    element.addEventListener('mousedown', () => {
      editMinutes.value = getMinutes(r.duration);
      edtiSeconds.value = getSeconds(r.duration);
      editValue = r.duration;
      initRecomendations();
    });
    recomendationElement.appendChild(element);
  }
}

clickArea.addEventListener('mousedown', () => {
  Tone.start();
  if (isRunning) stopTimer();
  else startTimer();
});

editButton.addEventListener('mousedown', () => {
  editWindow.classList.add('active');
  editMinutes.value = getMinutes(duration);
  edtiSeconds.value = getSeconds(duration);
  editMinutes.focus();
});

saveButton.addEventListener('mousedown', () => {
  duration = editMinutes.value * 60 * 1000 + edtiSeconds.value * 1000;
  editWindow.classList.remove('active');
  showTime(duration);
});

cancelButton.addEventListener('mousedown', () => {
  editWindow.classList.remove('active');
});

editMinutes.addEventListener('input', () => {
  editValue = editMinutes.value * 60 * 1000 + edtiSeconds.value * 1000;
  initRecomendations();
});

edtiSeconds.addEventListener('input', () => {
  editValue = editMinutes.value * 60 * 1000 + edtiSeconds.value * 1000;
  initRecomendations();
});

window.addEventListener('load', () => {
  for (let i = 1; i <= 60; i++) {
    var image = document.createElement("img");
    image.id = "reflectionImage" + i;
    image.className = "reflectionImage";
    image.src = getFileName(i);
    images.push(image);
  }
  app.classList.remove('loading');
  initHourglass();
});

showTime(duration);
initHourglass();
initRecomendations();
