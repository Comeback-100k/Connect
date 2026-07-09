fetch('http://localhost:8080/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Task',
    description: 'Test Description',
    status: 'TODO',
    priority: 'Medium',
    creatorId: 1,
    assigneeId: 2
  })
})
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
