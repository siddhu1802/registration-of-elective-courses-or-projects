// Get student dashboard data
export async function getProfile(req, res) {
    try {
      const studentId = req.session.id;
      const profile = await getStudentProfile(studentId);
      res.json(profile);
    } catch (err) {
      console.error('Error retrieving student profile:', err);
      res.status(500).json({ error: 'Error retrieving student profile', details: err.message });
    }
}

export async function updateStudentProfile(req, res) {
    const { name, email, phone, gender, year, semester, branch, dob, password, cgpa } = req.body;
  
    if (!name || !email || !dob) {
      return res.status(400).json({ error: 'Name, email, and DOB are required' });
    }
  
    try {
      const updatedData = await updateStudentInDB(
        req.session.studentId,
        name, email, phone, gender,
        year, semester, branch, dob,
        password, cgpa
      );
  
      res.json(updatedData);
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'Error updating profile', details: err.message });
    }
}

export async function updateStudentPhoto(req, res) {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
    const photoPath = `/uploads/${req.file.filename}`;
    try {
      await updateStudentPhoto(req.session.studentId, photoPath);
      res.json({ photo: photoPath });
    } catch (err) {
      console.error('Failed to update photo:', err);
      res.status(500).json({ error: 'Failed to update photo', details: err.message });
    }
}

export async function allCourses(req, res) {
    try {
      const studentId = req.session.studentId;
      const courses = await fetchStudentCourses(studentId);
      res.json(courses);
    } catch (err) {
      console.error('Error retrieving student courses:', err);
      res.status(500).json({ error: 'Error retrieving student courses', details: err.message });
    }
  }
export async function getAllProjects(req, res) {
    try {
      const studentId = req.session.studentId;
      const projects = await fetchStudentProjects(studentId);
      res.json(projects);
    } catch (err) {
      console.error('Error retrieving student projects:', err);
      res.status(500).json({ error: 'Error retrieving student projects', details: err.message });
    }
  }
