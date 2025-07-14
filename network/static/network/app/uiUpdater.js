import DOM from '../app/dom.js';

const UIUpdater = {
    updateLikeCount(postId, likeCount) {
        const likeCountElement = DOM.get(`.like-count[data-post-id="${postId}"]`);
        if (likeCountElement) {
            likeCountElement.textContent = likeCount;
        }
    },
    updateLikeButton(postId, liked) {
        const likeButton = DOM.get(`.like-button[data-post-id="${postId}"]`);
        if (likeButton) {
            likeButton.textContent = liked ? 'Unlike' : 'Like';
        }
    },
    updateFollowButton(isFollowing) {
        const followBtn = DOM.get('#follow-button');
        console.log('Updating follow button:', followBtn, isFollowing);
        if (followBtn) {
            followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
        }
    },
    updateFollowingCount(followingCount) {
        const followingCountElement = DOM.get('.following-count');
        if (followingCountElement) {
            followingCountElement.textContent = `Following: ${followingCount}`;
        }
    },
    updateFollowerCount(followerCount) {
        const followerCountElement = DOM.get('.follower-count');
        if (followerCountElement) {
            followerCountElement.textContent = `Followers: ${followerCount}`;
        }
    }
}

export default UIUpdater;