console.log("auth.js has loaded!");

document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        document.getElementById("error-message").textContent = "Please enter both fields.";
        document.getElementById("error-message").classList.remove("hidden");
        return;
    }
    
     //formatting credentials
    const formBody = new URLSearchParams();
    formBody.append("username", username);
    formBody.append("password", password);

    // sending POST request to backend login route
    // calling exact route
    console.log("Sending login request with:", JSON.stringify({ username, password }));
    fetch('http://localhost:8000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody,
    })

    .then(async res => {
        if (!res.ok){
        const data = await res.json();
            throw new Error(data.detail || "Login failed");
        }
        return res.json();
    })
    // save token, update page
    .then(data => {
        localStorage.setItem("access_token", data.access_token);
        showLoggedInUser(username);
        alert("Logged in successfully!");
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_role", data.role);
        
        window.location.href = "index.html"; // Redirect after successful login
    })
    .catch(error => {
        console.error("Login error:", error);
        alert(error.message || "Login failed.");
    });
    
});

function showLoggedInUser(username) {
    const userDisplay = document.getElementById('logged-in-user');
    if (userDisplay) {
        userDisplay.textContent = `Logged in as ${username}`;
    }
}



document.addEventListener("DOMContentLoaded", () => {
  const createAccountButton = document.getElementById("create-account-button");

  if (!createAccountButton) {
      console.error("Create Account button NOT found!");
      return;
  }

  createAccountButton.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("Create account button clicked!"); // Debugging check

      const username = document.getElementById("new-username").value.trim();
      const email = document.getElementById("new-email").value.trim();
      const password = document.getElementById("new-password").value;

      if (!username || !password || !email) {
          alert("Please fill in all fields.");
          return;
      }

      try {
          const response = await fetch("http://localhost:8000/users/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, email, password })
          });

          const data = await response.json();

          if (!response.ok) {
              throw new Error(data.detail || "Signup failed.");
          }

          console.log("Signup successful! Stored Role:", data.role); // Debug log

          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("user_role", data.role);

          alert("Account created successfully! Redirecting...");
          window.location.href = "index.html"; // Redirect after storing data
      } catch (error) {
          console.error("Signup Error:", error);
          alert(error.message || "Could not create account on the server.");
      }
  });
});