document.addEventListener('DOMContentLoaded', function () {
  // Fetch faculty details from the server when the page loads
  fetchFacultyInfo();

  // Default view: Dashboard
  hideAllSections();
  showSection('dashboard');
  setActiveLink('dashboard');

  // Sidebar navigation
  setupSidebarNavigation();

  // Project section buttons
  setupProjectSectionHandlers();

  // Add project form handler
  setupAddProjectFormHandler();

  // Profile photo change handler
  setupProfilePhotoUpload();

  // Edit profile functionality
  setupEditProfileHandlers();

  // Logout link handler
  document.getElementById('logoutLink')?.addEventListener('click', function (event) {
    event.preventDefault();
    handleLogout();
  });
});

function fetchFacultyInfo() {
  fetch('/session-user', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch session user.');
      return response.json();
    })
    .then(data => {
      // Save entire session user data to localStorage as JSON string
      localStorage.setItem('sessionUser', JSON.stringify(data));

      // Also update UI elements if applicable
      document.getElementById('faculty-id').textContent = data.FACULTY_ID || 'N/A';
      document.getElementById('faculty-name').textContent = data.name || 'N/A';
      document.getElementById('faculty-name-profile').textContent = data.name || 'N/A';
      document.getElementById('faculty-email').textContent = data.email || 'N/A';
      document.getElementById('faculty-password').textContent = data.password || 'N/A';
      document.getElementById('faculty-department').textContent = data.department || 'N/A';
      document.getElementById('faculty-phone').textContent = data.phone_number || 'N/A';
      document.getElementById('faculty-date-joined').textContent = data.date_joined || 'N/A';
      document.getElementById('faculty-dob').textContent = data.date_of_birth || 'N/A';
      document.getElementById('faculty-qualification').textContent = data.qualification || 'N/A';
      document.getElementById('faculty-experience').textContent = data.experience || 'N/A';
      document.getElementById('faculty-gender').textContent = data.gender || 'N/A';

      // Print localStorage data after login success
      console.log('LocalStorage sessionUser:', localStorage.getItem('sessionUser'));

      // Profile photo
      if (data.photo_url) {
        document.getElementById('profile-photo').src = data.photo_url;
      }

      // Welcome Message
      document.getElementById('welcomeMessage').textContent = `Welcome, ${data.name || '[Faculty Name]'}`;
    })
    .catch(error => {
      console.error('Error fetching session user:', error);
      document.getElementById('faculty-name').textContent = 'Error loading faculty data';
      document.getElementById('faculty-name-profile').textContent = 'Error loading faculty data';
    });
}

function setupSidebarNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  sidebarItems.forEach(item => {
    item.addEventListener('click', function (event) {
      event.preventDefault();
      const targetId = this.getAttribute('data-target');

      if (targetId === 'logout') {
        handleLogout();
      } else {
        hideAllSections();
        showSection(targetId);
        setActiveLink(targetId);
      }
    });
  });
}



function setupProjectSectionHandlers() {
  const viewOngoingBtn = document.getElementById('view-ongoing-btn');
  const viewNewRequestsBtn = document.getElementById('view-new-requests-btn');
  const viewAllBtn = document.getElementById('view-all-btn');
  const addNewProjectBtn = document.getElementById('add-new-project-btn');
  const cancelAddProjectBtn = document.getElementById('cancel-add-project-btn');

  viewOngoingBtn?.addEventListener('click', function () {
    document.getElementById('add-new-project-form').style.display = 'none';
    showSection('projects');
    fetchAndDisplayProjects('ongoing');
  });

  viewNewRequestsBtn?.addEventListener('click', function () {
    document.getElementById('add-new-project-form').style.display = 'none';
    showSection('projects');
    fetchAndDisplayProjects('newRequests');
  });

  viewAllBtn?.addEventListener('click', function () {
    document.getElementById('add-new-project-form').style.display = 'none';
    showSection('projects');
    fetchAndDisplayProjects('all');
  });

  addNewProjectBtn?.addEventListener('click', function () {
    document.getElementById('add-new-project-form').style.display = 'block';
    document.getElementById('projects-list').style.display = 'none';
  });

  cancelAddProjectBtn?.addEventListener('click', function () {
    document.getElementById('add-new-project-form').style.display = 'none';
    document.getElementById('projects-list').style.display = 'block';
  });
}

