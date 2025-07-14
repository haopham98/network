import API from '../app/api.js';
import DOM from '../app/dom.js';
import PostRenderer from './renderer.js';
import UIUpdater from '../app/uiUpdater.js';



class PostApp {
    constructor() {

        this.postsContainer = DOM.get('#posts-container');
        this.createPostForm = DOM.get('#create-post-form');
        this.createPostInput = DOM.get('#post-content');
        this.createPostButton = DOM.get('#post-btn');
        this.currentPage = 1;
        this.setupEventListeners();
        this.init();
        
    }

    init() {
        this.loadPosts()
    }

    setupEventListeners() {
        if(this.createPostForm) {
            this.createPostForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePostSubmission(e)
            })
        }

        document.addEventListener('click', async (e) => {
            
            if (e.target.classList.contains('like-button')) {
                e.preventDefault();
                await this.handleLikeToggle(e);
            }

            if (e.target.classList.contains('edit-button')) {
                e.preventDefault();
                this.handleEditPost(e);
            }

            if (e.target.classList.contains('save-post-btn')) {
                console.log('Save post button clicked');
                e.preventDefault();
                await this.handleSavePost(e);
            }
            if (e.target.classList.contains('cancel-edit-btn')) {
                e.preventDefault();
                const postId = e.target.closest('.edit-post-form').dataset.postId;
                if (!postId) {
                    console.error('Post ID not found');
                    return;
                }
                await this.loadPosts(this.currentPage);
            }
        })
        
    }
    // Handle save button click in edit form
    async handleSavePost(e) {
        e.preventDefault();

        const postId = e.target.dataset.postId;
        const new_content = DOM.get('#edit-post-content').value.trim();
        if (!postId || !new_content) {
            console.error('Post ID or content not found');
            return;
        }
        try {
            const response = await API.request(`/edit_post/${postId}`, {
                method: 'PUT',
                body: JSON.stringify({ content: new_content })
            })

            if (response.error) {
                console.error('Error updating post: ', response.error);
                return;
            }
            await this.loadPosts(this.currentPage);
        }
        catch (error) {
            console.error('Failed to update post: ', error);

            if (error.status === 403 || error.status === 401){
                alert('You must be logged in to edit a post');
            }
        }

    }


    // Event handle for edit button click
    async handleEditPost(e) {
        e.preventDefault();
        const postId = e.target.dataset.postId;

        if (!postId) {
            console.error('Post ID not found');
            return;
        }
        try {
            const post = await API.request(`/posts/${postId}`, {
                method: 'GET'
            })
            const editForm = PostRenderer.renderEditForm({id: post.id, content: post.content});
            const postElement = DOM.get(`.post[data-post-id="${postId}"]`);

            if (!postElement) {
                console.error('Post element not found');
                return;
            }
            postElement.innerHTML = '';
            DOM.append(postElement, editForm);
        }
        catch (error) {
            console.error('Failed to load post for editing: ', error);
        }
        

    }


    // Event handler for like button toggle
    async handleLikeToggle(e) {
        e.preventDefault();

        const postId = e.target.dataset.postId;
        if (!postId) {
            console.error('Post ID not found');
            return;
        }
        try {
            const response = await API.request(`/like/${postId}`, {
                method: 'POST',
                body: JSON.stringify({
                    post_id: postId
                })
            });
            console.log('API response status:', response);

            if (response.error) {
                console.error('Error toggling like: ', response.error);
                return;
            }
            console.log('Like toggled successfully:', response);
            // Update the UI based on the response
            const liked = response.liked_by_user;
            const likeCount = response.like_count;

            UIUpdater.updateLikeButton(postId, liked);
            UIUpdater.updateLikeCount(postId, likeCount);
            
        }
        catch (error) {
            // Check error 403 caused by user not logged in, then show alert and send them to login page
            if (error.status === 403 || error.status === 401){
                alert('You must be logged in to like a post');
                window.location.href = '/login';
            }
        }

    }

    async handlePostSubmission(e) {
        e.preventDefault();

        const content = this.createPostInput.value.trim();
        if (!content) {
            console.error('Post content cannot be empty');
            return;
        }

        try {
            const response = await API.request('/create_post', {
                method: 'POST',
                body: JSON.stringify({ content })
            })
            if (response.error) {
                console.error('Error creating post: ', response.error);
                return;
            }
            else {
                this.createPostInput.value = '';
                await this.loadPosts();
            }
        }
        catch (error) {
            console.error('Failed to create post: ', error);
        }
    }

    renderPagination(currentPage, totalPages) {
        const paginationControls = DOM.get('#pagination-controls');
        if (!paginationControls) {
            console.error('Pagination Controls not found');
            return;
        }
        
        DOM.clear(paginationControls);

        if (totalPages <= 1) return;


        if (currentPage > 1) {
            const prevButton = DOM.create('button', 'btn btn-primary', 'Previous');
            prevButton.addEventListener('click', () => {
                this.loadPosts(currentPage - 1);
            })
            DOM.append(paginationControls, prevButton);
            
        }

        for (let page=1; page <= totalPages; page++) {
            const pageButton = DOM.create('button', 'btn btn-primary', page);

            pageButton.dataset.page = page;

            if (page === currentPage) {
                pageButton.classList.add('btn-primary');
            }
            else {
                pageButton.classList.add('btn-secondary');
            }

            pageButton.addEventListener('click', () => {
                this.loadPosts(page);
            })

            DOM.append(paginationControls, pageButton);
        }

        if (currentPage < totalPages) {
            const nextButton = DOM.create('button', 'btn btn-primary', 'Next');
            nextButton.addEventListener('click', () => {
                this.loadPosts(currentPage + 1);
            })
            DOM.append(paginationControls, nextButton);
        }
    }

    async loadPosts(page) {
        if (!this.postsContainer) {
            console.error('Posts container not found');
            return;
        }
        const url = page ? `/posts?page=${page}` : '/posts';
        console.log('Loading posts from: ', url);
        try {
            const res = await API.request(url);

            if (!res || !Array.isArray(res.posts)) {
                throw new Error('Invalid response format');
            }

            DOM.clear(this.postsContainer);
            let is_authenticated = res.is_authenticated || false;
            res.posts.forEach(post => {
                // append is_authenticated to post object
                post.is_authenticated = is_authenticated;
                const postElement = PostRenderer.render(post);
                DOM.append(this.postsContainer, postElement);                       
            });
            this.currentPage = res.page.number || 1;
            this.renderPagination(res.page.number, res.page.total_pages);
            
        }
        catch (error) {
            console.error('Failed to load posts: ', error);
        }

    }

}

export default PostApp;
