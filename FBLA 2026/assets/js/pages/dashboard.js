document.addEventListener('DOMContentLoaded', () => {
    initBaseUI();
    requireAuth();
    updateAuthUI();
    loadProgress();
    updateActivityList();
    startStudyTimeTracking();

    const userInfo = getUserInfo();
    if (userInfo.name) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const profileName = document.getElementById('profileName');
        if (welcomeMessage) welcomeMessage.textContent = `Welcome back, ${userInfo.name}!`;
        if (profileName) profileName.textContent = userInfo.name;
    }
    if (userInfo.email) {
        const profileEmail = document.getElementById('profileEmail');
        if (profileEmail) profileEmail.textContent = userInfo.email;
    }
});
