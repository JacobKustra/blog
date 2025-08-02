document.getElementById('signup-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    const errorDiv = document.getElementById('error');
    if (password !== password2) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Passwords do not match';
        return;
    }

    fetch('/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            console.log('Signup response status:', response.status);
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.detail || 'Signup failed');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Signup success:', data);
            errorDiv.style.display = 'none';
            alert('Signup successful! Please login.');
            window.location.href = '/login.html';
        })
        .catch(error => {
            console.error('Signup error:', error);
            errorDiv.style.display = 'block';
            errorDiv.textContent = error.message;
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
