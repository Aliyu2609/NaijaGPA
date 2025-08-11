// User storage using localStorage
const users = JSON.parse(localStorage.getItem('naijagpa_users')) || [];

// Signup functionality
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        
        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }
        
        // Check if user exists
        if (users.some(user => user.email === email)) {
            alert("User already exists with this email");
            return;
        }
        
        // Create new user (in a real app, NEVER store passwords like this)
        const newUser = {
            fullname,
            email,
            password // Note: In production, you would NEVER store plain text passwords
        };
        
        users.push(newUser);
        localStorage.setItem('naijagpa_users', JSON.stringify(users));
        alert("Account created successfully! Please login.");
        window.location.href = "login.html";
    });
}

// Login functionality
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Find user
        const user = users.find(u => u.email === email);
        
        if (!user || user.password !== password) {
            alert("Invalid email or password");
            return;
        }
        
        // Store current user session
        localStorage.setItem('naijagpa_currentUser', JSON.stringify({
            email: user.email,
            fullname: user.fullname
        }));
        
        alert(`Welcome back, ${user.fullname}!`);
        window.location.href = "index.html"; // Redirect to main page
    });
}

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('naijagpa_currentUser'));
    
    if (currentUser && window.location.pathname.includes('login.html')) {
        window.location.href = "index.html";
    }
    
    // Display user info if logged in
    if (currentUser) {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.textContent = currentUser.fullname;
            loginBtn.href = "#";
            loginBtn.style.fontWeight = "bold";
            
            // Add logout functionality
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('naijagpa_currentUser');
                window.location.reload();
            });
        }
    }
});
