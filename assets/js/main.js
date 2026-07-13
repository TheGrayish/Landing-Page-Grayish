(function () {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    document.body.classList.toggle('scrolled', window.scrollY > 60);
  }
  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToggle() {
    document.body.classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToggle);
  }

  document.querySelectorAll('#navmenu a').forEach(link => {
    link.addEventListener('click', () => {
      if (document.body.classList.contains('mobile-nav-active')) {
        mobileNavToggle();
      }
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => preloader.remove());
  }

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector('.scroll-top');
  function toggleScrollTop() {
    if (scrollTop) {
      scrollTop.classList.toggle('active', window.scrollY > 200);
    }
  }
  if (scrollTop) {
    window.addEventListener('load', toggleScrollTop);
    document.addEventListener('scroll', toggleScrollTop);
  }

  /**
   * AOS init
   */
  function aosInit() {
    if (window.AOS) {
      AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false });
    }
  }
  window.addEventListener('load', aosInit);

  /**
   * Correct scrolling position for URLs containing hash links
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      const section = document.querySelector(window.location.hash);
      if (section) {
        setTimeout(() => {
          const scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({ top: section.offsetTop - parseInt(scrollMarginTop), behavior: 'smooth' });
        }, 100);
      }
    }
  });

  /**
   * Navmenu scrollspy
   */
  const navmenulinks = document.querySelectorAll('.navmenu a');
  function navmenuScrollspy() {
    navmenulinks.forEach(link => {
      if (!link.hash) return;
      const section = document.querySelector(link.hash);
      if (!section) return;
      const position = window.scrollY + 200;
      const isInSection = position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight);
      link.classList.toggle('active', isInSection);
    });
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();
