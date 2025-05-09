import fetch from 'node-fetch';

async function testLogin() {
  const loginResponse = await fetch('http://localhost:3001/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'se22uari001@mahindrauniversity.edu.in', password: 'chaitanya' })
  });

  if (!loginResponse.ok) {
    console.error('Login failed:', await loginResponse.text());
    return;
  }

  const loginData = await loginResponse.json();
  console.log('Login successful, received token:', loginData.token);

  // Test accessing a protected route with the token
  const protectedResponse = await fetch('http://localhost:3001/faculty/courses', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + loginData.token
    }
  });

  if (protectedResponse.ok) {
    const data = await protectedResponse.json();
    console.log('Protected route access successful:', data);
  } else {
    console.error('Protected route access failed:', await protectedResponse.text());
  }

  // Test adding a project with the token
  const addProjectResponse = await fetch('http://localhost:3001/faculty/addProject', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + loginData.token
    },
    body: JSON.stringify({
      projectId: 'proj123',
      projectName: 'New Project',
      description: 'Project description',
      techStack: 'Node.js, OracleDB',
      status: 'Active'
    })
  });

  if (addProjectResponse.ok) {
    const data = await addProjectResponse.json();
    console.log('Add project successful:', data);
  } else {
    console.error('Add project failed:', await addProjectResponse.text());
  }
}

testLogin().catch(console.error);
