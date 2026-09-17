// One-time clean-start migration requested by Dre on 2026-09-16.
// Clears prototype/test entries while leaving the app's seeded routines and plant roster intact.
(() => {
  const marker = 'dreLifeOS_clean_start_2026_09_16';
  if (!localStorage.getItem(marker)) {
    localStorage.removeItem('dreLifeOS');
    localStorage.setItem(marker, new Date().toISOString());
  }
})();
