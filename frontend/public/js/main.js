const BASE_URL = '/api';
const MAX_PREVIEW_LENGTH = 200; // Character limit for preview

const token = localStorage.getItem('token');
if (token) {
    document.getElementById('create-post-link').style.display = 'block';
    document.getElementById('logout-link').style.display = 'block';
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('signup-link').style.display = 'none';
}

function sanitizeHTML(str) {
    const div = document.createElement('div');
    // Split by newlines and filter out empty strings
    const paragraphs = str.split('\n').filter(p => p.trim() !== '');
    // Wrap each paragraph in <p> tags after escaping
    return paragraphs
        .map(p => {
            div.textContent = p.trim();
            return `<p>${div.innerHTML}</p>`;
        })
        .join('');
}

function handleFetchResponse(response) {
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        alert('Session expired. Please log in again.');
        window.location.href = '/login.html';
        throw new Error('Unauthorized');
    }
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
}

function fetchPosts() {
    const postsDiv = document.getElementById('posts');
    if (!postsDiv) return;

    fetch(`${BASE_URL}/posts/`)
        .then(handleFetchResponse)
        .then(data => {
            console.log('Posts fetched:', data);
            postsDiv.innerHTML = '';
            // Reverse posts to show newest first (assuming no backend sorting)
            data.forEach(post => {
                const isLongPost = post.content.length > MAX_PREVIEW_LENGTH;
                const previewContent = isLongPost 
                    ? sanitizeHTML(post.content.substring(0, MAX_PREVIEW_LENGTH)) + '<p>...</p>'
                    : sanitizeHTML(post.content);
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.dataset.id = parseInt(post.id);
                postElement.innerHTML = `
                    <h2>${sanitizeHTML(post.title)}</h2>
                    <div class="post-content ${isLongPost ? 'truncated' : ''}">${previewContent}</div>
                    ${isLongPost ? '<button class="read-more">Read more</button>' : ''}
                    <p><em>By ${sanitizeHTML(post.author)}</em></p>
                    ${post.author === localStorage.getItem('username') ? '<button class="edit-button">Edit</button><button class="delete-button">Delete</button>' : ''}
                `;
                postsDiv.appendChild(postElement);
            });
            attachEditDeleteHandlers();
            attachReadMoreHandlers();
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            alert('Error fetching posts: ' + error.message);
        });
}

function attachEditDeleteHandlers() {
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', function () {
            const postId = parseInt(this.parentElement.dataset.id);
            console.log('Edit clicked, postId:', postId);

            fetch(`${BASE_URL}/posts/${postId}`)
                .then(handleFetchResponse)
                .then(post => {
                    const editForm = document.getElementById('edit-post-form');
                    if (!editForm) return;

                    document.getElementById('edit-id').value = post.id;
                    document.getElementById('edit-title').value = post.title;
                    document.getElementById('edit-content').value = post.content;
                    editForm.style.display = 'block';
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                    alert('Error loading post: ' + error.message);
                });
        });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function () {
            const postId = parseInt(this.parentElement.dataset.id);
            if (confirm('Are you sure you want to delete this post?')) {
                fetch(`${BASE_URL}/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(handleFetchResponse)
                    .then(() => fetchPosts())
                    .catch(error => {
                        console.error('Delete error:', error);
                        alert('Error: ' + error.message);
                    });
            }
        });
    });
}

function attachReadMoreHandlers() {
    document.querySelectorAll('.read-more').forEach(button => {
        button.addEventListener('click', function () {
            const contentDiv = this.previousElementSibling;
            const postId = parseInt(this.parentElement.dataset.id);
            if (contentDiv.classList.contains('truncated')) {
                // Fetch full content
                fetch(`${BASE_URL}/posts/${postId}`)
                    .then(handleFetchResponse)
                    .then(post => {
                        contentDiv.innerHTML = sanitizeHTML(post.content);
                        contentDiv.classList.remove('truncated');
                        contentDiv.classList.add('expanded');
                        this.textContent = 'Read less';
                    })
                    .catch(error => {
                        console.error('Error fetching full post:', error);
                        alert('Error loading post: ' + error.message);
                    });
            } else {
                // Truncate content again
                fetch(`${BASE_URL}/posts/${postId}`)
                    .then(handleFetchResponse)
                    .then(post => {
                        contentDiv.innerHTML = sanitizeHTML(post.content.substring(0, MAX_PREVIEW_LENGTH)) + '<p>...</p>';
                        contentDiv.classList.add('truncated');
                        contentDiv.classList.remove('expanded');
                        this.textContent = 'Read more';
                    })
                    .catch(error => {
                        console.error('Error fetching post:', error);
                        alert('Error loading post: ' + error.message);
                    });
            }
        });
    });
}

const createPostForm = document.getElementById('create-post-form');
if (createPostForm) {
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    if (!titleInput || !contentInput) {
        console.error('Create post form inputs not found:', { title: !!titleInput, content: !!contentInput });
    } else {
        createPostForm.addEventListener('submit', function (event) {
            event.preventDefault();
            console.log('Create post form submitted');
            const title = titleInput.value;
            const content = contentInput.value;

            if (!token) {
                alert('You must be logged in to create a post.');
                window.location.href = '/login.html';
                return;
            }

            fetch(`${BASE_URL}/posts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            })
                .then(handleFetchResponse)
                .then(() => {
                    createPostForm.reset();
                    alert('Post created successfully!');
                    window.location.href = '/';
                })
                .catch(error => {
                    console.error('Error creating post:', error);
                    alert('Error creating post: ' + error.message);
                });
        });
    }
}

const editPostForm = document.getElementById('edit-post-form');
if (editPostForm) {
    editPostForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const id = parseInt(document.getElementById('edit-id').value);
        const title = document.getElementById('edit-title').value;
        const content = document.getElementById('edit-content').value;

        fetch(`${BASE_URL}/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, content })
        })
            .then(handleFetchResponse)
            .then(() => {
                editPostForm.style.display = 'none';
                if (document.getElementById('posts')) fetchPosts();
            })
            .catch(error => alert('Error updating post: ' + error.message));
    });
}

const cancelEditButton = document.getElementById('cancel-edit');
if (cancelEditButton) {
    cancelEditButton.addEventListener('click', function () {
        const editForm = document.getElementById('edit-post-form');
        if (editForm) editForm.style.display = 'none';
    });
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

if (document.getElementById('posts')) {
    fetchPosts();
}