// New function to fetch and display projects in the projects-list ul
async function fetchAndDisplayProjects(type) {
  const projectsList = document.getElementById('projects-list');
  projectsList.innerHTML = '';

  let url = 'http://127.0.0.1:3001/faculty/getProjects';
  if (type === 'ongoing') {
    url = 'http://127.0.0.1:3001/faculty/getOngoingProjects';
  } else if (type === 'newRequests') {
    url = 'http://127.0.0.1:3001/faculty/getNewProjectRequests';
  } else if (type === 'all') {
    url = 'http://127.0.0.1:3001/admin/viewAllProjects';
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch projects');

    const data = await response.json();
    const projects = data.projects || data;

    if (!projects || projects.length === 0) {
      projectsList.innerHTML = '<p>No projects found.</p>';
      return;
    }

      // Clear the projectsList container
      projectsList.innerHTML = '';

      if (projects.length === 0) {
        projectsList.textContent = 'No projects found.';
        return;
      }

      // Create table element
      const table = document.createElement('table');
      table.classList.add('projects-table');
      table.style.borderCollapse = 'collapse';
      table.style.width = '100%';
      table.style.marginTop = '10px';
      table.style.fontFamily = 'Arial, sans-serif';
      table.style.fontSize = '14px';
      table.style.textAlign = 'left';
      table.style.border = '1px solid #ddd';

      // Create table header
      const headerRow = document.createElement('tr');
      const columns = [
        { key: 'PROJECT_ID', label: 'Project ID' },
        { key: 'PROJECT_NAME', label: 'Project Name' },
        { key: 'DESCRIPTION', label: 'Description' },
        { key: 'TECH_STACK', label: 'Tech Stack' },
        { key: 'FACULTY_ID', label: 'Faculty ID' },
        { key: 'STATUS', label: 'Status' }
      ];

      columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.label;
        th.style.fontWeight = 'bold';
        th.style.padding = '8px';
        th.style.border = '1px solid #ddd';
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      // Create table rows
      projects.forEach(project => {
        const row = document.createElement('tr');
        columns.forEach(col => {
          const td = document.createElement('td');
          if (col.key === 'SUPERVISOR_ID') {
            // Override supervisor id with faculty id from sessionStorage
            const facultyId = sessionStorage.getItem('FACULTY_ID') || 'N/A';
            td.textContent = facultyId;
          } else {
            td.textContent = project[col.key] || 'N/A';
          }
          td.style.padding = '8px';
          td.style.border = '1px solid #ddd';
          row.appendChild(td);
        });
        table.appendChild(row);
      });

      projectsList.appendChild(table);
  } catch (error) {
    console.error('Error fetching projects:', error);
    projectsList.innerHTML = '<p>Failed to load projects.</p>';
  }
}

// New: Setup event listener for "View Available Courses" button
document.getElementById('view-available-courses-btn')?.addEventListener('click', loadAvailableCourses);

