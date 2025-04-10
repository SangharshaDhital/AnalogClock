const clock = document.getElementById('clock');
const loading = document.querySelector('.loading');
const errorDisplay = document.querySelector('.error-message');
const timezoneDisplay = document.querySelector('.timezone-display');

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function fetchTimezone(lat, lng) {
  const API_KEY = 'CEFSNWWPBEPU'; // Replace with your own key if needed
  const res = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=position&lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error('Failed to fetch timezone');
  return res.json();
}

function startClock(timeZone) {
  function updateTime() {
    const now = timeZone ? new Date(new Date().toLocaleString("en-US", { timeZone })) : new Date();

    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    const hourDeg = h * 30 + m * 0.5;
    const minuteDeg = m * 6 + s * 0.1;
    const secondDeg = s * 6 + ms * 0.006;

    rotate('.hour-hand', hourDeg);
    rotate('.minute-hand', minuteDeg);
    rotate('.second-hand', secondDeg);

    requestAnimationFrame(updateTime);
  }

  updateTime();
}

function rotate(selector, deg) {
  const el = document.querySelector(selector);
  el.style.transform = `translateX(-50%) rotate(${deg}deg)`;
}

function createClockNumbers() {
  for (let i = 1; i <= 12; i++) {
    const angle = (i - 3) * 30;
    const radius = 160;
    const x = 200 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 200 + radius * Math.sin((angle * Math.PI) / 180);

    const number = document.createElement('div');
    number.className = 'clock-number';
    number.innerText = i;
    number.style.left = `${x}px`;
    number.style.top = `${y}px`;

    clock.appendChild(number);
  }
}

async function initializeClock() {
  loading.style.display = 'block';
  try {
    const pos = await getLocation();
    const tz = await fetchTimezone(pos.coords.latitude, pos.coords.longitude);
    timezoneDisplay.textContent = tz.zoneName.split('/').pop().replace(/_/g, ' ');
    startClock(tz.zoneName);
  } catch (err) {
    errorDisplay.style.display = 'block';
    errorDisplay.textContent = '⚠️ Location access denied. Showing local time.';
    startClock();
  } finally {
    loading.style.display = 'none';
  }
}

createClockNumbers();
initializeClock();
