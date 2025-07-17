import DOM  from '../app/dom.js';


export function profileHeaderRenderer(data, username) {
    const profile_header = document.getElementById('profile-header');
    const followInfo = DOM.create('div', 'follow-info');
    DOM.clear(profile_header);
    const UsernameElement = DOM.create('h2', 'username', data.username);
    UsernameElement.id = 'username';
    DOM.append(profile_header, UsernameElement);
    followInfo.innerHTML = `
        <div><span class="follower-count">Followers: ${data.followers_count}</span></div>
        <div><span class="following-count">Following: ${data.following_count}</span></div>
        `
    DOM.append(profile_header, followInfo);
    if (data.username != data.current_user) {
        const followButton = DOM.create('button', 'follow-button');
        followButton.className = 'btn btn-info follow-button';
        followButton.id = 'follow-button';
        followButton.textContent = data.is_following ? 'Unfollow' : 'Follow';
        DOM.append(profile_header, followButton);
    }
}

