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
        
        this.loadProfile();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            console.log('Event target: ', e.target);
            if (e.target.classList.contains('follow-button')) {
                e.preventDefault();
                this.handleFollowToggle(e);
            }
        });
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

        console.log('Render pagination for profile posts');
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