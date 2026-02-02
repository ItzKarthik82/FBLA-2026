document.addEventListener('DOMContentLoaded', () => {
    initBaseUI();
    requireAuth();
    updateAuthUI();
    
    const userInfo = getUserInfo();
    
    // Check if user is admin or student
    if (isUserAdmin()) {
        // Show admin dashboard
        document.querySelector('.student-dashboard').style.display = 'none';
        document.querySelector('.admin-dashboard').style.display = 'block';
        
        // Initialize admin panel
        if (typeof initAdminPanel === 'function') {
            initAdminPanel();
        }
    } else {
        // Show student dashboard
        document.querySelector('.student-dashboard').style.display = 'block';
        document.querySelector('.admin-dashboard').style.display = 'none';
        
        loadProgress();
        updateActivityList();
        startStudyTimeTracking();
        
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
    }
});
