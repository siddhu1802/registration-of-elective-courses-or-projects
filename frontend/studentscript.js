document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const sections = {
    dashboard: document.getElementById('dashboardSection'),
    profile: document.getElementById('profileSection'),
    courses: document.getElementById('electiveCoursesSection'),
    projects: document.getElementById('projectsSection')
  };

  const navLinks = {
    dashboard: document.getElementById('dashboardLink'),
    profile: document.getElementById('profileLink'),
    courses: document.getElementById('electiveCoursesLink'),
    projects: document.getElementById('projectsLink'),
    logout: document.getElementById('logoutLink')
  };

  const courseButtons = {
    all: document.getElementById('allCoursesBtn'),
    mandatory: document.getElementById('mandatoryCoursesBtn'),
    applied: document.getElementById('appliedCoursesBtn'),
    myCourses: document.getElementById('myCoursesBtn') // Added new button
  };

  const editBtn = document.getElementById('editProfileBtn');
  const editForm = document.getElementById('editProfileForm');
  const nameSpan = document.getElementById('studentName');
  const idSpan = document.getElementById('studentID');
  const emailSpan = document.getElementById('studentEmail');
  const nameInput = document.getElementById('editNameInput');
  const emailInput = document.getElementById('editEmailInput');
  const saveBtn = document.getElementById('saveProfileBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');

  const phoneSpan = document.getElementById('studentPhone');
  const genderSpan = document.getElementById('studentGender');
  const yearSpan = document.getElementById('studentYear');
  const semesterSpan = document.getElementById('studentSemester');
  const branchSpan = document.getElementById('studentBranch');
  const dobSpan = document.getElementById('studentDOB');
  const passwordSpan = document.getElementById('studentPassword');
  const cgpaSpan = document.getElementById('studentCGPA');

  const phoneInput = document.getElementById('editPhoneInput');
  const genderInput = document.getElementById('editGenderInput');
  const yearInput = document.getElementById('editYearInput');
  const semesterInput = document.getElementById('editSemesterInput');
  const branchInput = document.getElementById('editBranchInput');
  const dobInput = document.getElementById('editDOBInput');
  const passwordInput = document.getElementById('editPasswordInput');
  const cgpaInput = document.getElementById('editCGPAInput');

  const photoElement = document.getElementById('studentPhoto');
  const photoInput = document.getElementById('photoInput');
  const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
  const changePhotoInput = document.getElementById('changePhotoInput');

  let studentDataGlobal = {};

  async function initDashboard() {
    try {
      const studentData = await fetchStudentData();
      studentDataGlobal = studentData;
      updateDashboardUI(studentData);
      updateProfileUI(studentData);
      setupNavigation();
      setupCourseButtons(studentData);
      setupEditProfile(studentData);
      setupPhotoUpload();
      showSection('dashboard');
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      alert('Failed to load dashboard data. Please try again later.');
    }
  }

  async function fetchStudentData() {
    try {
      const response = await fetch('/api/student-data');
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      return {};
    }
  }

  function updateDashboardUI(studentData) {
    const username = sessionStorage.getItem('username') || 
                    studentData.name || 
                    'Student';
    document.getElementById('welcomeMessage').textContent = `Welcome, ${username}!`;
    nameSpan.textContent = studentData.name || 'Not available';
    idSpan.textContent = studentData.id || 'Not available';
    emailSpan.textContent = studentData.email || 'Not available';
    loadProjects(studentData.projects || []);
  }

  function updateProfileUI(studentData) {
    idSpan.textContent = studentData.id || 'N/A';
    nameSpan.textContent = studentData.name || 'N/A';
    emailSpan.textContent = studentData.email || 'N/A';
    phoneSpan.textContent = studentData.phone || 'N/A';
    genderSpan.textContent = studentData.gender || 'N/A';
    yearSpan.textContent = studentData.year || 'N/A';
    semesterSpan.textContent = studentData.semester || 'N/A';
    branchSpan.textContent = studentData.branch || 'N/A';
    dobSpan.textContent = studentData.dob || 'N/A';
    passwordSpan.textContent = studentData.password || 'N/A';
    cgpaSpan.textContent = studentData.cgpa || 'N/A';

    if (photoElement && studentData.photo) {
      photoElement.src = studentData.photo;
    } else if (photoElement) {
      photoElement.src = 'default-avatar.png';
    }
  }

  function showSection(sectionName) {
    Object.values(sections).forEach(section => {
      section.style.display = 'none';
    });
    sections[sectionName].style.display = 'block';
    Object.values(navLinks).forEach(link => link.classList.remove('active'));
    navLinks[sectionName].classList.add('active');
  }

  function setupNavigation() {
    navLinks.dashboard.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('dashboard');
    });

    navLinks.profile.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('profile');
    });

    navLinks.courses.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('courses');
    });

    navLinks.projects.addEventListener('click', async (e) => {
      e.preventDefault();
      showSection('projects');
      try {
        const response = await fetch('http://localhost:3001/faculty/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        const projects = data.projects || [];
        loadProjects(projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        alert('Failed to load projects.');
      }
    });

    navLinks.logout.addEventListener('click', (e) => {
      e.preventDefault();
      const confirmed = confirm('Are you sure you want to logout?');
      if (confirmed) {
        fetch('http://localhost:3001/logout/user');
        sessionStorage.clear();
        window.location.href = 'loginindex.html';
      }
    });
  }

  function setupCourseButtons(studentData) {
    courseButtons.all.addEventListener('click', async () => {
      try {
        const response = await fetch('http://localhost:3001/admin/getAllCourses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        const courses = data.courses || [];
        renderCoursesTable('All Available Courses', courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        alert('Failed to load courses.');
      }
    });

    courseButtons.mandatory.addEventListener('click', async () => {
      try {
        const response = await fetch('http://localhost:3001/admin/getMandatoryCourses');
        if (!response.ok) throw new Error('Failed to fetch mandatory courses');
        const data = await response.json();
        const courses = data.courses || [];
        renderCoursesTable('Mandatory Courses', courses);
      } catch (error) {
        console.error('Error fetching mandatory courses:', error);
        alert('Failed to load mandatory courses.');
      }
    });

    courseButtons.applied.addEventListener('click', async () => {
      try {
        const response = await fetch('http://localhost:3001/admin/getElectiveCourses');
        if (!response.ok) throw new Error('Failed to fetch elective courses');
        const data = await response.json();
        const courses = data.courses || [];
        renderCoursesTable('Elective Courses', courses);
      } catch (error) {
        console.error('Error fetching elective courses:', error);
        alert('Failed to load elective courses.');
      }
    });

    if (courseButtons.myCourses) {
      courseButtons.myCourses.addEventListener('click', async () => {
        try {
          const response = await fetch('http://localhost:3001/admin/getMandatoryCourses');
          if (!response.ok) throw new Error('Failed to fetch mandatory courses');
          const data = await response.json();
          const courses = data.courses || [];
          renderCoursesTable('My Courses (Mandatory Courses)', courses);
        } catch (error) {
          console.error('Error fetching mandatory courses for My Courses:', error);
          alert('Failed to load mandatory courses for My Courses.');
        }
      });
    }
  }

function renderCoursesTable(title, courses) {
    const coursesSection = sections.courses;
    const coursesTableContainer = document.getElementById('coursesTableContainer');
    coursesSection.style.display = 'block';
    coursesTableContainer.innerHTML = `<h2>${title}</h2>`;

    if (courses.length === 0) {
      coursesTableContainer.innerHTML += '<p>No courses found.</p>';
      return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.border = '1';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    // Add "Request" column header
    const headers = ['Course ID', 'Course Name', 'Description', 'Syllabus', 'Course Type', 'Branch', 'Request'];

    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.border = '1px solid black';
      th.style.padding = '8px';
      th.style.backgroundColor = '#f2f2f2';
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    courses.forEach(course => {
      const row = document.createElement('tr');

      const courseIdCell = document.createElement('td');
      courseIdCell.textContent = course.COURSE_ID || course.courseID || '';
      courseIdCell.style.border = '1px solid black';
      courseIdCell.style.padding = '8px';
      row.appendChild(courseIdCell);

      const courseNameCell = document.createElement('td');
      courseNameCell.textContent = course.COURSE_NAME || course.courseName || '';
      courseNameCell.style.border = '1px solid black';
      courseNameCell.style.padding = '8px';
      row.appendChild(courseNameCell);

      const descriptionCell = document.createElement('td');
      descriptionCell.textContent = course.DESCRIPTION || course.description || '';
      descriptionCell.style.border = '1px solid black';
      descriptionCell.style.padding = '8px';
      row.appendChild(descriptionCell);

      const syllabusCell = document.createElement('td');
      syllabusCell.textContent = course.SYLLABUS || course.syllabus || '';
      syllabusCell.style.border = '1px solid black';
      syllabusCell.style.padding = '8px';
      row.appendChild(syllabusCell);

      const courseTypeCell = document.createElement('td');
      courseTypeCell.textContent = course.COURSE_TYPE || course.courseType || '';
      courseTypeCell.style.border = '1px solid black';
      courseTypeCell.style.padding = '8px';
      row.appendChild(courseTypeCell);

      const branchCell = document.createElement('td');
      branchCell.textContent = course.BRANCH || course.branch || '';
      branchCell.style.border = '1px solid black';
      branchCell.style.padding = '8px';
      row.appendChild(branchCell);

      // Add "Request" button cell
      const requestCell = document.createElement('td');
      requestCell.style.border = '1px solid black';
      requestCell.style.padding = '8px';
      const requestButton = document.createElement('button');
      requestButton.textContent = 'Request';
      requestButton.style.cursor = 'pointer';
      // Placeholder click handler for request button
      requestButton.addEventListener('click', () => {
        alert(`Request sent for course: ${course.COURSE_NAME || course.courseName || ''}`);
      });
      requestCell.appendChild(requestButton);
      row.appendChild(requestCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    coursesTableContainer.appendChild(table);
  }

  function displayCourses(title, courses) {
    if (courses.length === 0) {
      alert(`No ${title.toLowerCase()} found.`);
      return;
    }
    alert(`${title}:\n${courses.join('\n')}`);
  }

  function loadProjects(projects) {
    const projectsList = document.getElementById('projectsListContainer');
    projectsList.innerHTML = '';

    // Add heading above the projects table
    const heading = document.createElement('h2');
    heading.textContent = "Available Projects"; // Updated heading
    projectsList.appendChild(heading);

    if (projects.length === 0) {
      projectsList.innerHTML += '<p>No projects available</p>';
      return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.border = '1';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    // Updated headers to match desired columns plus "Request"
    const headers = ['Project ID', 'Project Name', 'Description', 'Tech Stack', 'Faculty ID', 'Status', 'Request'];

    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.border = '1px solid black';
      th.style.padding = '8px';
      th.style.backgroundColor = '#f2f2f2';
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    projects.forEach(project => {
      const row = document.createElement('tr');

      const projectIdCell = document.createElement('td');
      projectIdCell.textContent = project.PROJECT_ID || project.projectID || '';
      projectIdCell.style.border = '1px solid black';
      projectIdCell.style.padding = '8px';
      row.appendChild(projectIdCell);

      const projectNameCell = document.createElement('td');
      projectNameCell.textContent = project.PROJECT_NAME || project.projectName || '';
      projectNameCell.style.border = '1px solid black';
      projectNameCell.style.padding = '8px';
      row.appendChild(projectNameCell);

      const descriptionCell = document.createElement('td');
      descriptionCell.textContent = project.DESCRIPTION || project.description || '';
      descriptionCell.style.border = '1px solid black';
      descriptionCell.style.padding = '8px';
      row.appendChild(descriptionCell);

      const techStackCell = document.createElement('td');
      techStackCell.textContent = project.TECH_STACK || project.techStack || '';
      techStackCell.style.border = '1px solid black';
      techStackCell.style.padding = '8px';
      row.appendChild(techStackCell);

      const facultyIdCell = document.createElement('td');
      facultyIdCell.textContent = project.FACULTY_ID || project.facultyID || '';
      facultyIdCell.style.border = '1px solid black';
      facultyIdCell.style.padding = '8px';
      row.appendChild(facultyIdCell);

      const statusCell = document.createElement('td');
      statusCell.textContent = project.STATUS || project.status || '';
      statusCell.style.border = '1px solid black';
      statusCell.style.padding = '8px';
      row.appendChild(statusCell);

      // Add "Request" button cell
      const requestCell = document.createElement('td');
      requestCell.style.border = '1px solid black';
      requestCell.style.padding = '8px';
      const requestButton = document.createElement('button');
      requestButton.textContent = 'Request';
      requestButton.style.cursor = 'pointer';
      // Placeholder click handler for request button
      requestButton.addEventListener('click', () => {
        alert(`Request sent for project: ${project.PROJECT_NAME || project.projectName || ''}`);
      });
      requestCell.appendChild(requestButton);
      row.appendChild(requestCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    projectsList.appendChild(table);
  }

  function setupEditProfile(studentData) {
    editBtn.addEventListener('click', () => {
      editForm.style.display = 'block';
      nameInput.value = studentData.name || '';
      emailInput.value = studentData.email || '';
      phoneInput.value = studentData.phone || '';
      genderInput.value = studentData.gender || '';
      yearInput.value = studentData.year || '';
      semesterInput.value = studentData.semester || '';
      branchInput.value = studentData.branch || '';
      dobInput.value = studentData.dob || '';
      passwordInput.value = studentData.password || '';
      cgpaInput.value = studentData.cgpa || '';
    });

    cancelBtn.addEventListener('click', () => {
      editForm.style.display = 'none';
    });

    saveBtn.addEventListener('click', async () => {
      const updatedData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        gender: genderInput.value,
        year: yearInput.value,
        semester: semesterInput.value,
        branch: branchInput.value.trim(),
        dob: dobInput.value,
        password: passwordInput.value,
        cgpa: cgpaInput.value
      };

      if (!updatedData.name || !updatedData.email) {
        alert('Name and Email cannot be empty.');
        return;
      }

      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(updatedData.email)) {
        alert('Please enter a valid email address.');
        return;
      }

      try {
        const response = await fetch('/api/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });

        if (!response.ok) throw new Error('Update failed');

        Object.assign(studentDataGlobal, updatedData);
        updateProfileUI(studentDataGlobal);
        document.getElementById('welcomeMessage').textContent = `Hello, ${updatedData.name}!`;
        editForm.style.display = 'none';
        alert('Profile updated successfully!');
      } catch (err) {
        console.error('Error updating profile:', err);
        alert('Failed to update profile.');
      }
    });
  }

  function setupPhotoUpload() {
    uploadPhotoBtn.addEventListener('click', () => {
      changePhotoInput.click();
    });

    changePhotoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) {
        alert('Please select a photo.');
        return;
      }

      const formData = new FormData();
      formData.append('photo', file);

      try {
        const res = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        if (photoElement) {
          photoElement.src = data.photo;
        }
        alert('Photo updated successfully!');
      } catch (err) {
        console.error('Upload error:', err);
        alert('Error uploading photo');
      }
    });
  }

  initDashboard();
});
