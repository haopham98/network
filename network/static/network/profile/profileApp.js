import DOM from '../app/dom.js';
import PostRenderer from '../posts/renderer.js';
import API from '../app/api.js';
import { profileHeaderRenderer } from './profileRenderer.js';
import UIUpdater from '../app/uiUpdater.js';


export class ProfileApp {
    constructor(username) {
        this.username = username;
        this.currentPage = 1;
        this.profileHeader = DOM.get('#profile-header');
        this.profilePost = DOM.get('#profile-posts');

        this.isEditing = false;
        this.currentEditingPostId = null;
        
        
        this.loadProfile();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('follow-button')) {
                e.preventDefault();
                this.handleFollowToggle(e);
            }
            if (e.target.classList.contains('like-button')) {
                e.preventDefault();
                this.handleLikeToggle(e);
            }


            if (e.target.classList.contains('edit-button')) {
                e.preventDefault();
                await this.handleEditPost(e);
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
                await this.loadProfile(this.currentPage);
            }
        });
    }
    
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
            this.resetEditingState();
            await this.loadProfile(this.currentPage);
        }
        catch (error) {
            console.error('Failed to update post: ', error);

            if (error.status === 403 || error.status === 401){
                alert('You must be logged in to edit a post');
            }
        }

    }
    disableAllEditingButtons() {
        const editButtons = DOM.getAll('.edit-button');
        editButtons.forEach(button => {
           if (button.dataset.postId !== this.currentEditingPostId) {
                button.disabled = true;
                button.style.opacity = '0.5';
            }
        });
    }


    resetEditingState() {
        this.isEditing = false;
        this.currentEditingPostId = null;
        
        const editButtons = DOM.getAll('.edit-button');
        editButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
        })

        if (this.createPostForm) {
            this.createPostForm.style.display = 'block';
            this.createPostInput.disabled = false;
            this.createPostButton.disabled =false;
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
            this.isEditing = true;
            this.currentEditingPostId = postId;
            
            this.disableAllEditingButtons();
            // this.disablePostCreation();

            const post = await API.request(`/posts/${postId}`, {
                method: 'GET'
            })
            const editForm = PostRenderer.renderEditForm({id: post.id, content: post.content});
            const postElement = DOM.get(`.post[data-post-id="${postId}"]`);

            if (!postElement) {
                console.error('Post element not found');
                this.resetEditingState();
                return;
            }
            postElement.innerHTML = '';
            DOM.append(postElement, editForm);
        }
        catch (error) {
            console.error('Failed to load post for editing: ', error);
            this.resetEditingState();
        }
    } 

    
    handleLikeToggle = async (e) => {
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
            })

            console.log('API response status:', response);

            UIUpdater.updateLikeButton(postId, response.liked_by_user);
            UIUpdater.updateLikeCount(postId, response.like_count);


        }
        catch (error) {
            console.error('Error toggling like: ', error);
        }

    }

    handleFollowToggle = async (e) => {
        e.preventDefault();   
        try {
            const response = await API.request(`/follow/${this.username}`, {
                method: 'PUT'

            });
            console.log(response);
            if (response.status === 200) {
                UIUpdater.updateFollowButton(response.is_following);
                UIUpdater.updateFollowerCount(response.follower_count);
                UIUpdater.updateFollowingCount(response.following_count);

            }
        }
        catch (error) {
            console.error('Error when sending API request: ', error);
        }
    }

    async loadProfile(page=this.currentPage) {
        DOM.clear(this.profilePost);
        // Render user posts
        const response = await API.request(`/user/${this.username}?page=${page}`)
        profileHeaderRenderer(response);
        response.posts.forEach(post => {
            const postElement = PostRenderer.render(this.username, post);
            DOM.append(this.profilePost, postElement);
        });

        this.currentPage = response.page.number || 1; 
        this.renderPagination(this.currentPage, response.page.total_pages);
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
                this.loadProfile(currentPage - 1);
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
                this.loadProfile(page);
            })

            DOM.append(paginationControls, pageButton);
        }

        if (currentPage < totalPages) {
            const nextButton = DOM.create('button', 'btn btn-primary', 'Next');
            nextButton.addEventListener('click', () => {
                this.loadProfile(currentPage + 1);
            })
            DOM.append(paginationControls, nextButton);
        }
    }
}

export default ProfileApp;