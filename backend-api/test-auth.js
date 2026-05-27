fetch('http://127.0.0.1:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'node@test.com', password: '123', name: 'Node' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
