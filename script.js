const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const themeToggle = document.querySelector('.theme-toggle');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

const navLinks = document.querySelectorAll('.site-nav a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

const storedTheme = localStorage.getItem('theme');
const defaultTheme = storedTheme || 'dark';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Vaheta heledale teemale' : 'Vaheta tumedale teemale');
  }
}

if (themeToggle) {
  applyTheme(defaultTheme);
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

