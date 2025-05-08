console.log("auth.js has loaded!");

document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        document.getElementById("error-message").textContent = "Please enter both fields.";
        document.getElementById("error-message").classList.remove("hidden");
        return;
    }

    // Formatting credentials
    const formBody = new URLSearchParams();
    formBody.append("username", username);
    formBody.append("password", password);

    // Sending POST request to backend login route using XHR
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/users/login", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("user_role", data.role);
                showLoggedInUser(username);
                alert("Logged in successfully!");
                window.location.href = "/"; // Redirect after successful login
            } else {
                const error = JSON.parse(xhr.responseText);
                console.error("Login error:", error);
                alert(error.detail || "Login failed.");
            }
        }
    };

    xhr.send(formBody);
});

function showLoggedInUser(username) {
    const userDisplay = document.getElementById('logged-in-user');
    if (userDisplay) {
        userDisplay.textContent = `Logged in as ${username}`;
    }
}





document.addEventListener("DOMContentLoaded", () => {
    const createAccountButton = document.getElementById("create-account-btn");

    if (!createAccountButton) {
        console.error("Create Account button NOT found!");
        return;
    }

    createAccountButton.addEventListener("click", (event) => {
        event.preventDefault();
        console.log("Create account button clicked!"); // Debugging check

        const username = document.getElementById("new-username").value.trim();
        const email = document.getElementById("new-email").value.trim();
        const password = document.getElementById("new-password").value;

        if (!username || !password || !email) {
            alert("Please fill in all fields.");
            return;
        }

        // Sending POST request to backend signup route using XHR
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8000/users/signup", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    console.log("Signup successful! Stored Role:", data.role); // Debug log

                    localStorage.setItem("access_token", data.access_token);
                    localStorage.setItem("user_role", data.role);

                    alert("Account created successfully! Redirecting...");
                    window.location.href = "/"; // Redirect after storing data
                } else {
                    const error = JSON.parse(xhr.responseText);
                    console.error("Signup Error:", error);
                    alert(error.detail || "Could not create account on the server.");
                }
            }
        };

        const requestBody = JSON.stringify({ username, email, password });
        xhr.send(requestBody);
    });
});