// Function to load and display available courses in a table
async function loadAvailableCourses() {
  const availableCoursesList = document.getElementById('available-courses');
  const availableCoursesListContainer = document.getElementById('available-courses-list');

  // Clear previous content
  availableCoursesList.innerHTML = '';

  try {
    const response = await fetch('http://127.0.0.1:3001/admin/getAvailableCourses');
    if (!response.ok) throw new Error('Failed to fetch available courses');

    const data = await response.json();
    const courses = data.courses || data;

    if (!courses || courses.length === 0) {
      availableCoursesList.innerHTML = '<p>No available courses found.</p>';
      return;
    }

    // Create table element
    const table = document.createElement('table');
    table.classList.add('courses-table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginTop = '10px';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';
    table.style.textAlign = 'left';
    table.style.border = '1px solid #ddd';

    // Create table header
    const headerRow = document.createElement('tr');
    const columns = [
      { key: 'COURSE_ID', label: 'Course ID' },
      { key: 'COURSE_NAME', label: 'Course Name' },
      { key: 'DESCRIPTION', label: 'Description' },
      { key: 'SYLLABUS', label: 'Syllabus' },
      { key: 'COURSE_TYPE', label: 'Course Type' },
      { key: 'BRANCH', label: 'Branch' },
      { key: 'REQUEST', label: 'Request' }
    ];

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.fontWeight = 'bold';
      th.style.padding = '8px';
      th.style.border = '1px solid #ddd';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    courses.forEach(course => {
      const row = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        if (col.key === 'REQUEST') {
          const requestButton = document.createElement('button');
          requestButton.textContent = 'Request';
          requestButton.style.padding = '5px 10px';
          requestButton.style.cursor = 'pointer';
          requestButton.addEventListener('click', () => {
            sendRequestToTeachCourse(course.COURSE_ID);
          });
          td.appendChild(requestButton);
        } else {
          td.textContent = course[col.key] || 'N/A';
        }
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    // Clear the container and append the table
    availableCoursesListContainer.innerHTML = '';
    availableCoursesListContainer.appendChild(table);

    // Show the available courses list container
    availableCoursesListContainer.style.display = 'block';

  } catch (error) {
    console.error('Error loading available courses:', error);
    availableCoursesList.innerHTML = '<p>Failed to load available courses.</p>';
  }
}

// Function to send request to teach a course
function sendRequestToTeachCourse(courseId) {
  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Authentication token missing. Please log in again.');
    return;
  }

  fetch('http://127.0.0.1:3001/faculty/requestTeachCourse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    credentials: 'include',
    body: JSON.stringify({ COURSE_ID: courseId })
  })
    .then(response => {
      if (response.ok) {
        alert('Request to teach course sent successfully.');
        fetchAndDisplayTeachCourseRequests(); // Refresh the requests list
      } else {
        throw new Error('Failed to send request.');
      }
    })
    .catch(error => {
      console.error('Error sending request:', error);
      alert('An error occurred while sending the request.');
    });
}

// New function to fetch and display teach course requests
async function fetchAndDisplayTeachCourseRequests() {
  const requestsList = document.getElementById('teach-course-requests-list');
  if (!requestsList) {
    console.warn('Element with id "teach-course-requests-list" not found.');
    return;
  }
  requestsList.innerHTML = '';

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Authentication token missing. Please log in again.');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:3001/faculty/fetchTeachCourseRequests', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch teach course requests');
    }

    const data = await response.json();
    const requests = data.requests || [];

    if (requests.length === 0) {
      requestsList.innerHTML = '<p>No teach course requests found.</p>';
      return;
    }

    // Create table element
    const table = document.createElement('table');
    table.classList.add('requests-table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginTop = '10px';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';
    table.style.textAlign = 'left';
    table.style.border = '1px solid #ddd';

    // Create table header
    const headerRow = document.createElement('tr');
    const columns = [
      { key: 'FACULTY_ID', label: 'Faculty ID' },
      { key: 'FACULTY_NAME', label: 'Faculty Name' },
      { key: 'COURSE_ID', label: 'Course ID' },
      { key: 'COURSE_NAME', label: 'Course Name' },
      { key: 'STATUS', label: 'Status' }
    ];

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.fontWeight = 'bold';
      th.style.padding = '8px';
      th.style.border = '1px solid #ddd';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    requests.forEach(request => {
      const row = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        td.textContent = request[col.key] || 'N/A';
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    requestsList.appendChild(table);
  } catch (error) {
    console.error('Error fetching teach course requests:', error);
    requestsList.innerHTML = '<p>Failed to load teach course requests.</p>';
  }
}

// New function to fetch and display assigned courses
async function fetchAndDisplayAssignedCourses() {
  const assignedCoursesList = document.getElementById('assigned-courses-list');
  if (!assignedCoursesList) {
    console.warn('Element with id "assigned-courses-list" not found.');
    return;
  }
  assignedCoursesList.innerHTML = '';

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Authentication token missing. Please log in again.');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:3001/faculty/viewAssignedCourses', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch assigned courses');
    }

    const data = await response.json();
    const courses = data.courses || [];

    if (courses.length === 0) {
      assignedCoursesList.innerHTML = '<p>No assigned courses found.</p>';
      return;
    }

    // Create table element
    const table = document.createElement('table');
    table.classList.add('assigned-courses-table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginTop = '10px';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';
    table.style.textAlign = 'left';
    table.style.border = '1px solid #ddd';

    // Create table header
    const headerRow = document.createElement('tr');
    const columns = [
      { key: 'COURSE_ID', label: 'Course ID' },
      { key: 'COURSE_NAME', label: 'Course Name' },
      { key: 'DESCRIPTION', label: 'Description' },
      { key: 'SYLLABUS', label: 'Syllabus' },
      { key: 'COURSE_TYPE', label: 'Course Type' },
      { key: 'BRANCH', label: 'Branch' }
    ];

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.fontWeight = 'bold';
      th.style.padding = '8px';
      th.style.border = '1px solid #ddd';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    courses.forEach(course => {
      const row = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        td.textContent = course[col.key] || 'N/A';
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    assignedCoursesList.appendChild(table);
  } catch (error) {
    console.error('Error fetching assigned courses:', error);
    assignedCoursesList.innerHTML = '<p>Failed to load assigned courses.</p>';
  }
}

function setupAddProjectFormHandler() {
  const addProjectForm = document.getElementById('project-form');

  addProjectForm?.addEventListener('submit', function (event) {
    event.preventDefault();

    const projectId = document.getElementById('projectId').value;
    const projectName = document.getElementById('projectName').value;
    const description = document.getElementById('description').value;
    const techStack = document.getElementById('techStack').value;
    const status = document.getElementById('projectStatus').value;

    if (!projectId || !projectName || !status) {
      alert('Please fill all required fields: Project ID, Name, and Status');
      return;
    }

    const facultyId = sessionStorage.getItem('FACULTY_ID');
    const token = sessionStorage.getItem('token'); // JWT token stored after login
    if (!facultyId) {
      alert('Faculty ID is not loaded yet. Please wait and try again.');
      return;
    }
    if (!token) {
      alert('Authentication token missing. Please log in again.');
      return;
    }

    fetch('http://127.0.0.1:3001/faculty/addProject', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      credentials: 'include',
      body: JSON.stringify({
        projectId,
        projectName,
        description,
        techStack,
        status
      })
    })
      .then(response => {
        if (response.ok) {
          alert('Project added successfully!');
          addProjectForm.reset();
          document.getElementById('add-new-project-form').style.display = 'none';
          document.getElementById('projects-list').style.display = 'block';
          fetchAndDisplayProjects('all');
        } else {
          throw new Error('Failed to add the project.');
        }
      })
      .catch(error => {
        console.error('Error adding project:', error);
        alert('An error occurred while adding the project.');
      });
  });
}

function setupProfilePhotoUpload() {
  const profileInput = document.getElementById('photo-input');
  const profilePhoto = document.getElementById('profile-photo');

  profileInput?.addEventListener('change', function () {
    const file = this.files[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profilePhoto.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }
  });
}

function setupEditProfileHandlers() {
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const editProfileForm = document.getElementById('edit-profile-form');
  const profileView = document.getElementById('profile-view');
  const saveChangesBtn = document.querySelector('#edit-profile-form button[type="submit"]');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  editProfileBtn?.addEventListener('click', function () {
    profileView.style.display = profileView.style.display === 'none' ? 'block' : 'none';
    editProfileForm.style.display = editProfileForm.style.display === 'none' ? 'block' : 'none';

    document.getElementById('edit-name').value = document.getElementById('faculty-name').textContent;
    document.getElementById('edit-email').value = document.getElementById('faculty-email').textContent;
    document.getElementById('edit-password').value = document.getElementById('faculty-password').textContent;
    document.getElementById('edit-department').value = document.getElementById('faculty-department').textContent;
    document.getElementById('edit-phone').value = document.getElementById('faculty-phone').textContent;
    document.getElementById('edit-dob').value = document.getElementById('faculty-dob').textContent;
    document.getElementById('edit-qualification').value = document.getElementById('faculty-qualification').textContent;
    document.getElementById('edit-experience').value = document.getElementById('faculty-experience').textContent;
    document.getElementById('edit-gender').value = document.getElementById('faculty-gender').textContent;
  });

  saveChangesBtn?.addEventListener('click', function (event) {
    event.preventDefault();

    const sessionUser = JSON.parse(localStorage.getItem('sessionUser') || '{}');
    const facultyId = sessionUser.FACULTY_ID || '';

    const updatedData = {
      facultyId: facultyId,
      name: document.getElementById('edit-name').value,
      email: document.getElementById('edit-email').value,
      password: document.getElementById('edit-password').value,
      department: document.getElementById('edit-department').value,
      phone: document.getElementById('edit-phone').value,
      dob: document.getElementById('edit-dob').value,
      qualification: document.getElementById('edit-qualification').value,
      experience: document.getElementById('edit-experience').value,
      gender: document.getElementById('edit-gender').value
    };

    fetch('/api/update-faculty-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update profile.');
        return response.json();
      })
      .then(data => {
        document.getElementById('faculty-name').textContent = updatedData.name;
        document.getElementById('faculty-email').textContent = updatedData.email;
        document.getElementById('faculty-password').textContent = updatedData.password;
        document.getElementById('faculty-department').textContent = updatedData.department;
        document.getElementById('faculty-phone').textContent = updatedData.phone;
        document.getElementById('faculty-dob').textContent = updatedData.dob;
        document.getElementById('faculty-qualification').textContent = updatedData.qualification;
        document.getElementById('faculty-experience').textContent = updatedData.experience;
        document.getElementById('faculty-gender').textContent = updatedData.gender;

        alert('Profile updated successfully.');
        profileView.style.display = 'block';
        editProfileForm.style.display = 'none';
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        alert('Error saving changes. Please check your database connection.');
      });
  });

  cancelEditBtn?.addEventListener('click', function () {
    profileView.style.display = 'block';
    editProfileForm.style.display = 'none';
  });
}

