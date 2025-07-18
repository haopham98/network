import getCSRFToken from '../app/utils.js';
import DOM from '../app/dom.js';

const PostRenderer = {
    render(username, post) {
        const postElement = DOM.create('div', 'post');
        postElement.innerHTML = `
            <div class="post-header">
                <a href="/profile/${post.author}" class="post-author">${post.author}</a> 
                <p class="post-date">${post.created_at}</p> 
            </div>
            <div class="post-body">
                <div class="post-content">${post.content}</div>
            </div>
            <div class="post-actions">
               <div class="like-info">
                    <button class="like-button" data-post-id="${post.id}">
                        ${post.liked_by_user ? '❤️': '🤍'} 
                    </button>
                    <span class="like-count" data-post-id="${post.id}">${post.like_count || 0}</span>  
                    
               </div>
                ${username && username === post.author ? `
                    <button class="edit-button" data-post-id="${post.id}">Edit</button>
                ` : ''}
               
            </div>
            <br>
        `; 
        postElement.className = 'post';
        
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
            <div class="edit-post-actions">
                <button type="submit" id="save-post-btn" class="save-post-btn" data-post-id="${post.id}">Save</button>
                <button type="button" id="cancel-edit-post" class="cancel-edit-btn">Cancel</button>
            </div>
            `;
        editForm.dataset.postId = post.id;
        return editForm;
    } 
}


export default PostRenderer;