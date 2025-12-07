// back.js
(function() {
  // Push a dummy state so back button doesn't exit immediately
  if (!sessionStorage.getItem("initialState")) {
    history.replaceState({section: 'start'}, '', '');
    history.pushState({section: 'start'}, '', '');
    sessionStorage.setItem("initialState", "true");
  }

  // Function to navigate to a section
  window.navigateToSection = function(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    const sec = document.getElementById(sectionId);
    if(sec) sec.classList.remove('hidden');

    history.pushState({section: sectionId}, '', '');
  }

  // Listen for back button
  window.addEventListener('popstate', function(event) {
    if(event.state && event.state.section && event.state.section !== 'start'){
      // Show the section
      document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
      const sec = document.getElementById(event.state.section);
      if(sec) sec.classList.remove('hidden');
    } else {
      // First state reached, go back to previous real page
      history.go(-2); // skip the fake state
    }
  });
})();