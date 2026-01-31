function checkLoginAndRedirect() {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (isLoggedIn) {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initBaseUI();
    updateAuthUI();
    startStudyTimeTracking();
});
