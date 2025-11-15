document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const closeMenu = document.getElementById('close-menu');
  const sideMenu = document.getElementById('side-menu');
  const overlay = document.getElementById('overlay');

  const closeMenuHandler = () => {
    sideMenu.classList.remove('open');
    overlay.classList.remove('active');
  };

  hamburger.addEventListener('click', () => {
    sideMenu.classList.add('open');
    overlay.classList.add('active');
  });

  closeMenu.addEventListener('click', closeMenuHandler);
  overlay.addEventListener('click', closeMenuHandler);
  document.querySelectorAll('.side-menu a').forEach(link => {
    link.addEventListener('click', closeMenuHandler);
  });

  // 🌙 Dark mode
  const toggleTheme = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  };

  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }

  document.querySelectorAll('#theme-toggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
});