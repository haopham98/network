import DOM  from '../app/dom.js';


export function profileHeaderRenderer(data, username) {
    const profile_header = document.getElementById('profile-header');
    profile_header.innerHTML = `
    <h3>${data.username}</h3>
    <div class="row">
        <div><span class="follower-count">Followers: ${data.followers_count}</span></div>
        <div><span class="following-count">Following: ${data.following_count}</span></div>
    </div>
    
    `
    if (data.username != data.current_user) {
        const followButton = DOM.create('button', 'follow-button');
        followButton.className = 'btn btn-info follow-button';
        followButton.id = 'follow-button';
        followButton.textContent = data.is_following ? 'Unfollow' : 'Follow';
        DOM.append(profile_header, followButton);
    }
}

function renderPagination(currentPage, totalPages) {
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