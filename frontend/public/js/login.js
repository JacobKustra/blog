document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log('Attempting login with:', username); // Check this in the console

    fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            console.log('Response status:', response.status); // Should be 200 if successful
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.detail || 'Login failed');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success! Token:', data.access_token);
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('username', data.username);
            window.location.href = '/'; // Should redirect to home page
        })
        .catch(error => {
            console.error('Login error:', error);
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = error.message; // Show error on page
            }
        });
});
const token = localStorage.getItem('token');
if (token) {
    document.getElementById('create-post-link').style.display = 'block';
    document.getElementById('logout-link').style.display = 'block';
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('signup-link').style.display = 'none';
}

const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
    logoutLink.addEventListener('click', function (event) {
        event.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login.html';
    });
}
