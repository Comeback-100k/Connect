fetch('http://localhost:8080/api/tasks')
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
