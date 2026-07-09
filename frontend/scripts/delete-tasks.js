for (let i = 1; i <= 50; i++) {
  fetch(`http://localhost:8080/api/tasks/${i}`, { method: 'DELETE' })
    .then(res => res.text())
    .then(t => console.log(`Deleted ${i}: ${t}`))
    .catch(console.error);
}
