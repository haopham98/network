import API from "../app/api.js";
import PostRenderer from "../posts/renderer.js";
import DOM from "../app/dom.js";
import UIUpdater from "../app/uiUpdater.js";


export class FollowingApp {
    constructor(username) {
        this.username = username;
        this.currentPage = 1;
        this.PostContainer = DOM.get("#posts-container");


        this.setupEventListeners();
        this.loadFollowingPosts(this.currentPage);

        
    }

    setupEventListeners() {
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("like-button")) {
                e.preventDefault();
                this.handleLikeToggle(e);
            }
        })
    }

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


    async loadFollowingPosts(page = this.currentPage) {
        DOM.clear(this.PostContainer);

        const response = await API.request(`/following_posts?page=${page}`);

        if (response.status === 200){
            response.posts.forEach(post => {
                const postElement = PostRenderer.render(this.username, post);
                DOM.append(this.PostContainer, postElement);
            })
        }
    }
}