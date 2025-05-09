// Navigation link handlers
document.getElementById('dashboardLink').addEventListener('click', function(event) {
  event.preventDefault();
  setActiveLink('dashboardLink');
  showDashboard();
  saveLastSection('dashboardSection');
});

document.getElementById('profileLink').addEventListener('click', function(event) {
  event.preventDefault();
  setActiveLink('profileLink');
  hideAllSections();
  fetchAdminProfile();
  document.getElementById('profileSection').style.display = 'block';
  saveLastSection('profileSection');
});

document.getElementById('studentManagementLink').addEventListener('click', function(event) {
  event.preventDefault();
  setActiveLink('studentManagementLink');
  hideAllSections();
  document.getElementById('studentManagementSection').style.display = 'block';
  saveLastSection('studentManagementSection');
});

document.getElementById('facultyManagementLink').addEventListener('click', function(event) {
  event.preventDefault();
  setActiveLink('facultyManagementLink');
  hideAllSections();
  document.getElementById('facultyManagementSection').style.display = 'block';
  fetchTeachCourseRequests();
  saveLastSection('facultyManagementSection');
});

async function handleRequestAction(facultyId, courseId, action, row) {
  try {
    const response = await fetch(`http://127.0.0.1:3001/admin/teachCourseRequestAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ facultyId, courseId, action })
    });
    if (!response.ok) throw new Error('Failed to update request status');
    alert(`Request ${action.toLowerCase()} successfully.`);
    // Update status cell text
    const statusCell = row.querySelector('td:nth-child(5)');
    if (statusCell) {
      statusCell.textContent = action;
    }
    // Remove action buttons
    const actionsCell = row.querySelector('td:nth-child(6)');
    if (actionsCell) {
      actionsCell.innerHTML = '';
    }
  } catch (error) {
    console.error(`Error updating request status:`, error);
    alert('Failed to update request status.');
  }
}

async function fetchTeachCourseRequests() {
  const container = document.getElementById('facultyManagementSection');
  container.innerHTML = '<h3 class="section-title">Manage Faculty</h3><p>Loading requests...</p>';

  try {
    const response = await fetch('http://127.0.0.1:3001/admin/getTeachCourseRequests', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch teach course requests');
    const data = await response.json();
    const requests = data.requests || [];

    if (requests.length === 0) {
      container.innerHTML = '<h3 class="section-title">Manage Faculty</h3><p>No pending teach course requests.</p>';
      return;
    }

    // Create table
    const table = document.createElement('table');
    table.classList.add('requests-table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.marginTop = '10px';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';
    table.style.textAlign = 'left';
    table.style.border = '1px solid #ddd';

    // Table header
    const headerRow = document.createElement('tr');
    ['Faculty ID', 'Faculty Name', 'Course ID', 'Course Name', 'Status', 'Actions'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.style.fontWeight = 'bold';
      th.style.padding = '8px';
      th.style.border = '1px solid #ddd';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Table rows
    requests.forEach(req => {
      const row = document.createElement('tr');
      ['FACULTY_ID', 'FACULTY_NAME', 'COURSE_ID', 'COURSE_NAME'].forEach(key => {
        const td = document.createElement('td');
        td.textContent = req[key] || 'N/A';
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';
        row.appendChild(td);
      });

      // Status cell
      const statusTd = document.createElement('td');
      statusTd.textContent = req['STATUS'] || 'N/A';
      statusTd.style.padding = '8px';
      statusTd.style.border = '1px solid #ddd';
      row.appendChild(statusTd);

      // Actions cell with Approve and Reject buttons
      const actionsTd = document.createElement('td');
      actionsTd.style.padding = '8px';
      actionsTd.style.border = '1px solid #ddd';

      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Approve';
      approveBtn.style.marginRight = '5px';
      approveBtn.addEventListener('click', () => handleRequestAction(req.FACULTY_ID, req.COURSE_ID, 'APPROVED', row));

      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = 'Reject';
      rejectBtn.addEventListener('click', () => handleRequestAction(req.FACULTY_ID, req.COURSE_ID, 'REJECTED', row));

      actionsTd.appendChild(approveBtn);
      actionsTd.appendChild(rejectBtn);
      row.appendChild(actionsTd);

      table.appendChild(row);
    });

    container.innerHTML = '<h3 class="section-title">Manage Faculty</h3>';
    container.appendChild(table);
  } catch (error) {
    console.error('Error fetching teach course requests:', error);
    container.innerHTML = '<h3 class="section-title">Manage Faculty</h3><p>Failed to load teach course requests.</p>';
  }
}

document.getElementById('courseLink').addEventListener('click', function(event) {
  event.preventDefault();
  setActiveLink('courseLink');
  hideAllSections();
  document.getElementById('courseSection').style.display = 'block';
  hideCourseForm();
  fetchAndDisplayCourses(); // Fetch and display all courses on course section load
  saveLastSection('courseSection');
});

document.getElementById('projectsLink').addEventListener('click', function(event) {
  event.preventDefault();
  setActiveLink('projectsLink');
  hideAllSections();
  document.getElementById('projectsSection').style.display = 'block';
  saveLastSection('projectsSection');
});

// Logout
document.getElementById('logoutLink').addEventListener('click', function(event) {
  event.preventDefault();
  const confirmed = confirm('Are you sure you want to logout?');
  if (confirmed) {
    fetch('http://127.0.0.1:3001/logout/user');
    sessionStorage.clear();
    window.location.href = 'loginindex.html';
  }
});

// Upload photo
document.getElementById('uploadPhotoBtn').addEventListener('click', function() {
  document.getElementById('adminPhoto').click();
});

document.getElementById('adminPhoto').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('adminPhotoPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Section utilities
function hideAllSections() {
  const sections = [
    'dashboardSection',
    'profileSection',
    'studentManagementSection',
    'facultyManagementSection',
    'courseSection',
    'projectsSection'
  ];
  sections.forEach(sectionId => {
    document.getElementById(sectionId).style.display = 'none';
  });
}

async function showDashboard() {
  hideAllSections();
  document.getElementById('dashboardSection').style.display = 'block';
  updateDashboardName();

  // Fetch and display dashboard details
  const dashboardDetailsArea = document.getElementById('dashboardDetailsArea');
  dashboardDetailsArea.innerHTML = 'Loading dashboard details...';

  try {
    const response = await fetch('http://127.0.0.1:3001/admin/dashboardDetails', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch dashboard details');
    const data = await response.json();
    const details = data.adminDetails;

    // Build HTML to display admin details
    const html = `
      <ul>
        <li><strong>Admin ID:</strong> ${details.adminId || 'N/A'}</li>
        <li><strong>Username:</strong> ${details.username || 'N/A'}</li>
        <li><strong>Email:</strong> ${details.email || 'N/A'}</li>
        <li><strong>Phone Number:</strong> ${details.phoneNumber || 'N/A'}</li>
        <li><strong>Gender:</strong> ${details.gender || 'N/A'}</li>
        <li><strong>Date of Birth:</strong> ${details.dob || 'N/A'}</li>
        <li><strong>Role:</strong> ${details.role || 'N/A'}</li>
      </ul>
    `;
    dashboardDetailsArea.innerHTML = html;
  } catch (error) {
    console.error('Error loading dashboard details:', error);
    dashboardDetailsArea.innerHTML = '<p>Failed to load dashboard details.</p>';
  }
}

async function fetchAdminProfile() {
  try {
    const response = await fetch('http://127.0.0.1:3001/admin/getAdminProfile', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch');
    const adminData = await response.json();

    document.getElementById('adminName').value = adminData.name;
    document.getElementById('adminID').value = adminData.id;
    document.getElementById('adminEmail').value = adminData.email;
    document.getElementById('adminPhone').value = adminData.phone;
    document.getElementById('adminGender').value = adminData.gender;
    document.getElementById('adminDOB').value = adminData.dob;

    if (adminData.photoUrl) {
      document.getElementById('adminPhotoPreview').src = adminData.photoUrl;
    }

    localStorage.setItem('adminID', adminData.id);
    localStorage.setItem('adminName', adminData.name);

    toggleProfileFields(false);
    document.getElementById('editProfileBtn').textContent = 'Edit';
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('profileError').style.display = 'none';
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    document.getElementById('profileError').textContent = 'Failed to load admin profile.';
    document.getElementById('profileError').style.display = 'block';
  }
}

function toggleProfileFields(enabled) {
  const fields = ['adminName', 'adminEmail', 'adminPhone', 'adminGender', 'adminDOB'];
  fields.forEach(id => {
    document.getElementById(id).disabled = !enabled;
  });
}

let originalProfileData = {};

const editButton = document.getElementById('editProfileBtn');
const cancelButton = document.getElementById('cancelEditBtn');

editButton.addEventListener('click', async function() {
  const nameInput = document.getElementById('adminName');
  const emailInput = document.getElementById('adminEmail');
  const phoneInput = document.getElementById('adminPhone');
  const genderInput = document.getElementById('adminGender');
  const dobInput = document.getElementById('adminDOB');
  const photoInput = document.getElementById('adminPhoto');
  const errorBox = document.getElementById('profileError');

  if (this.textContent === 'Edit') {
    originalProfileData = {
      name: nameInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
      gender: genderInput.value,
      dob: dobInput.value
    };

    toggleProfileFields(true);
    this.textContent = 'Save';
    cancelButton.style.display = 'inline-block';
  } else {
    const updatedName = nameInput.value.trim();
    const updatedEmail = emailInput.value.trim();
    const updatedPhone = phoneInput.value.trim();
    const updatedGender = genderInput.value.trim();
    const updatedDOB = dobInput.value.trim();

    if (!updatedName || !updatedEmail || !updatedPhone || !updatedGender || !updatedDOB) {
      errorBox.textContent = 'All fields are required.';
      errorBox.style.display = 'block';
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3001/api/updateAdminProfile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedName,
          email: updatedEmail,
          phone: updatedPhone,
          gender: updatedGender,
          dob: updatedDOB
        })
      });

      if (!response.ok) throw new Error('Update failed');

      if (photoInput.files.length > 0) {
        const photoForm = new FormData();
        photoForm.append('photo', photoInput.files[0]);
        const photoRes = await fetch('http://127.0.0.1:3001/api/uploadAdminPhoto', {
          method: 'POST',
          body: photoForm
        });
        if (!photoRes.ok) throw new Error('Photo upload failed');
      }

      toggleProfileFields(false);
      this.textContent = 'Edit';
      cancelButton.style.display = 'none';
      errorBox.style.display = 'none';
      localStorage.setItem('adminName', updatedName);
      updateDashboardName();
    } catch (error) {
      console.error('Error updating profile:', error);
      errorBox.textContent = 'Failed to save changes.';
      errorBox.style.display = 'block';
    }
  }
});

cancelButton.addEventListener('click', function() {
  document.getElementById('adminName').value = originalProfileData.name;
  document.getElementById('adminEmail').value = originalProfileData.email;
  document.getElementById('adminPhone').value = originalProfileData.phone;
  document.getElementById('adminGender').value = originalProfileData.gender;
  document.getElementById('adminDOB').value = originalProfileData.dob;

  toggleProfileFields(false);
  document.getElementById('editProfileBtn').textContent = 'Edit';
  this.style.display = 'none';
  document.getElementById('profileError').style.display = 'none';
});

function updateDashboardName() {
  const adminName = localStorage.getItem('adminName');
  if (adminName) {
    document.getElementById('welcomeMessage').textContent = `Welcome, ${adminName}!`;
  }
}

function setActiveLink(linkId) {
  document.querySelectorAll('.sidebar-menu a').forEach(link => link.classList.remove('active'));
  document.getElementById(linkId)?.classList.add('active');
}

function saveLastSection(sectionId) {
  localStorage.setItem('lastSection', sectionId);
}

// Projects Section Functionality
document.getElementById('loadProjectsBtn').addEventListener('click', loadProjects);

async function loadProjects() {
  const tableArea = document.getElementById('projectsTableArea');
  const loadingMsg = document.getElementById('loadingMessage');
  const noProjectsMsg = document.getElementById('noProjectsMessage');
  const errorMsg = document.getElementById('errorMessage');

  // Reset states
  loadingMsg.style.display = 'block';
  noProjectsMsg.style.display = 'none';
  errorMsg.style.display = 'none';

  try {
    const response = await fetch('http://127.0.0.1:3001/admin/viewAllProjects');
    if (!response.ok) throw new Error('Failed to fetch projects');
    
    const data = await response.json();
    loadingMsg.style.display = 'none';

    if (!data.projects || data.projects.length === 0) {
      noProjectsMsg.style.display = 'block';
      tableArea.innerHTML = ''; // Clear any existing table
      return;
    }

    // Clear previous content
    tableArea.innerHTML = '';

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
      { key: 'SUPERVISOR_ID', label: 'Supervisor ID' },
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
    data.projects.forEach(project => {
      const row = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        td.textContent = project[col.key] || 'N/A';
        td.style.padding = '8px';
        td.style.border = '1px solid #ddd';
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    // Append the populated table to the table area
    tableArea.appendChild(table);
    
  } catch (error) {
    console.error('Error loading projects:', error);
    loadingMsg.style.display = 'none';
    errorMsg.style.display = 'block';
  }
}

// COURSE BUTTONS FUNCTIONALITY
document.getElementById('allCoursesBtn').addEventListener('click', function() {
  fetchAndDisplayCourses();
});

document.getElementById('mandatoryCoursesBtn').addEventListener('click', function() {
  fetchAndDisplayCourses('mandatory');
});

document.getElementById('electiveCoursesBtn').addEventListener('click', function() {
  fetchAndDisplayCourses('elective');
});

document.getElementById('editCoursesBtn').addEventListener('click', function() {
  fetchAndDisplayEditableCourses();
});

async function fetchAndDisplayEditableCourses() {
  const courseContentArea = document.getElementById('courseContentArea');
  courseContentArea.innerHTML = '<p>Loading courses for editing...</p>';

  try {
    const response = await fetch('http://127.0.0.1:3001/admin/getAllCourses');
    if (!response.ok) throw new Error('Failed to fetch courses');
    const data = await response.json();
    const courses = data.courses || data;

    if (courses.length === 0) {
      courseContentArea.innerHTML = '<p>No courses found.</p>';
      return;
    }

    // Create table
    const table = document.createElement('table');
    table.classList.add('course-table');

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Course ID', 'Course Name', 'Description', 'Syllabus', 'Course Type', 'Branch', 'Actions'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');

    courses.forEach(course => {
      const row = document.createElement('tr');

      // Create editable cells
const createEditableCell = (value, field) => {
  const td = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value || '';
  input.dataset.field = field;
  if (field === 'courseID') {
    input.readOnly = true;  // Make courseID input readonly
    input.style.backgroundColor = '#e9ecef'; // Optional: visually indicate readonly
    input.style.cursor = 'not-allowed';
  }
  td.appendChild(input);
  return td;
};

      row.appendChild(createEditableCell(course.COURSE_ID || course.courseID, 'courseID'));
      row.appendChild(createEditableCell(course.COURSE_NAME || course.courseName, 'courseName'));
      row.appendChild(createEditableCell(course.DESCRIPTION || course.description, 'description'));
      row.appendChild(createEditableCell(course.SYLLABUS || course.syllabus, 'syllabus'));
      row.appendChild(createEditableCell(course.COURSE_TYPE || course.courseType, 'courseType'));
      row.appendChild(createEditableCell(course.BRANCH || course.branch, 'branch'));

      // Actions cell with Save and Cancel buttons
      const actionsTd = document.createElement('td');
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';

      actionsTd.appendChild(saveBtn);
      actionsTd.appendChild(cancelBtn);
      row.appendChild(actionsTd);

      // Store original values for cancel
      const originalValues = {
        courseID: course.COURSE_ID || course.courseID,
        courseName: course.COURSE_NAME || course.courseName,
        description: course.DESCRIPTION || course.description,
        syllabus: course.SYLLABUS || course.syllabus,
        courseType: course.COURSE_TYPE || course.courseType,
        branch: course.BRANCH || course.branch
      };

      // Save button event
      saveBtn.addEventListener('click', async () => {
        const inputs = row.querySelectorAll('input');
        const updatedCourse = {};
        inputs.forEach(input => {
          updatedCourse[input.dataset.field] = input.value.trim();
        });

        // Validate required fields
        if (!updatedCourse.courseID || !updatedCourse.courseName || !updatedCourse.description || !updatedCourse.syllabus || !updatedCourse.courseType || !updatedCourse.branch) {
          alert('All fields are required.');
          return;
        }

        try {
          const res = await fetch(`http://127.0.0.1:3001/admin/updateCourse/${encodeURIComponent(updatedCourse.courseID)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseName: updatedCourse.courseName,
              description: updatedCourse.description,
              syllabus: updatedCourse.syllabus,
              courseType: updatedCourse.courseType,
              branch: updatedCourse.branch
            })
          });
          if (!res.ok) throw new Error('Failed to update course');
          alert('Course updated successfully.');
          // Update original values
          Object.assign(originalValues, updatedCourse);
          // Refresh the editable courses list to show updated data
          fetchAndDisplayEditableCourses();
        } catch (error) {
          console.error('Error updating course:', error);
          alert('Failed to update course.');
        }
      });

      // Cancel button event
      cancelBtn.addEventListener('click', () => {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
          input.value = originalValues[input.dataset.field] || '';
        });
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    courseContentArea.innerHTML = '';
    courseContentArea.appendChild(table);
  } catch (error) {
    console.error('Error fetching courses for editing:', error);
    courseContentArea.innerHTML = '<p>Failed to load courses for editing.</p>';
  }
}

