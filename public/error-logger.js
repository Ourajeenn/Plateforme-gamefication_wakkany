window.addEventListener('error', function(event) {
  fetch('http://localhost:5179/error-log', {
    method: 'POST',
    mode: 'no-cors',
    body: event.message + ' ' + event.filename + ':' + event.lineno
  });
});
