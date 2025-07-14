import getCSRFToken from './utils.js';


const API = {
    async request(url, options = {}) {
        const csrfToken = getCSRFToken();
        console.log('CSRF Token: ', csrfToken);
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
            return await response.json();
        }
        catch (error) {
            console.error('API request failed: ', error);
            throw error;
        }

    }

}

export default API;