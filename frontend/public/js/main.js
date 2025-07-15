
function fetchPosts() {
    fetch('http://localhost:8000/posts/')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch posts');
            return response.json();
        })
        .then(data => {
            console.log('Posts fetched:', data);
            const postsDiv = document.getElementById('posts');
            postsDiv.innerHTML = '';
            data.forEach(post => {
                console.log('Rendering post with ID:', post.id);
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.dataset.id = parseInt(post.id); // Ensure ID is numeric
                postElement.innerHTML = `
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <p><em>By ${post.author}</em></p>
                    <button class="edit-button">Edit</button>
                    <button class="delete-button">Delete</button>
                `;
                postsDiv.appendChild(postElement);
            });

            document.querySelectorAll('.edit-button').forEach(button => {
                button.addEventListener('click', function() {
                    const postId = parseInt(this.parentElement.dataset.id); // Ensure numeric
                    console.log('Edit clicked, postId:', postId, 'Type:', typeof postId);
                    console.log('Fetching URL:', `http://localhost:8000/posts/${postId}`);
                    fetch(`http://localhost:8000/posts/${postId}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    })
                        .then(response => {
                            console.log('Edit fetch response:', response.status, response.statusText);
                            if (!response.ok) {
                                throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
                            }
                            return response.json();
                        })
                        .then(post => {
                            console.log('Post loaded:', post);
                            document.getElementById('edit-id').value = post.id;
                            document.getElementById('edit-title').value = post.title;
                            document.getElementById('edit-content').value = post.content;
                            document.getElementById('edit-author').value = post.author;
                            document.getElementById('edit-post-form').style.display = 'block';
                        })
                        .catch(error => {
                            console.error('Fetch error:', error);
                            alert('Error loading post: ' + error.message);
                        });
                });
            });

            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', function() {
                    const postId = parseInt(this.parentElement.dataset.id); // Ensure numeric
                    console.log('Delete clicked, postId:', postId, 'Type:', typeof postId);
                    if (confirm('Are you sure you want to delete this post?')) {
                        fetch(`http://localhost:8000/posts/${postId}`, {
                            method: 'DELETE'
                        })
                        .then(response => {
                            console.log('Delete response:', response.status, response.statusText);
                            if (!response.ok) {
                                throw new Error(`Failed to delete post: ${response.status} ${response.statusText}`);
                            }
                            fetchPosts();
                        })
                        .catch(error => {
                            console.error('Delete error:', error);
                            alert('Error: ' + error.message);
                        });
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            alert('Error fetching posts: ' + error.message);
        });
}

document.getElementById('create-post-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const author = document.getElementById('author').value;
    fetch('http://localhost:8000/posts/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({title, content, author})
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to create post');
        return response.json();
    })
    .then(data => {
        document.getElementById('create-post-form').reset();
        fetchPosts();
    })
    .catch(error => alert('Error creating post: ' + error.message));
});

document.getElementById('edit-post-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value); // Ensure numeric
    const title = document.getElementById('edit-title').value;
    const content = document.getElementById('edit-content').value;
    const author = document.getElementById('edit-author').value;
    console.log('Submitting edit for postId:', id);
    fetch(`http://localhost:8000/posts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({title, content, author})
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update post');
        return response.json();
    })
    .then(data => {
        document.getElementById('edit-post-form').style.display = 'none';
        fetchPosts();
    })
    .catch(error => alert('Error updating post: ' + error.message));
});

document.getElementById('cancel-edit').addEventListener('click', function() {
    document.getElementById('edit-post-form').style.display = 'none';
});

fetchPosts();