// Add Course Form Toggle
document.querySelector('#courseSection .submit-btn').addEventListener('click', function() {
  document.getElementById('addCourseForm').style.display = 'block';
});

// Show only add course form when clicking "Add New Course" button
document.getElementById('addNewCourseBtn').addEventListener('click', function() {
  // Hide course list content area
  document.getElementById('courseContentArea').style.display = 'none';
  // Show add course form
  document.getElementById('addCourseForm').style.display = 'block';
});

// Cancel Course Form
document.getElementById('cancelNewCourseBtn').addEventListener('click', function() {
  hideCourseForm();
  document.getElementById('courseContentArea').style.display = 'block';
  document.getElementById('courseSection').style.display = 'block';
  setActiveLink('courseLink');
  fetchAndDisplayCourses(); // Return back to all courses after cancelling
});

// Submit New Course
document.getElementById('submitNewCourseBtn').addEventListener('click', function() {
  const courseID = document.getElementById('newCourseID').value.trim();
  const courseName = document.getElementById('newCourseName').value.trim();
  const description = document.getElementById('newDescription').value.trim();
  const syllabus = document.getElementById('newSyllabus').value.trim();
  const courseType = document.getElementById('courseType').value;
  const courseBranch = document.getElementById('courseBranch').value;
  const courseError = document.getElementById('courseError');

  if (!courseID || !courseName || !description || !syllabus || !courseType || !courseBranch) {
    courseError.textContent = 'All fields are required including course type and branch';
    courseError.style.display = 'block';
    return;
  }

    fetch('http://127.0.0.1:3001/admin/addcourse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseID,
      courseName,
      description,
      syllabus,
      courseType,
      branch: courseBranch
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'Course added successfully.') {
        alert(`Course "${courseName}" added successfully!`);
        resetCourseForm();
        hideCourseForm();
        document.getElementById('courseContentArea').style.display = 'block';
        document.getElementById('courseSection').style.display = 'block';
        setActiveLink('courseLink');
        fetchAndDisplayCourses(); // Refresh course list after adding
      } else {
        courseError.textContent = data.message || "Failed to add course.";
        courseError.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error adding course:', error);
      courseError.textContent = "Server error. Try again later.";
      courseError.style.display = 'block';
    });
});

