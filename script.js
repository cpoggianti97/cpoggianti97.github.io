/* Progressive enhancement for a static GitHub Pages site.
   Navigation and all publications remain available without JavaScript. */
(() => {
  'use strict';

  const nav = document.getElementById('primary-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
    };
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 921px)').addEventListener('change', event => {
      if (event.matches) closeMenu();
    });
  }

  // Display an included illustration until the site's existing foto2.jpg loads.
  const portrait = document.querySelector('img[data-portrait]');
  if (portrait) {
    const image = new Image();
    image.addEventListener('load', () => {
      portrait.src = image.src;
      portrait.alt = 'Portrait of Camilla Poggianti';
    });
    image.src = portrait.dataset.portrait;
  }

  const cards = Array.from(document.querySelectorAll('.publication'));
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const search = document.getElementById('publication-search');
  const showMore = document.getElementById('show-more-publications');
  const count = document.getElementById('publication-count');
  const empty = document.getElementById('publication-empty');
  if (cards.length && search && showMore && count && empty) {
    let currentFilter = 'all';
    let expanded = false;
    const pageSize = 6;

    const updateList = () => {
      const query = search.value.trim().toLocaleLowerCase();
      const matches = cards.filter(card => {
        const categoryMatches = currentFilter === 'all' || card.dataset.kind === currentFilter;
        const contentMatches = !query || card.dataset.search.includes(query);
        return categoryMatches && contentMatches;
      });
      // Searching and category filters always reveal all matching results.
      const limit = currentFilter === 'all' && !query && !expanded ? pageSize : Infinity;
      const visible = new Set(matches.slice(0, limit));
      cards.forEach(card => { card.hidden = !visible.has(card); });
      count.textContent = `Showing ${visible.size} of ${matches.length} matching publication${matches.length === 1 ? '' : 's'}`;
      empty.hidden = matches.length > 0;
      showMore.hidden = !(currentFilter === 'all' && !query && matches.length > pageSize);
      showMore.innerHTML = expanded ? 'Show fewer publications <span aria-hidden="true">↑</span>' : 'Show all publications <span aria-hidden="true">↓</span>';
    };

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        currentFilter = button.dataset.filter;
        expanded = false;
        filterButtons.forEach(item => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        updateList();
      });
    });
    search.addEventListener('input', updateList);
    showMore.addEventListener('click', () => {
      expanded = !expanded;
      updateList();
      if (!expanded) document.getElementById('publications')?.scrollIntoView({behavior:'smooth'});
    });
    updateList();

    // Related-publication anchor links must never target an initially hidden card.
    document.querySelectorAll('a[href^="#pub-"]').forEach(link => {
      link.addEventListener('click', () => {
        currentFilter = 'all';
        expanded = true;
        search.value = '';
        filterButtons.forEach(item => {
          const active = item.dataset.filter === 'all';
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        updateList();
      });
    });
    if (window.location.hash.startsWith('#pub-')) {
      expanded = true;
      updateList();
    }
  }

  const year = document.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
