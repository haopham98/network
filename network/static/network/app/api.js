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
            // if (response.status === 403 || response.status === 401) {
            //     const errorData = await response.json();
            //     console.error('API request failed with status: ', response.status, errorData);
            //     if (errorData.redirect) {
            //         window.location.href = errorData.redirect;
            //     }
            // }
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