function resetCourseForm() {
  document.getElementById('newCourseID').value = '';
  document.getElementById('newCourseName').value = '';
  document.getElementById('newDescription').value = '';
  document.getElementById('newSyllabus').value = '';
  document.getElementById('courseType').value = '';
  document.getElementById('courseBranch').value = '';  // Reset the branch field
  document.getElementById('courseError').style.display = 'none';
}

function hideCourseForm() {
  document.getElementById('addCourseForm').style.display = 'none';
}

// Fetch and display courses function
async function fetchAndDisplayCourses(courseType = '') {
  const courseContentArea = document.getElementById('courseContentArea');
  courseContentArea.innerHTML = '<p>Loading courses...</p>';

  let url = 'http://localhost:3001/admin/getAllCourses';
  if (courseType === 'mandatory') {
    url = 'http://localhost:3001/admin/getMandatoryCourses';
  } else if (courseType === 'elective') {
    url = 'http://localhost:3001/admin/getElectiveCourses';
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch courses');
    const data = await response.json();
    const courses = data.courses || data; // handle different response formats

    if (courses.length === 0) {
      courseContentArea.innerHTML = '<p>No courses found.</p>';
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

    courseContentArea.innerHTML = '';
    courseContentArea.appendChild(table);
  } catch (error) {
    console.error('Error fetching courses:', error);
    courseContentArea.innerHTML = '<p>Failed to load courses.</p>';
  }
}

// Initialize the dashboard
window.onload = function() {
  showDashboard();
  setActiveLink('dashboardLink');
  updateDashboardName();
};
