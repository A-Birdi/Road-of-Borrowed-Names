/* The development switch for the twelve-chapter edition (expansion S4; the lead's decision F-01 under C-81), used
 * while the edition was being built: new journeys were six-chapter unless it was on. Since the edition shipped (C-84)
 * the row is not shown (new journeys are twelve-chapter); it returns only in a build with `RB.edition._ship(false)`.
 * It never changed a journey already begun: every save keeps its own edition. (Device setting `edition`: 6 | 12;
 * `?edition=12` on the address does the same.) */
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
