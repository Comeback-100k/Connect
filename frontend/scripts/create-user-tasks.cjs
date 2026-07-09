const http = require('http');

function postTask(task) {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:8080/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(JSON.stringify(task));
    req.end();
  });
}

async function run() {
  // 1. Task in TODO for Sarah Jenkins
  await postTask({
    title: 'Review System Logs',
    description: 'Check the server logs for any anomalies.',
    status: 'TODO',
    priority: 'Medium',
    creatorId: 1,
    assigneeId: 1 // Sarah Jenkins
  });

  // 2. Task in IN_PROGRESS for Sarah Jenkins with specific text
  await postTask({
    title: 'Update Security Policies',
    description: 'any text in that progross',
    status: 'IN_PROGRESS',
    priority: 'High',
    creatorId: 1,
    assigneeId: 1 // Sarah Jenkins
  });

  // 3. Task in DONE (assigned to someone else, e.g., David Miller ID 2)
  await postTask({
    title: 'Deploy to Production',
    description: 'Successfully deployed version 2.0.',
    status: 'DONE',
    priority: 'Medium',
    creatorId: 1,
    assigneeId: 2
  });
  
  console.log("Tasks created successfully!");
}

run();
