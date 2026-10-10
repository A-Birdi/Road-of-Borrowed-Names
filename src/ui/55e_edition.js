/* The development switch for the twelve-chapter edition (expansion S4; the lead's decision F-01 under C-81).
 * Until the release, new journeys are six-chapter; this setting lets new journeys begin in the twelve-chapter edition
 * while it is being built, so it can be played and reviewed. It changes nothing about a journey already begun: every
 * save keeps its own edition. (Device setting `edition`: 6 | 12; `?edition=12` on the address does the same.) */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  if (!RB.ui || !RB.ui.settings || !RB.ui.settings.addRows) return;
  RB.ui.settings.addRows('learning', ({ radios }) => {
    if (RB.edition && RB.edition.shipped()) return '';
    return '<h3 class="set-sub">New journeys</h3>' +
      radios('edition', 'Edition for new journeys', [['6', 'Six chapters'], ['12', 'Twelve chapters (in development)']], null,
        'The twelve-chapter edition adds six new chapters and is still being built. Only journeys begun after choosing it use it; every saved journey keeps the edition it began in.');
  });
})();
