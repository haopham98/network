import PostApp from "./posts/postApp.js";
import ProfileApp from "./profile/profileApp.js";


function getPageContext(path) {
    
    if (path === "/" || path.startsWith("/posts/")) {
        return "home";
    }
    if (path.startsWith("/profile/")) {
        return "profile";
    }
    return "not_found";
}



document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const pageContext = getPageContext(path);
    if (pageContext === "home"){
        new PostApp();
    }
    // else if (pageContext === "profile") {
    //     const username = path.split('/')[2];
    //     new ProfileApp(username);
    // }
    
});
