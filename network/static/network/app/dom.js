const DOM = {
    get(selector){
        return document.querySelector(selector);
    },
    getAll(selector){
        return document.querySelectorAll(selector);
    },
    create(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },
    append(parent, child) {
        parent.appendChild(child);
    },
    clear(element) {
        element.innerHTML = '';
    }
}

export default DOM;