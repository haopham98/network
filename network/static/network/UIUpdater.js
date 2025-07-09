const UIUpdater = {
    updateLikeCount(postId, likeCount) {
        const likeCountElement = DOM.get('.like-count[data-post-id="${postId}"]');
        if (likeCountElement) {
            likeCountElement.textContent = likeCount;
        }
    },
    updateLikeButton(postId, liked) {
        const likeButton = DOM.get('.like-button[data-post-id="${postId}"]');
        if (likeButton) {
            likeButton.textContent = liked ? 'Unlike' : 'Like';
        }
    },
}