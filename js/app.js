<<<<<<< HEAD
/*
=======

>>>>>>> 325770e (initial build)
const fadeSections = document.querySelectorAll('.section-fade');
const options = { threshold: 0.2 };
const revealOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('section-show');
      observer.unobserve(entry.target);
    }
  });
}, options);

fadeSections.forEach(sec => revealOnScroll.observe(sec));
<<<<<<< HEAD
*/

// Toggle mobile menu visibility
function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  menu.classList.toggle('d-none');
}


document
  .getElementById('menu-toggle')
  .addEventListener('click', toggleMobileMenu);
=======
>>>>>>> 325770e (initial build)
