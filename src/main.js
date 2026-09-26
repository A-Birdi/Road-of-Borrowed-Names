/* Boot. Loaded last. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', () => { if (RB.game && RB.game.boot) RB.game.boot(); });
})();
