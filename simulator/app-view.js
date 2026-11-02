// Set before the stylesheet paints so the installed view never flashes the playground.
if(location.pathname==='/customize')document.documentElement.classList.add('customizing');
if (location.pathname === '/app' || location.pathname === '/app/') {
  document.documentElement.classList.add('app-only');
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(error => console.warn('Offline shell unavailable', error));
    });
  }
}
