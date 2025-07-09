import DOM from "./dom.js";


const getCSRFToken = () => {
    //return DOM.get('[name=csrfmiddlewaretoken]')?.value || '';
    let token = DOM.get('input[name="csrfmiddlewaretoken"]');
    if (!token) {
        token = DOM.get('meta[name="csrf-token"]')?.getAttribute('content');
    }
    if (!token) {
        token = getCookie('csrftoken');
    }
    return token.value || '';
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i=0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default getCSRFToken;