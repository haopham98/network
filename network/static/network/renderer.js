import getCSRFToken from './utils.js';
import DOM from './dom.js';

const PostRenderer = {
    render(post) {
        const postElement = DOM.create('div', 'post');
        postElement.innerHTML = `
            <div class="post-header">
            <span class="post-author">${post.author}</span>
            <p class="post-date">${post.created_at}</p> 
            </div>
            <div class="post-body">
            <div class="post-content">${post.content}</div>
            <span class="like-info">
                Likes: <span class="like-count" data-post-id="${post.id}">${post.like_count || 0}</span>
            </span>
            </div>
            <div class="post-actions">
            
            ${post.is_authenticated ? `
                <button class="like-button" data-post-id="${post.id}">
                    ${post.liked_by_user ? 'Unlike' : 'Like'}
                </button>
                <button class="edit-button" data-post-id="${post.id}">Edit</button>
                ` : ''}
            </div>
            <br>
        `; 
        postElement.dataset.postId = post.id;
        // Need to add method handle for escapse HTML content and date formatting
        return postElement
    },
    renderEditForm(post) {
        const editForm = DOM.create('form', 'edit-post-form');
        const csrfToken = getCSRFToken();
        editForm.innerHTML = `
            <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
            <textarea id="edit-post-content" name="content">${post.content}</textarea>
            <button type="submit" id="save-post-btn" class="save-post-btn" data-post-id="${post.id}">Save</button>
            <button type="button" id="cancel-edit-post" class="cancel-edit-btn">Cancel</button>
            `;
        editForm.dataset.postId = post.id;
        return editForm;
    } 
}

export default PostRenderer;