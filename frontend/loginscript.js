// Select elements
const aboutLink = document.querySelector("#about-link");
const loginBtn = document.querySelector("#login-btn");
const contactLink = document.querySelector("#contact-link");
const aboutPopup = document.querySelector(".about-popup");
const contactPopup = document.querySelector(".contact-popup");
const closeAbout = document.querySelector("#close-about");
const closeContact = document.querySelector("#close-contact");
const formPopup = document.querySelector(".form-popup");
const body = document.querySelector('body');

// Login/Signup form toggle
const loginForm = document.querySelector(".form-box.login");
const signupForm = document.querySelector(".form-box.signup");
const signupLink = document.querySelector("#signup-link");
const loginLink = document.querySelector("#login-link");

// Switch to signup form
signupLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  signupForm.style.display = "flex";
  formPopup.style.animation = "slideToCenter 0.7s ease forwards";
});

// Switch to login form
loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.style.display = "none";
  loginForm.style.display = "flex";
  formPopup.style.animation = "slideToCenter 0.7s ease forwards";
});

// Show About popup
aboutLink.addEventListener("click", (e) => {
  e.preventDefault();
  hideEverything();
  aboutPopup.classList.remove("hidden");
  aboutPopup.style.animation = "rollFromTop 0.7s ease forwards";
  setBackground("about-background");
});

// Show Contact popup
contactLink.addEventListener("click", (e) => {
  e.preventDefault();
  hideEverything();
  contactPopup.classList.remove("hidden");
  contactPopup.style.animation = "rollFromTop 0.7s ease forwards";
  setBackground("contact-background");
});

// Show Login form popup
loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  hideEverything();
  formPopup.classList.remove("hidden");
  loginForm.style.display = "flex";
  signupForm.style.display = "none";
  formPopup.style.animation = "rollFromTop 0.7s ease forwards";
  setBackground("login-background");
});

// Close About popup
closeAbout.addEventListener("click", () => {
  aboutPopup.classList.add("hidden");
  formPopup.classList.remove("hidden");
  loginForm.style.display = "flex";
  signupForm.style.display = "none";
  formPopup.style.animation = "rollFromTop 0.7s ease forwards";
  setBackground("login-background");
});

// Close Contact popup
closeContact.addEventListener("click", () => {
  contactPopup.classList.add("hidden");
  formPopup.classList.remove("hidden");
  loginForm.style.display = "flex";
  signupForm.style.display = "none";
  formPopup.style.animation = "rollFromTop 0.7s ease forwards";
  setBackground("login-background");
});

// Helper function to hide all popups
function hideEverything() {
  formPopup.classList.add("hidden");
  aboutPopup.classList.add("hidden");
  contactPopup.classList.add("hidden");
  if (loginForm) loginForm.style.display = "none";
  if (signupForm) signupForm.style.display = "none";
}

// Helper function to set body background
function setBackground(backgroundClass) {
  body.className = "";
  body.classList.add(backgroundClass);
}

// Signup form logic
const signupFormElement = document.querySelector(".form-box.signup form");
const messagePopup = document.getElementById("message-popup");
const messageText = document.getElementById("message-text");
const closeMessage = document.getElementById("close-message");

if (signupFormElement) {
  signupFormElement.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(signupFormElement);
    const data = Object.fromEntries(formData.entries());

    // Basic validation
    const { roll_number, username, email, password, role } = data;
    if (!roll_number || !username || !email || !password || !role) {
      showMessage("All fields are required!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      let result = {};

      if (res.status !== 204) {
        try {
          result = await res.json();
        } catch {
          result = { message: "No response body." };
        }
      }

      if (res.status === 200 || res.status === 204) {
        showMessage("Signup successful! You can now log in.");
        signupFormElement.reset();

        setTimeout(() => {
          if (signupForm && loginForm) {
            signupForm.style.display = "none";
            loginForm.style.display = "flex";
            formPopup.style.animation = "rollFromTop 0.7s ease forwards";
          }
          closePopup();
        }, 3000);
      } else {
        showMessage(result.message || "Signup failed.");
      }

    } catch (err) {
      console.error("❌ Signup error:", err);
      showMessage("Something went wrong. Please try again.");
    }
  });
}

// Close the popup manually by clicking "OK"
closeMessage.addEventListener("click", () => {
  closePopup();
});

// Function to show popup message
function showMessage(message) {
  messageText.textContent = message;
  messagePopup.classList.remove("hidden");
}

// Function to close message popup
function closePopup() {
  messagePopup.classList.add("hidden");
}

// ✅ ✅ ✅ LOGIN logic to verify email/password and redirect according to role
const loginFormElement = document.querySelector(".form-box.login form");

if (loginFormElement) {
  loginFormElement.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(loginFormElement);
    const data = Object.fromEntries(formData.entries());

    const { email, password } = data;

    if (!email || !password) {
      showMessage("Both email and password are required!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/user/login", { // make sure backend is running at 3001
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      console.log(result);

      // Store JWT token in sessionStorage for use in authenticated requests
      if (result.token) {
        sessionStorage.setItem('token', result.token);
      }

      sessionStorage.setItem('username', result.name);
      sessionStorage.setItem('FACULTY_ID', result.FACULTY_ID);
      console.log(sessionStorage.getItem('username'));

      if (response.ok) {
        if (result.role === "admin") {
          window.location.href = "/frontend/admindashboard.html"; // Adjust path if needed
        } else if (result.role === "faculty") {
          window.location.href = "/frontend/facultydashboard.html"; 
        } else if (result.role === "student") {
          window.location.href = "/frontend/studentdashboard.html"; 
        } else {
          showMessage("Unknown role. Cannot redirect.");
        }
      } else {
        showMessage(result.message || "Invalid email or password.");
      }

    } catch (error) {
      console.error("Login error:", error);
      showMessage("Error during login. Please try again.");
    }
  });
}
