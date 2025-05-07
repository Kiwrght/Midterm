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

// document.addEventListener("DOMContentLoaded", () => {
//     document.getElementById("Login Form").addEventListener("click", function () {
        
//         // getting user input from login
//         console.log("Sign In button clicked");
//         const username = document.getElementById('username').value.trim();
//         const password = document.getElementById('password').value;

//         // validating input
//         if (!username || !password) {
//             alert("Please enter both username and password.");
//             return;
//         }

//         // formatting credentials
//         const formBody = new URLSearchParams();
//         formBody.append("username", username);
//         formBody.append("password", password);

//         // sending POST request to backend login route
//         // calling exact route
//         console.log("Sending login request with:", JSON.stringify({ username, password }));
//         fetch('http://localhost:8000/users/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//             body: formBody,
//         })
    
//         .then(async res => {
//             if (!res.ok){
//             const data = await res.json();
//                 throw new Error(data.detail || "Login failed");
//             }
//             return res.json();
//         })
//         // save token, update page
//         .then(data => {
//             localStorage.setItem("access_token", data.access_token);
//             showLoggedInUser(username);
//             alert("Logged in successfully!");

//             // Hide the modal after successful login
//             const modalEl = document.getElementById('signInModal');
//             const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
//             modal.hide();
//             getBooks(); // Reload books after login

//             //make the sign out button visible
//             document.getElementById("sign-out-btn").style.display = "block";

//             //if user is admin, show admin panel
//             if (data.role === "admin") {
//                 const adminDropdown = document.getElementById("adminDropdown").parentElement;
//                 adminDropdown.style.display = "block"; // Show dropdown for admins
//             }
    

            
        
//         })
  

//         // Trying something 
//         .catch(error => {
//             console.error("Logout failed:", error);
//             alert("Logout failed. Please try again.");
//         });

//         // show user has logged in
//         function showLoggedInUser(username) {
//         const userDisplay = document.getElementById('logged-in-user');
//         userDisplay.textContent = `Logged in as ${username}`;
        
//         }        
//     });
// });

document.getElementById("signup-btn").addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("Signup button clicked!");

  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value;

  try {
      const response = await fetch("http://localhost:8000/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error("Signup failed. Please try again.");
      }

      //  Store token & role in Local Storage **BEFORE** the page refreshes
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_role", data.role);

      console.log("Signup successful! Stored Role:", localStorage.getItem("user_role"));

      alert("Account created successfully! Redirecting...");
      window.location.href = "index.html"; // Redirect AFTER storing data
  } catch (error) {
      console.error("Signup Error:", error);
      alert(error.message || "Error creating account.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("create-account-button").addEventListener("click", function () {
        console.log("Create account button clicked");

        // getting user input from signup
      const username = document.getElementById('new-username').value.trim();
      const email = document.getElementById('new-email').value.trim();
      const password = document.getElementById('new-password').value;
        
      // validating input
      if (!username || !password || !email) {
        alert("Please fill in all fields.");
        return;
      }
  
    //   const formBody = new URLSearchParams();
    //   formBody.append("username", username);
    //   formBody.append("password", password);
    
    // Debugging output of user input
    console.log("Sending request payload:", JSON.stringify({
        username: username,
        email: email,
        password: password,
    }));
      
      // create account
      fetch('http://localhost:8000/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password,
          })
      })
      .then(async res => {
        if (!res.ok){
        return res.json().then(data => {
            throw new Error(data.detail || "Registration failed");
          } );
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_role", data.role);  
        showLoggedInUser(username);

        console.log("Stored token:", localStorage.getItem("access_token"));
        console.log("Stored role:", localStorage.getItem("user_role"));

        
        // alert("Account created successfully! You can now log in.");
        // alert("Button clicked, trying to close modal");
        document.getElementById("success-message").textContent = "Account created! Please log in.";
        document.getElementById("success-message").classList.remove("hidden");
        //rerouting to index page
       
        window.location.href = "index.html"; // Redirect after successful signup
 

    })
      .catch(error => {
        console.error("Registration error: ",error);
        alert(error.message || "Could not create account on the server.");
      });  
    }); 
});