function hideAllSections() {
  const sections = document.querySelectorAll('.section-content');
  sections.forEach(section => {
    section.style.display = 'none';
  });

  const dashboard = document.getElementById('dashboard');
  if (dashboard) {
    dashboard.style.display = 'none';
  }
}

function showSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'block';
  }

  if (sectionId === 'dashboard') {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      dashboard.style.display = 'block';
    }
  }
}

function setActiveLink(sectionId) {
  const links = document.querySelectorAll('.sidebar-item');
  links.forEach(link => {
    if (link.getAttribute('data-target') === sectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function handleLogout() {
  const confirmed = confirm('Are you sure you want to logout?');
  if (confirmed) {
    fetch('http://localhost:3001/logout/user', { method: 'GET' })
      .catch(error => console.error('Logout error:', error));
    sessionStorage.clear();
    localStorage.removeItem('facultyName');
    localStorage.removeItem('facultyId');
    window.location.href = 'loginindex.html';
  }
}

// New function to fetch and display teach course requests
async function fetchAndDisplayTeachCourseRequests() {
  const requestsList = document.getElementById('teach-course-requests-list');
  if (!requestsList) {
    console.warn('Element with id "teach-course-requests-list" not found.');
    return;
  }
  requestsList.innerHTML = '';

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Authentication token missing. Please log in again.');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:3001/faculty/fetchTeachCourseRequests', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch teach course requests');
    }

    const data = await response.json();
    const requests = data.requests || [];

    if (requests.length === 0) {
      requestsList.innerHTML = '<p>No teach course requests found.</p>';
      return;
    }

    // Create table element
    const table = document.createElement('table');
    table.classList.add('requests-table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginTop = '10px';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';
    table.style.textAlign = 'left';
    table.style.border = '1px solid #ddd';

    // Create table header
    const headerRow = document.createElement('tr');
    const columns = [
      { key: 'FACULTY_ID', label: 'Faculty ID' },
      { key: 'FACULTY_NAME', label: 'Faculty Name' },
      { key: 'COURSE_ID', label: 'Course ID' },
      { key: 'COURSE_NAME', label: 'Course Name' },
      { key: 'STATUS', label: 'Status' }
    ];

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.fontWeight = 'bold';
      th.style.padding = '8px';
      th.style.border = '1px solid #ddd';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    requests.forEach(request => {
      const row = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        td.textContent = request[col.key] || 'N/A';
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    requestsList.appendChild(table);
  } catch (error) {
    console.error('Error fetching teach course requests:', error);
    requestsList.innerHTML = '<p>Failed to load teach course requests.</p>';
  }
}

// New function to fetch and display assigned courses
async function fetchAndDisplayAssignedCourses() {
  const assignedCoursesList = document.getElementById('assigned-courses-list');
  if (!assignedCoursesList) {
    console.warn('Element with id "assigned-courses-list" not found.');
    return;
  }
  assignedCoursesList.innerHTML = '';

  const token = sessionStorage.getItem('token');
  if (!token) {
    alert('Authentication token missing. Please log in again.');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:3001/faculty/viewAssignedCourses', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch assigned courses');
    }

    const data = await response.json();
    const courses = data.courses || [];

    if (courses.length === 0) {
      assignedCoursesList.innerHTML = '<p>No assigned courses found.</p>';
      return;
    }

    // Create table element
    const table = document.createElement('table');
    table.classList.add('assigned-courses-table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginTop = '10px';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';
    table.style.textAlign = 'left';
    table.style.border = '1px solid #ddd';

    // Create table header
    const headerRow = document.createElement('tr');
    const columns = [
      { key: 'COURSE_ID', label: 'Course ID' },
      { key: 'COURSE_NAME', label: 'Course Name' },
      { key: 'DESCRIPTION', label: 'Description' },
      { key: 'SYLLABUS', label: 'Syllabus' },
      { key: 'COURSE_TYPE', label: 'Course Type' },
      { key: 'BRANCH', label: 'Branch' }
    ];

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.fontWeight = 'bold';
      th.style.padding = '8px';
      th.style.border = '1px solid #ddd';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    courses.forEach(course => {
      const row = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        td.textContent = course[col.key] || 'N/A';
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    assignedCoursesList.appendChild(table);
  } catch (error) {
    console.error('Error fetching assigned courses:', error);
    assignedCoursesList.innerHTML = '<p>Failed to load assigned courses.</p>';
  }
}
