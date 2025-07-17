import getCSRFToken from './utils.js';


const API = {
    async request(url, options = {}) {
        const csrfToken = getCSRFToken();
        if (!csrfToken) {
            window.location.href = '/login'; // Redirect to login if CSRF token is missing
            return;
        }
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        }
        options = { ...defaultOptions, ...options };
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                return response.json().then(err => {
                    return Promise.reject({
                        status: response.status
                    })
                })
            }
            if (response.status === 403 || response.status === 401) {
                console.error('Unauthorized or forbidden request');
                window.location.href = '/login'; // Redirect to login if unauthorized
                return;
            }

            return await response.json();
        }
        catch (error) {
            console.error('API request failed: ', error);
            throw error;
        }

    }

}

export default API;