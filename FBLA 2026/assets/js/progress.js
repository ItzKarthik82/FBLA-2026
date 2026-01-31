function updateDisplay(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function updateProgressBar(id, percentage) {
    const bar = document.getElementById(id);
    if (bar) bar.style.width = percentage + '%';

    const textId = id.replace('Progress', 'ProgressText');
    const textElement = document.getElementById(textId);
    if (textElement) textElement.textContent = percentage + '% Complete';
}

function updateAchievements(lessons, quizzes, sessions) {
    if (lessons === undefined || quizzes === undefined || sessions === undefined) {
        const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
        lessons = completedLessons.length;
        quizzes = parseInt(localStorage.getItem('quizzes') || '0');
        sessions = parseInt(localStorage.getItem('sessions') || '0');
    }

    const achievements = [];

    const firstStepsEl = document.getElementById('first-steps');
    if (firstStepsEl) {
        if (lessons >= 1) {
            firstStepsEl.classList.remove('locked');
            firstStepsEl.classList.add('unlocked');
            achievements.push('first-steps');
        } else {
            firstStepsEl.classList.remove('unlocked');
            firstStepsEl.classList.add('locked');
        }
    }

    const quizMasterEl = document.getElementById('quiz-master');
    if (quizMasterEl) {
        if (quizzes >= 5) {
            quizMasterEl.classList.remove('locked');
            quizMasterEl.classList.add('unlocked');
            achievements.push('quiz-master');
        } else {
            quizMasterEl.classList.remove('unlocked');
            quizMasterEl.classList.add('locked');
        }
    }

    const dedicatedEl = document.getElementById('dedicated-learner');
    if (dedicatedEl) {
        if (lessons >= 10) {
            dedicatedEl.classList.remove('locked');
            dedicatedEl.classList.add('unlocked');
            achievements.push('dedicated-learner');
        } else {
            dedicatedEl.classList.remove('unlocked');
            dedicatedEl.classList.add('locked');
        }
    }

    const studyGroupEl = document.getElementById('study-group');
    if (studyGroupEl) {
        if (sessions >= 5) {
            studyGroupEl.classList.remove('locked');
            studyGroupEl.classList.add('unlocked');
            achievements.push('study-group');
        } else {
            studyGroupEl.classList.remove('unlocked');
            studyGroupEl.classList.add('locked');
        }
    }

    const excellenceEl = document.getElementById('academic-excellence');
    if (excellenceEl) {
        if (lessons >= 20 && quizzes >= 10 && sessions >= 10) {
            excellenceEl.classList.remove('locked');
            excellenceEl.classList.add('unlocked');
            achievements.push('academic-excellence');
        } else {
            excellenceEl.classList.remove('unlocked');
            excellenceEl.classList.add('locked');
        }
    }

    const achievementsCountEl = document.getElementById('achievementsCount');
    if (achievementsCountEl) {
        achievementsCountEl.textContent = achievements.length;
    }
}

function loadProgress() {
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    const quizzes = parseInt(localStorage.getItem('quizzes') || '0');
    const totalMinutes = parseInt(localStorage.getItem('studyMinutes') || '0');
    const hours = Math.floor(totalMinutes / 60);
    const sessions = parseInt(localStorage.getItem('sessions') || '0');

    const mathLessons = completedLessons.filter(id => ['algebra', 'geometry'].includes(id)).length;
    const scienceLessons = completedLessons.filter(id => ['biology', 'chemistry'].includes(id)).length;
    const englishLessons = completedLessons.filter(id => ['essay'].includes(id)).length;
    const historyLessons = completedLessons.filter(id => ['history'].includes(id)).length;

    updateDisplay('lessonsCount', completedLessons.length);
    updateDisplay('quizzesCount', quizzes);
    updateDisplay('hoursCount', hours);

    const mathProgress = Math.min(100, (mathLessons / 2) * 100);
    const scienceProgress = Math.min(100, (scienceLessons / 2) * 100);
    const englishProgress = Math.min(100, (englishLessons / 1) * 100);

    updateProgressBar('mathProgress', mathProgress);
    updateProgressBar('scienceProgress', scienceProgress);
    updateProgressBar('englishProgress', englishProgress);

    updateAchievements(completedLessons.length, quizzes, sessions);
}

function addActivity(description) {
    try {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const activity = {
            description,
            timestamp: new Date().toLocaleString(),
            icon: getActivityIcon(description)
        };
        activities.unshift(activity);
        if (activities.length > 10) activities.pop();
        localStorage.setItem('activities', JSON.stringify(activities));
        updateActivityList();
    } catch (e) {
        console.error('Error adding activity:', e);
    }
}

function getActivityIcon(description) {
    if (description.includes('lesson')) return '📚';
    if (description.includes('quiz')) return '✅';
    if (description.includes('session')) return '👥';
    return '🎯';
}

function updateActivityList() {
    try {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const listElement = document.getElementById('activityList');
        if (!listElement) return;

        if (activities.length === 0) {
            listElement.innerHTML = '<div class="activity-item"><div class="activity-icon">📝</div><div class="activity-content"><p>Welcome to PeerLearn! Complete your first lesson to see activity here.</p><span class="activity-time"></span></div></div>';
        } else {
            listElement.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <p>${activity.description}</p>
                        <span class="activity-time">${activity.timestamp}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Error updating activity list:', e);
        const listElement = document.getElementById('activityList');
        if (listElement) {
            listElement.innerHTML = '<div class="activity-item"><div class="activity-icon">⚠️</div><div class="activity-content"><p>Error loading activities</p><span class="activity-time"></span></div></div>';
        }
    }
}
