import { initLibrary } from './features/library/index.js';
import { initDiscover } from './features/discover/index.js';

document.addEventListener('DOMContentLoaded', () => {
  initLibrary();
  initDiscover();
});
