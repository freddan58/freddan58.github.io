document.addEventListener('DOMContentLoaded', function () {
    // Get the user's browser language
    const userLang = navigator.language || navigator.userLanguage;
    const baseUrl = '/furbano.github.io';
    const currentPath = window.location.pathname;

    // Define language mappings
    const langMap = {
        'en': '/about/',
        'es': '/acerca/'
    };

    // Determine the target page based on language
    let targetPage = langMap['en']; // Default to English
    if (userLang.startsWith('es')) {
        targetPage = langMap['es'];
    }

    // Redirect if the user is on the homepage and hasn't been redirected yet
    if (currentPath === baseUrl + '/' || currentPath === baseUrl + '') {
        if (!sessionStorage.getItem('languageRedirected')) {
            sessionStorage.setItem('languageRedirected', 'true');
            window.location.href = baseUrl + targetPage;
        }
    }
});