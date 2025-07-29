// Use a relative path so it works with HTTPS and Nginx proxy
const BASE_URL = '/api';

// Fetch and render all posts (only if #posts exists)
function fetchPosts() {
    const postsDiv = document.getElementById('posts');
    if (!postsDiv) return; // Don't proceed if posts container isn't present

    fetch(`${BASE_URL}/posts/`)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch posts: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Posts fetched:', data);
            postsDiv.innerHTML = '';
            data.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.dataset.id = parseInt(post.id);
                postElement.innerHTML = `
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <p><em>By ${post.author}</em></p>
                    <button class="edit-button">Edit</button>
                    <button class="delete-button">Delete</button>
                `;
                postsDiv.appendChild(postElement);
            });
            attachEditDeleteHandlers();
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            alert('Error fetching posts: ' + error.message);
        });
}

// Attach event handlers to edit/delete buttons
function attachEditDeleteHandlers() {
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', function () {
            const postId = parseInt(this.parentElement.dataset.id);
            console.log('Edit clicked, postId:', postId);

            fetch(`${BASE_URL}/posts/${postId}`)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to fetch post ${postId}`);
                    return response.json();
                })
                .then(post => {
                    const editForm = document.getElementById('edit-post-form');
                    if (!editForm) return;

                    document.getElementById('edit-id').value = post.id;
                    document.getElementById('edit-title').value = post.title;
                    document.getElementById('edit-content').value = post.content;
                    document.getElementById('edit-author').value = post.author;
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
                    method: 'DELETE'
                })
                    .then(response => {
                        if (!response.ok) throw new Error(`Failed to delete post ${postId}`);
                        fetchPosts();
                    })
                    .catch(error => {
                        console.error('Delete error:', error);
                        alert('Error: ' + error.message);
                    });
            }
        });
    });
}

// Handle creating a new post
const createPostForm = document.getElementById('create-post-form');
if (createPostForm) {
    createPostForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const author = document.getElementById('author').value;

        fetch(`${BASE_URL}/posts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, author })
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to create post');
                return response.json();
            })
            .then(() => {
                createPostForm.reset();
                if (document.getElementById('posts')) fetchPosts(); // Refresh only if listing is present
            })
            .catch(error => alert('Error creating post: ' + error.message));
    });
}

// Handle editing an existing post
const editPostForm = document.getElementById('edit-post-form');
if (editPostForm) {
    editPostForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const id = parseInt(document.getElementById('edit-id').value);
        const title = document.getElementById('edit-title').value;
        const content = document.getElementById('edit-content').value;
        const author = document.getElementById('edit-author').value;

        fetch(`${BASE_URL}/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, author })
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to update post');
                return response.json();
            })
            .then(() => {
                editPostForm.style.display = 'none';
                if (document.getElementById('posts')) fetchPosts(); // Refresh only if listing is present
            })
            .catch(error => alert('Error updating post: ' + error.message));
    });
}

// Cancel editing
const cancelEditButton = document.getElementById('cancel-edit');
if (cancelEditButton) {
    cancelEditButton.addEventListener('click', function () {
        const editForm = document.getElementById('edit-post-form');
        if (editForm) editForm.style.display = 'none';
    });
}

// Initial load (only if posts container is present)
if (document.getElementById('posts')) {
    fetchPosts();
}

