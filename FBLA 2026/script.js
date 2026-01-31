// Authentication Management
function checkAuth() {
    return localStorage.getItem('userLoggedIn') === 'true';
}

function getUserInfo() {
    return {
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || ''
    };
}

function logout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    alert('You have been logged out successfully!');
    window.location.href = 'index.html';
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const authMenuBtn = document.getElementById('authMenuBtn');
    const authDropdown = document.getElementById('authDropdown');

    const isLoggedIn = checkAuth();
    const userInfo = getUserInfo();
    const displayName = userInfo.name || (userInfo.email ? userInfo.email.split('@')[0] : 'Student');

    if (authMenuBtn && authDropdown) {
        const headerText = isLoggedIn ? `Signed in as ${displayName}` : 'Not signed in';
        const itemsMarkup = isLoggedIn
            ? `<div class="auth-dropdown-header" id="authDropdownHeader">${headerText}</div>
               <button class="auth-item" data-action="dashboard">Dashboard</button>
               <button class="auth-item" data-action="logout">Log out</button>`
            : `<div class="auth-dropdown-header" id="authDropdownHeader">${headerText}</div>
               <button class="auth-item" data-action="login">Log In</button>
               <button class="auth-item" data-action="signup">Sign Up</button>`;

        authDropdown.innerHTML = itemsMarkup;
        authMenuBtn.textContent = '👤';

        authDropdown.querySelectorAll('.auth-item').forEach(item => {
            item.onclick = () => {
                const action = item.getAttribute('data-action');
                authDropdown.classList.remove('show');
                authMenuBtn.setAttribute('aria-expanded', 'false');

                if (action === 'login') window.location.href = 'login.html';
                if (action === 'signup') window.location.href = 'login.html#signup';
                if (action === 'dashboard') window.location.href = 'dashboard.html';
                if (action === 'logout') logout();
            };
        });

        if (!authMenuBtn.dataset.bound) {
            authMenuBtn.dataset.bound = 'true';
            authMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = authDropdown.classList.toggle('show');
                authMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });

            document.addEventListener('click', (e) => {
                if (!authMenuBtn.contains(e.target) && !authDropdown.contains(e.target)) {
                    authDropdown.classList.remove('show');
                    authMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }
        return;
    }

    if (!authBtn) return;

    if (isLoggedIn) {
        authBtn.textContent = `👤 ${displayName}`;
        authBtn.onclick = () => {
            if (confirm('Do you want to log out?')) {
                logout();
            }
        };
    } else {
        authBtn.textContent = '🔐 Login';
        authBtn.onclick = () => {
            window.location.href = 'login.html';
        };
    }
}

function requireAuth() {
    if (!checkAuth()) {
        alert('Please log in to access this page');
        window.location.href = 'login.html';
    }
}

// Theme Management
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';

    body.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Progress Management
let sessionStartTime = null;
let isPageVisible = true;
let editingSession = null; // Track which session is being edited

function loadProgress() {
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    const quizzes = parseInt(localStorage.getItem('quizzes') || '0');
    const totalMinutes = parseInt(localStorage.getItem('studyMinutes') || '0');
    const hours = Math.floor(totalMinutes / 60);
    const sessions = parseInt(localStorage.getItem('sessions') || '0');

    // Count completed lessons per subject
    const mathLessons = completedLessons.filter(id => ['algebra', 'geometry'].includes(id)).length;
    const scienceLessons = completedLessons.filter(id => ['biology', 'chemistry'].includes(id)).length;
    const englishLessons = completedLessons.filter(id => ['essay'].includes(id)).length;
    const historyLessons = completedLessons.filter(id => ['history'].includes(id)).length;

    updateDisplay('lessonsCount', completedLessons.length);
    updateDisplay('quizzesCount', quizzes);
    updateDisplay('hoursCount', hours);

    // Update progress bars based on completed lessons per subject
    const mathProgress = Math.min(100, (mathLessons / 2) * 100); // 2 math lessons
    const scienceProgress = Math.min(100, (scienceLessons / 2) * 100); // 2 science lessons
    const englishProgress = Math.min(100, (englishLessons / 1) * 100); // 1 english lesson

    updateProgressBar('mathProgress', mathProgress);
    updateProgressBar('scienceProgress', scienceProgress);
    updateProgressBar('englishProgress', englishProgress);

    // Update achievements
    updateAchievements(completedLessons.length, quizzes, sessions);
}

function updateAchievements(lessons, quizzes, sessions) {
    const achievements = [];

    // First Steps: Complete first lesson
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

    // Quiz Master: Pass 5 quizzes
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

    // Dedicated Learner: Complete 10 lessons
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

    // Study Group: Join 5 sessions
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

    // Academic Excellence: Complete all subjects (arbitrary: 20 lessons, 10 quizzes, 10 sessions)
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

function markLessonComplete() {
    if (!currentLessonId) {
        currentLessonId = document.getElementById('lessonModal').getAttribute('data-lesson');
        if (!currentLessonId) return;
    }
    
    // Mark this specific lesson as completed
    const completedLessonsStr = localStorage.getItem('completedLessons');
    let completedLessons = [];
    if (completedLessonsStr) {
        try {
            completedLessons = JSON.parse(completedLessonsStr);
            if (!Array.isArray(completedLessons)) completedLessons = [];
        } catch (e) {
            completedLessons = [];
        }
    }
    
    if (!completedLessons.includes(currentLessonId)) {
        completedLessons.push(currentLessonId);
        localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    }
    
    // Update global lessons count for backward compatibility
    const current = parseInt(localStorage.getItem('lessons') || '0');
    const newValue = Math.min(100, current + 1);
    localStorage.setItem('lessons', newValue);
    
    addActivity(`Completed "${currentLessonId.replace('-', ' ')}" lesson`);
    loadProgress();
    showToast('Lesson marked as complete!');
    
    // Close the lesson modal
    document.getElementById('lessonModal').style.display = 'none';
    
    // Update lesson cards immediately
    updateLessonCards();
    
    currentLessonId = null; // Reset
}

function takeQuiz() {
    const current = parseInt(localStorage.getItem('quizzes') || '0');
    const newValue = Math.min(100, current + 1);
    localStorage.setItem('quizzes', newValue);
    addActivity('Passed a quiz');
    loadProgress();
    showToast('Quiz completed successfully!');
}

function joinSessionFromDash() {
    const current = parseInt(localStorage.getItem('sessions') || '0');
    const newValue = current + 1;
    localStorage.setItem('sessions', newValue);
    addActivity('Joined a study session');
    showToast('Joined study session!');
    loadProgress();
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

function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Schedule Functions
function joinSession(sessionName) {
    addActivity(`Joined session: ${sessionName}`);
    showToast(`Joined ${sessionName}!`);
}

function proposeSession() {
    const title = document.getElementById('sessionTitle').value;
    const host = document.getElementById('sessionHost').value;
    const time = document.getElementById('sessionTime').value;
    const category = document.getElementById('sessionCategory').value;
    const level = document.getElementById('sessionLevel').value;
    const meetingLink = document.getElementById('meetingLink').value || '';

    if (!title || !host || !time) {
        showToast('Please fill in all fields');
        return;
    }
    
    // Parse the date/time
    const sessionDate = new Date(time);
    const hours = sessionDate.getHours();
    const minutes = sessionDate.getMinutes();
    
    // Track if we're editing
    const isEditing = editingSession !== null;
    
    // If we're editing a session, delete the old one first
    if (editingSession) {
        let deleted = false;
        const allEvents = document.querySelectorAll('.calendar-event[data-custom="true"]');
        allEvents.forEach(event => {
            const onclick = event.getAttribute('onclick');
            // Check if this event matches the old session we're editing
            if (onclick && onclick.includes(editingSession.title) && onclick.includes(editingSession.dateTime)) {
                const timeBlock = event.closest('.time-block');
                if (timeBlock) {
                    timeBlock.innerHTML = '';
                    timeBlock.classList.remove('session-slot');
                    deleted = true;
                }
            }
        });
        
        if (!deleted) {
            console.log('Could not find old event to delete:', editingSession);
        }
        
        editingSession = null; // Clear the editing state
    }

    // Use already declared variables for date/time formatting
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = dayNames[sessionDate.getDay()];
    const monthName = monthNames[sessionDate.getMonth()];
    const dayNum = sessionDate.getDate();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
    const fullDateTimeStr = `${dayName}, ${monthName} ${dayNum}, ${timeStr}`;
    
    // Store the session data
    const sessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
    
    // If editing, remove the old session first
    if (isEditing) {
        const editIndex = sessions.findIndex(s => 
            s.title === editingSession.title && s.dateTime === editingSession.dateTime
        );
        if (editIndex > -1) {
            sessions.splice(editIndex, 1);
        }
    }
    
    // Add the new session
    sessions.push({
        title: title,
        host: host,
        dateTime: fullDateTimeStr,
        category: category,
        level: level,
        meetingLink: meetingLink,
        date: sessionDate.toISOString()
    });
    
    localStorage.setItem('customSessions', JSON.stringify(sessions));
    
    // Update month view to show the new session
    updateMonthDisplay();

    const actionText = isEditing ? 'updated' : 'added';
    showToast(`Session ${actionText} successfully!`);
    document.getElementById('hostForm').reset();
}

// Session reminder system
function generateSessionId(title, dateTime) {
    return `${title}-${dateTime}`.replace(/[^a-zA-Z0-9]/g, '-');
}

function isSessionInterested(sessionId) {
    const interested = JSON.parse(localStorage.getItem('interestedSessions') || '[]');
    return interested.some(s => s.id === sessionId);
}

function toggleSessionInterest(sessionId, sessionTitle, dateTime, button) {
    const interested = JSON.parse(localStorage.getItem('interestedSessions') || '[]');
    const index = interested.findIndex(s => s.id === sessionId);
    
    if (index > -1) {
        // Remove from interested
        interested.splice(index, 1);
        button.textContent = '🤍 Mark Interested';
        button.classList.remove('interested');
        showToast('Removed from interested sessions');
        console.log('Removed session reminder:', sessionId);
    } else {
        // Add to interested
        interested.push({ id: sessionId, title: sessionTitle, dateTime: dateTime });
        button.textContent = '❤️ Interested';
        button.classList.add('interested');
        showToast('✅ Added to interested sessions - you will get a reminder 15 minutes before!');
        console.log('Added session reminder:', sessionId, 'for', dateTime);
        
        // Set up reminder
        setupReminder(sessionId, sessionTitle, dateTime);
    }
    
    localStorage.setItem('interestedSessions', JSON.stringify(interested));
}

function setupReminder(sessionId, sessionTitle, dateTime) {
    const reminders = JSON.parse(localStorage.getItem('sessionReminders') || '{}');
    reminders[sessionId] = { title: sessionTitle, dateTime: dateTime, set: true, notified: false };
    localStorage.setItem('sessionReminders', JSON.stringify(reminders));
    console.log('Reminder set for:', sessionTitle, 'at', dateTime);
}

function checkReminders() {
    const reminders = JSON.parse(localStorage.getItem('sessionReminders') || '{}');
    const now = new Date();
    
    Object.keys(reminders).forEach(sessionId => {
        const reminder = reminders[sessionId];
        if (reminder.notified) return; // Already notified
        
        try {
            const sessionDateTime = parseSessionDateTime(reminder.dateTime);
            if (!sessionDateTime) {
                console.log('Could not parse date for:', reminder.dateTime);
                return;
            }
            
            const timeDiff = (sessionDateTime - now) / 1000 / 60; // Difference in minutes
            
            // Send notification 15 minutes before (between 14-16 minutes before)
            if (timeDiff <= 15 && timeDiff > 13) {
                sendReminder(reminder.title, sessionDateTime);
                reminder.notified = true;
                localStorage.setItem('sessionReminders', JSON.stringify(reminders));
            }
        } catch (e) {
            console.log('Error parsing session time:', e);
        }
    });
}

function parseSessionDateTime(dateTimeStr) {
    // Parse format like "Tuesday, January 27, 4:00 PM"
    const dateParts = dateTimeStr.match(/(\w+),\s+(\w+)\s+(\d+),\s+(\d+):(\d+)\s+(AM|PM)/);
    if (!dateParts) return null;
    
    const [, dayName, monthName, day, hours, minutes, ampm] = dateParts;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    let hour = parseInt(hours);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    const month = monthNames.indexOf(monthName);
    const now = new Date();
    const year = now.getFullYear();
    
    return new Date(year, month, parseInt(day), hour, parseInt(minutes), 0);
}

function sendReminder(sessionTitle, sessionDateTime) {
    const timeStr = sessionDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const message = `Your session "${sessionTitle}" starts in 15 minutes at ${timeStr}`;
    
    // Try to send browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('📚 Study Session Reminder', {
            body: message,
            icon: '📚'
        });
    } else {
        // Fallback to toast notification
        showToast(`⏰ Reminder: ${message}`, 'info');
    }
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showToast('✅ Notifications enabled! You\'ll get reminders 15 minutes before sessions.', 'success');
                } else {
                    showToast('⏰ Notifications disabled. You\'ll still get reminders on this page though!', 'info');
                }
            });
        } else if (Notification.permission === 'granted') {
            console.log('Notifications already enabled');
        }
    } else {
        console.log('Browser does not support notifications');
    }
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

// Join session with modal
function joinSession(sessionTitle, meetingLink, host, level, dateTime, isCustom = false) {
    const sessionId = generateSessionId(sessionTitle, dateTime);
    const isInterested = isSessionInterested(sessionId);
    
    const meetingLinkHTML = meetingLink ? `
        <div class="info-group">
            <span class="info-label">🔗 Meeting Link</span>
            <div class="meeting-link-container">
                <a href="${meetingLink}" target="_blank" class="btn small primary">Join Meeting</a>
                <button class="btn small" onclick="copyToClipboard('${meetingLink}', this)">Copy Link</button>
            </div>
        </div>
    ` : `
        <div class="info-group">
            <span class="info-label">🔗 Meeting Link</span>
            <p class="text-muted">No meeting link provided</p>
        </div>
    `;
    
    const customActionsHTML = isCustom ? `
        <button class="btn small delete-session-btn" data-title="${sessionTitle}" data-link="${meetingLink}" data-host="${host}" data-level="${level}" data-datetime="${dateTime}">Edit Session</button>
        <button class="btn small danger delete-session-btn" data-title="${sessionTitle}" data-datetime="${dateTime}">Delete Session</button>
    ` : '';
    
    const modal = document.createElement('div');
    modal.className = 'session-modal';
    modal.innerHTML = `
        <div class="modal-content session-modal-content">
            <div class="modal-header">
                <h3>${sessionTitle}</h3>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="session-modal-info">
                    <div class="info-group">
                        <span class="info-label">📅 Session Time</span>
                        <p>${dateTime}</p>
                    </div>
                    <div class="info-group">
                        <span class="info-label">👨‍🏫 Host</span>
                        <p>${host}</p>
                    </div>
                    <div class="info-group">
                        <span class="info-label">📊 Level</span>
                        <p>${level}</p>
                    </div>
                    ${meetingLinkHTML}
                </div>
            </div>
            <div class="modal-footer">
                ${customActionsHTML}
                <button class="btn small ${isInterested ? 'interested' : ''}" onclick="toggleSessionInterest('${sessionId}', '${sessionTitle}', '${dateTime}', this)">
                    ${isInterested ? '❤️ Interested' : '🤍 Mark Interested'}
                </button>
                <button class="btn small secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for custom session buttons
    if (isCustom) {
        const deleteBtn = modal.querySelector('.btn.small.danger.delete-session-btn');
        const editBtn = modal.querySelector('.btn.small.delete-session-btn:not(.danger)');
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const title = this.getAttribute('data-title');
                const datetime = this.getAttribute('data-datetime');
                deleteSession(title, datetime, modal);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const title = this.getAttribute('data-title');
                const link = this.getAttribute('data-link');
                const hostName = this.getAttribute('data-host');
                const lvl = this.getAttribute('data-level');
                const dt = this.getAttribute('data-datetime');
                editSession(title, link, hostName, lvl, dt, title, modal);
            });
        }
    }
}

function deleteSession(sessionTitle, dateTime, modal) {
    if (confirm(`Are you sure you want to delete "${sessionTitle}"?`)) {
        // Remove from localStorage
        const sessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
        const updatedSessions = sessions.filter(s => 
            !(s.title === sessionTitle && s.dateTime === dateTime)
        );
        localStorage.setItem('customSessions', JSON.stringify(updatedSessions));
        
        // Close the modal
        if (modal) {
            modal.remove();
        }
        showToast('Session deleted successfully');
        
        // Update month view immediately
        setTimeout(() => {
            updateMonthDisplay();
        }, 100);
    }
}

function editSession(oldTitle, oldMeetingLink, oldHost, oldLevel, oldDateTime, displayTitle, modal) {
    // Parse the date/time from the string
    const dateMatch = oldDateTime.match(/(\w+), (\w+) (\d+), (\d+):(\d+) (AM|PM)/);
    if (!dateMatch) {
        showToast('Error parsing session date');
        return;
    }
    
    const [, , monthName, day, hours, minutes, ampm] = dateMatch;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames.indexOf(monthName);
    let hour = parseInt(hours);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    // Create datetime-local string
    const year = new Date().getFullYear();
    const dateTimeLocal = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${minutes}`;
    
    // Populate the form with current values
    document.getElementById('sessionTitle').value = oldTitle;
    document.getElementById('sessionHost').value = oldHost;
    document.getElementById('sessionTime').value = dateTimeLocal;
    document.getElementById('sessionLevel').value = oldLevel;
    document.getElementById('meetingLink').value = oldMeetingLink;
    
    // Find and set the category
    const allEvents = document.querySelectorAll('.calendar-event[data-custom="true"]');
    allEvents.forEach(event => {
        const onclick = event.getAttribute('onclick');
        if (onclick && onclick.includes(oldTitle) && onclick.includes(oldDateTime)) {
            const category = event.getAttribute('data-category');
            if (category) {
                document.getElementById('sessionCategory').value = category;
            }
        }
    });
    
    // Store the old session info so we can delete it when form is submitted
    editingSession = { title: oldTitle, dateTime: oldDateTime };
    
    // Close the modal
    modal.remove();
    
    // Scroll to the form
    document.getElementById('hostForm').scrollIntoView({ behavior: 'smooth' });
    showToast('Edit the session details and click Create Session');
}

function copyMeetingLink() {
    const linkInput = document.getElementById('linkCopy');
    linkInput.select();
    document.execCommand('copy');
    showToast('Meeting link copied!');
}

// Filter sessions
function filterSessions(category, clickedButton) {
    const weekEvents = document.querySelectorAll('.calendar-event');
    const monthEvents = document.querySelectorAll('.month-event');
    const buttons = document.querySelectorAll('.pill-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    // Filter week view events
    weekEvents.forEach(evt => {
        if (category === 'all' || evt.dataset.category === category) {
            evt.style.display = 'flex';
        } else {
            evt.style.display = 'none';
        }
    });
    
    // Filter month view events
    monthEvents.forEach(evt => {
        if (category === 'all' || evt.classList.contains(category)) {
            evt.style.display = 'block';
        } else {
            evt.style.display = 'none';
        }
    });
}

// Calendar Navigation
let currentWeekOffset = 0;
let currentMonthOffset = 0;
let currentView = 'week';

function switchView(view) {
    // Only month view is supported now
    currentView = 'month';
    const calendarWrapper = document.querySelector('.calendar-wrapper');
    let monthWrapper = document.querySelector('.month-calendar-wrapper');
    
    // Hide week view
    if (calendarWrapper) calendarWrapper.style.display = 'none';
    
    // Create or show month view
    if (!monthWrapper) {
        createMonthView();
        monthWrapper = document.querySelector('.month-calendar-wrapper');
    }
    
    if (monthWrapper) {
        monthWrapper.style.display = 'block';
        updateMonthDisplay();
    }
}

function previousWeek() {
    // Navigate to previous month
    currentMonthOffset--;
    updateMonthDisplay();
}

function nextWeek() {
    // Navigate to next month
    currentMonthOffset++;
    updateMonthDisplay();
}

function goToToday() {
    // Go to current month
    currentMonthOffset = 0;
    updateMonthDisplay();
}

function createMonthView() {
    const calendarWrapper = document.querySelector('.calendar-wrapper');
    if (!calendarWrapper) return;
    
    const monthWrapper = document.createElement('div');
    monthWrapper.className = 'month-calendar-wrapper';
    monthWrapper.style.display = 'block';
    monthWrapper.innerHTML = `
        <div class="month-calendar">
            <div class="month-grid-header">
                <div class="month-day-name">Sun</div>
                <div class="month-day-name">Mon</div>
                <div class="month-day-name">Tue</div>
                <div class="month-day-name">Wed</div>
                <div class="month-day-name">Thu</div>
                <div class="month-day-name">Fri</div>
                <div class="month-day-name">Sat</div>
            </div>
            <div class="month-grid-body" id="monthGridBody"></div>
        </div>
    `;
    
    calendarWrapper.parentNode.insertBefore(monthWrapper, calendarWrapper.nextSibling);
    updateMonthDisplay();
}

function updateMonthDisplay() {
    const weekDisplay = document.getElementById('weekDisplay');
    const currentWeekBadge = document.getElementById('currentWeekBadge');
    const today = new Date();
    const displayDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    if (weekDisplay) {
        weekDisplay.textContent = `${monthNames[displayDate.getMonth()]} ${displayDate.getFullYear()}`;
    }
    
    // Show "Current Month" badge only when viewing the current month
    if (currentWeekBadge) {
        if (currentMonthOffset === 0) {
            currentWeekBadge.style.display = 'inline-flex';
        } else {
            currentWeekBadge.style.display = 'none';
        }
    }
    
    const monthGridBody = document.getElementById('monthGridBody');
    if (!monthGridBody) return;
    
    monthGridBody.innerHTML = '';
    
    const firstDay = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
    const lastDay = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // Get all events from the calendar
    const allEvents = document.querySelectorAll('.calendar-event');
    const eventsMap = new Map();
    
    allEvents.forEach(event => {
        const dateTime = event.getAttribute('onclick');
        if (dateTime) {
            // Extract date from onclick attribute (e.g., "Tuesday, January 27, 4:00 PM")
            const match = dateTime.match(/['"]([^'"]+)['"](?=[^'"]*$)/);
            if (match) {
                const dateStr = match[1];
                const dayMatch = dateStr.match(/\w+,\s+(\w+)\s+(\d+)/);
                
                if (dayMatch) {
                    const monthName = dayMatch[1];
                    const dayNum = parseInt(dayMatch[2]);
                    const monthIndex = monthNames.indexOf(monthName);
                    
                    // Check if event belongs to current displayed month
                    if (monthIndex === displayDate.getMonth()) {
                        if (!eventsMap.has(dayNum)) {
                            eventsMap.set(dayNum, []);
                        }
                        
                        eventsMap.get(dayNum).push({
                            title: event.querySelector('.event-title')?.textContent || '',
                            time: event.querySelector('.event-time')?.textContent || '',
                            category: event.getAttribute('data-category') || '',
                            onclick: event.getAttribute('onclick')
                        });
                    }
                }
            }
        }
    });
    
    // Load custom sessions from localStorage
    const customSessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
    customSessions.forEach(session => {
        const sessionDate = new Date(session.date);
        if (sessionDate.getMonth() === displayDate.getMonth() && 
            sessionDate.getFullYear() === displayDate.getFullYear()) {
            const dayNum = sessionDate.getDate();
            
            if (!eventsMap.has(dayNum)) {
                eventsMap.set(dayNum, []);
            }
            
            const hours = sessionDate.getHours();
            const minutes = sessionDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, '0');
            const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
            
            eventsMap.get(dayNum).push({
                title: session.title,
                time: timeStr,
                category: session.category,
                onclick: `joinSession('${session.title}', '${session.meetingLink}', '${session.host}', '${session.level}', '${session.dateTime}', true)`
            });
        }
    });
    
    // Create calendar cells
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'month-day empty';
        monthGridBody.appendChild(emptyCell);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'month-day';
        
        const currentDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
        const isToday = currentDate.toDateString() === today.toDateString();
        
        if (isToday) {
            dayCell.classList.add('today');
        }
        
        const eventsHTML = [];
        const dayEvents = eventsMap.get(day) || [];
        
        if (dayEvents.length > 0) {
            dayCell.classList.add('has-events');
        }
        
        dayEvents.forEach(evt => {
            eventsHTML.push(`
                <div class="month-event ${evt.category}" onclick="${evt.onclick}">
                    ${evt.time} ${evt.title}
                </div>
            `);
        });
        
        dayCell.innerHTML = `
            <div class="month-day-number">${day}</div>
            <div class="month-events">${eventsHTML.join('')}</div>
        `;
        
        monthGridBody.appendChild(dayCell);
    }
}

function updateWeekDisplay() {
    const weekDisplay = document.getElementById('weekDisplay');
    const today = new Date();
    const startOfWeek = new Date(today);
    
    // Start on Sunday
    startOfWeek.setDate(today.getDate() - today.getDay() + (currentWeekOffset * 7));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const startMonth = monthNames[startOfWeek.getMonth()];
    const endMonth = monthNames[endOfWeek.getMonth()];
    
    let dateString = `${startMonth} ${startOfWeek.getDate()}`;
    if (startMonth !== endMonth) {
        dateString += ` - ${endMonth} ${endOfWeek.getDate()}`;
    } else {
        dateString += ` - ${endOfWeek.getDate()}`;
    }
    dateString += `, ${endOfWeek.getFullYear()}`;
    
    if (weekDisplay) {
        weekDisplay.textContent = dateString;
    }
    
    // Show/hide current week badge
    const currentWeekBadge = document.getElementById('currentWeekBadge');
    if (currentWeekBadge) {
        if (currentWeekOffset === 0) {
            currentWeekBadge.style.display = 'inline-flex';
        } else {
            currentWeekBadge.style.display = 'none';
        }
    }
    
    // Update day headers
    const dayHeaders = document.querySelectorAll('.day-header');
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        
        if (dayHeaders[i]) {
            const dayNameEl = dayHeaders[i].querySelector('.day-name');
            const dayNumberEl = dayHeaders[i].querySelector('.day-number');
            
            if (dayNameEl) {
                dayNameEl.textContent = dayNames[currentDay.getDay()];
            }
            if (dayNumberEl) {
                dayNumberEl.textContent = currentDay.getDate();
            }
            
            // Add "today" class only if this day is today and we're in the current week
            const isToday = currentDay.toDateString() === today.toDateString();
            if (isToday) {
                dayHeaders[i].classList.add('today');
            } else {
                dayHeaders[i].classList.remove('today');
            }
        }
    }
    
    // Update day columns data attributes and filter events
    const dayColumns = document.querySelectorAll('.day-column');
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        
        if (dayColumns[i]) {
            dayColumns[i].setAttribute('data-day', dayNames[currentDay.getDay()].toLowerCase());
            
            // Filter events for this day
            const allEvents = dayColumns[i].querySelectorAll('.calendar-event');
            allEvents.forEach(event => {
                const eventOnclick = event.getAttribute('onclick');
                if (eventOnclick) {
                    // Extract the full date string from onclick (e.g., "Sunday, January 25, 6:00 PM")
                    const match = eventOnclick.match(/['"]([^'"]+)['"](?=[^'"]*$)/);
                    if (match) {
                        const dateStr = match[1];
                        // Extract month and day (e.g., "January 25" from "Sunday, January 25, 6:00 PM")
                        const dayMatch = dateStr.match(/(\w+)\s+(\d+)/);
                        
                        if (dayMatch) {
                            const monthName = dayMatch[1];
                            const dayNum = parseInt(dayMatch[2]);
                            const monthIndex = monthNames.indexOf(monthName);
                            
                            // Get the year from current day
                            const eventYear = currentDay.getFullYear();
                            const eventDate = new Date(eventYear, monthIndex, dayNum);
                            
                            // Compare with current day
                            if (eventDate.getDate() === currentDay.getDate() && 
                                eventDate.getMonth() === currentDay.getMonth() &&
                                eventDate.getFullYear() === currentDay.getFullYear()) {
                                event.style.display = 'flex';
                            } else {
                                event.style.display = 'none';
                            }
                        }
                    }
                }
            });
        }
    }
}

// Resources Functions
let currentLessonId = null;

function startLesson(lessonId) {
    currentLessonId = lessonId;
    
    const lessonData = {
        'algebra': { file: 'algebra-guide.txt', title: 'Algebra Essentials' },
        'geometry': { file: 'geometry-guide.txt', title: 'Geometry Fundamentals' },
        'biology': { file: 'biology-guide.txt', title: 'Biology Basics' },
        'chemistry': { file: 'chemistry-guide.txt', title: 'Chemistry Fundamentals' },
        'essay': { file: 'essay-guide.txt', title: 'Essay Writing' },
        'grammar': { file: 'grammar-guide.txt', title: 'Grammar Basics' },
        'history': { file: 'history-guide.txt', title: 'World History' },
        'us-history': { file: 'us-history-guide.txt', title: 'US History' }
    };
    
    const data = lessonData[lessonId];
    if (!data) {
        showToast('Lesson not available yet.');
        return;
    }
    
    document.getElementById('lessonTitle').textContent = data.title;
    
    fetch(`materials/${data.file}`)
        .then(response => response.text())
        .then(content => {
            document.getElementById('lessonContent').innerHTML = `<pre>${content}</pre>`;
            document.getElementById('lessonModal').style.display = 'block';
        })
        .catch(error => {
            document.getElementById('lessonContent').innerHTML = '<p>Error loading lesson content.</p>';
            document.getElementById('lessonModal').style.display = 'block';
        });
}

function completeLesson() {
    if (!currentLessonId) return;
    
    // Mark lesson as completed
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    if (!completedLessons.includes(currentLessonId)) {
        completedLessons.push(currentLessonId);
        localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    }
    
    // Update progress
    updateLessonProgress();
    
    // Update achievements
    const lessons = completedLessons.length;
    const quizzes = parseInt(localStorage.getItem('quizzes') || '0');
    const sessions = parseInt(localStorage.getItem('sessions') || '0');
    updateAchievements(lessons, quizzes, sessions);
    
    // Add activity
    addActivity(`Completed "${currentLessonId.replace('-', ' ')}" lesson`);
    
    showToast('Lesson completed!');
    closeModal();
}

function closeModal() {
    document.getElementById('lessonModal').style.display = 'none';
    currentLessonId = null;
}

function updateLessonProgress() {
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    
    // Update individual lesson status
    const lessons = [
        { id: 'algebra', statusId: 'algebra-status', btnId: 'algebra-btn' },
        { id: 'geometry', statusId: 'geometry-status', btnId: 'geometry-btn' },
        { id: 'biology', statusId: 'biology-status', btnId: 'biology-btn' },
        { id: 'chemistry', statusId: 'chemistry-status', btnId: 'chemistry-btn' },
        { id: 'essay', statusId: 'essay-status', btnId: 'essay-btn' },
        { id: 'grammar', statusId: 'grammar-status', btnId: 'grammar-btn' },
        { id: 'history', statusId: 'history-status', btnId: 'history-btn' },
        { id: 'us-history', statusId: 'us-history-status', btnId: 'us-history-btn' }
    ];
    
    lessons.forEach(lesson => {
        const statusEl = document.getElementById(lesson.statusId);
        const btnEl = document.getElementById(lesson.btnId);
        
        if (completedLessons.includes(lesson.id)) {
            if (statusEl) statusEl.textContent = '✓ Completed';
            if (btnEl) {
                btnEl.textContent = 'Review Lesson';
                btnEl.classList.add('completed');
            }
        } else {
            if (statusEl) statusEl.textContent = '';
            if (btnEl) {
                btnEl.textContent = 'Start Lesson';
                btnEl.classList.remove('completed');
            }
        }
    });
    
    // Update course progress
    const courses = {
        'math': { lessons: ['algebra', 'geometry'], progressId: 'math-progress', courseId: 'math-course' },
        'science': { lessons: ['biology', 'chemistry'], progressId: 'science-progress', courseId: 'science-course' },
        'english': { lessons: ['essay', 'grammar'], progressId: 'english-progress', courseId: 'english-course' },
        'history': { lessons: ['history', 'us-history'], progressId: 'history-progress', courseId: 'history-course' }
    };
    
    Object.keys(courses).forEach(courseKey => {
        const course = courses[courseKey];
        const completed = course.lessons.filter(lesson => completedLessons.includes(lesson)).length;
        const total = course.lessons.length;
        
        const progressEl = document.getElementById(course.progressId);
        if (progressEl) {
            progressEl.textContent = `${completed} / ${total} completed`;
        }
        
        const courseEl = document.getElementById(course.courseId);
        if (courseEl) {
            if (completed === total) {
                courseEl.classList.add('completed');
            } else {
                courseEl.classList.remove('completed');
            }
        }
    });
}

function checkQuiz(quizType) {
    const quizEl = document.getElementById(`${quizType}-quiz`);
    const resultEl = document.getElementById(`${quizType}-result`);
    
    if (!quizEl || !resultEl) return;
    
    const radios = quizEl.querySelectorAll('input[type="radio"]:checked');
    if (radios.length === 0) {
        resultEl.innerHTML = '<p>Please select an answer.</p>';
        return;
    }
    
    const answer = radios[0].value;
    let correct = false;
    let message = '';
    
    if (quizType === 'math' && answer === '2') {
        correct = true;
        message = 'Correct! 2x = 4, so x = 2.';
    } else if (quizType === 'science' && answer === 'cell') {
        correct = true;
        message = 'Correct! The cell is the basic unit of life.';
    } else {
        message = 'Incorrect. Try again!';
    }
    
    resultEl.innerHTML = `<p>${message}</p>`;
    
    if (correct) {
        // Increment quiz count
        const quizzes = parseInt(localStorage.getItem('quizzes') || '0') + 1;
        localStorage.setItem('quizzes', quizzes);
        updateAchievements();
        showToast('Quiz completed!');
    }
}

// Quiz Modal Functions
let currentQuizId = null;
let currentQuestionIndex = 0;
let quizAnswers = [];

function startQuiz(quizId) {
    currentQuizId = quizId;
    currentQuestionIndex = 0;
    quizAnswers = [];

    // Quiz data with multiple questions (up to 5 per quiz)
    const quizData = {
        'algebra': {
            title: 'Algebra Quiz',
            questions: [
                {
                    question: 'What is the value of x in the equation 2x + 3 = 7?',
                    options: ['2', '3', '4', '5'],
                    correct: 0
                },
                {
                    question: 'Solve for y: 3y - 5 = 13',
                    options: ['6', '7', '8', '9'],
                    correct: 0
                },
                {
                    question: 'What is the slope of the line y = 2x + 3?',
                    options: ['1', '2', '3', '4'],
                    correct: 1
                },
                {
                    question: 'Simplify: 2(x + 3) - x',
                    options: ['x + 3', 'x + 6', '3x + 3', 'x + 9'],
                    correct: 1
                },
                {
                    question: 'What is the solution to |x| = 5?',
                    options: ['x = 5', 'x = -5', 'x = ±5', 'x = 0'],
                    correct: 2
                }
            ]
        },
        'geometry': {
            title: 'Geometry Quiz',
            questions: [
                {
                    question: 'What is the sum of angles in a triangle?',
                    options: ['90°', '180°', '270°', '360°'],
                    correct: 1
                },
                {
                    question: 'What is the area of a circle with radius 5?',
                    options: ['25π', '10π', '15π', '20π'],
                    correct: 0
                },
                {
                    question: 'How many sides does a hexagon have?',
                    options: ['5', '6', '7', '8'],
                    correct: 1
                },
                {
                    question: 'What is the Pythagorean theorem?',
                    options: ['a² + b² = c²', 'a + b = c', 'a² - b² = c²', 'a × b = c²'],
                    correct: 0
                },
                {
                    question: 'What is the area of a rectangle with length 8 and width 5?',
                    options: ['13', '26', '40', '64'],
                    correct: 2
                }
            ]
        },
        'biology': {
            title: 'Biology Quiz',
            questions: [
                {
                    question: 'What is the powerhouse of the cell?',
                    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'],
                    correct: 1
                },
                {
                    question: 'What is the basic unit of life?',
                    options: ['Atom', 'Molecule', 'Cell', 'Tissue'],
                    correct: 2
                },
                {
                    question: 'Which organelle contains DNA?',
                    options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Vacuole'],
                    correct: 2
                },
                {
                    question: 'What process do plants use to make food?',
                    options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Digestion'],
                    correct: 1
                },
                {
                    question: 'What is the function of red blood cells?',
                    options: ['Fight infection', 'Carry oxygen', 'Clot blood', 'Produce antibodies'],
                    correct: 1
                }
            ]
        },
        'chemistry': {
            title: 'Chemistry Quiz',
            questions: [
                {
                    question: 'What is the chemical symbol for water?',
                    options: ['H2O', 'CO2', 'O2', 'NaCl'],
                    correct: 0
                },
                {
                    question: 'What is the atomic number of carbon?',
                    options: ['4', '6', '8', '12'],
                    correct: 1
                },
                {
                    question: 'What type of bond shares electrons?',
                    options: ['Ionic', 'Covalent', 'Hydrogen', 'Metallic'],
                    correct: 1
                },
                {
                    question: 'What is the pH of pure water?',
                    options: ['0', '7', '14', '1'],
                    correct: 1
                },
                {
                    question: 'What is the chemical formula for table salt?',
                    options: ['H2O', 'CO2', 'NaCl', 'HCl'],
                    correct: 2
                }
            ]
        },
        'grammar': {
            title: 'Grammar Quiz',
            questions: [
                {
                    question: 'Which sentence is grammatically correct?',
                    options: ['She don\'t like apples.', 'She doesn\'t likes apples.', 'She doesn\'t like apples.', 'She don\'t likes apples.'],
                    correct: 2
                },
                {
                    question: 'What is the plural of "child"?',
                    options: ['Childs', 'Childen', 'Children', 'Childes'],
                    correct: 2
                },
                {
                    question: 'Choose the correct preposition: "I am interested ___ mathematics."',
                    options: ['at', 'in', 'on', 'with'],
                    correct: 1
                },
                {
                    question: 'What is the past tense of "go"?',
                    options: ['Went', 'Gone', 'Going', 'Goes'],
                    correct: 0
                },
                {
                    question: 'Which word is a synonym for "happy"?',
                    options: ['Sad', 'Joyful', 'Angry', 'Tired'],
                    correct: 1
                }
            ]
        },
        'literature': {
            title: 'Literature Quiz',
            questions: [
                {
                    question: 'Who wrote "Romeo and Juliet"?',
                    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
                    correct: 1
                },
                {
                    question: 'What is the genre of "Pride and Prejudice"?',
                    options: ['Science Fiction', 'Romance', 'Mystery', 'Horror'],
                    correct: 1
                },
                {
                    question: 'What is a metaphor?',
                    options: ['A comparison using "like" or "as"', 'A direct comparison', 'A story about animals', 'A type of poem'],
                    correct: 1
                },
                {
                    question: 'Who is the author of "To Kill a Mockingbird"?',
                    options: ['Harper Lee', 'J.K. Rowling', 'Stephen King', 'Ernest Hemingway'],
                    correct: 0
                },
                {
                    question: 'What is the main theme of "1984"?',
                    options: ['Love', 'Totalitarianism', 'Adventure', 'Friendship'],
                    correct: 1
                }
            ]
        },
        'world-history': {
            title: 'World History Quiz',
            questions: [
                {
                    question: 'In which year did World War II end?',
                    options: ['1944', '1945', '1946', '1947'],
                    correct: 1
                },
                {
                    question: 'Who was the first President of the United States?',
                    options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'],
                    correct: 2
                },
                {
                    question: 'What ancient civilization built the pyramids?',
                    options: ['Romans', 'Greeks', 'Egyptians', 'Mayans'],
                    correct: 2
                },
                {
                    question: 'The Renaissance began in which country?',
                    options: ['France', 'England', 'Italy', 'Spain'],
                    correct: 2
                },
                {
                    question: 'What was the main cause of World War I?',
                    options: ['Assassination of Archduke Franz Ferdinand', 'Economic depression', 'Religious conflict', 'Colonial expansion'],
                    correct: 0
                }
            ]
        },
        'us-history': {
            title: 'US History Quiz',
            questions: [
                {
                    question: 'In which year was the Declaration of Independence signed?',
                    options: ['1775', '1776', '1777', '1778'],
                    correct: 1
                },
                {
                    question: 'Who was the first president of the United States?',
                    options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'James Madison'],
                    correct: 2
                },
                {
                    question: 'What was the main cause of the American Civil War?',
                    options: ['Taxes', 'Slavery', 'Land disputes', 'Religious differences'],
                    correct: 1
                },
                {
                    question: 'In which year did the United States enter World War II?',
                    options: ['1939', '1940', '1941', '1942'],
                    correct: 2
                },
                {
                    question: 'Who wrote the Gettysburg Address?',
                    options: ['Abraham Lincoln', 'Ulysses S. Grant', 'Robert E. Lee', 'Jefferson Davis'],
                    correct: 0
                }
            ]
        }
    };

    const quiz = quizData[quizId];
    if (!quiz) {
        showToast('Quiz not available yet.');
        return;
    }

    // Set quiz title
    document.getElementById('quizTitle').textContent = quiz.title;

    // Show first question
    showQuestion(quiz, 0);

    // Show modal
    document.getElementById('quizModal').style.display = 'block';
}

function showQuestion(quiz, index) {
    const question = quiz.questions[index];

    // Update question content
    document.getElementById('quizQuestion').textContent = question.question;

    // Update options
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = question.options.map((option, i) =>
        `<label class="quiz-option">
            <input type="radio" name="quiz-option" value="${i}" ${quizAnswers[index] !== undefined && quizAnswers[index] === i ? 'checked' : ''}>
            <span class="option-text">${option}</span>
        </label>`
    ).join('');

    // Update navigation
    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');
    const submitBtn = document.getElementById('submitQuiz');

    prevBtn.style.display = index > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = index < quiz.questions.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = index === quiz.questions.length - 1 ? 'inline-block' : 'none';

    // Update question counter
    document.getElementById('questionCounter').textContent = `Question ${index + 1} of ${quiz.questions.length}`;
}

function nextQuestion() {
    // Save current answer
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    if (selectedOption) {
        quizAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    }

    // Move to next question
    currentQuestionIndex++;
    const quizData = getCurrentQuizData();
    showQuestion(quizData, currentQuestionIndex);
}

function prevQuestion() {
    // Save current answer
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    if (selectedOption) {
        quizAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    }

    // Move to previous question
    currentQuestionIndex--;
    const quizData = getCurrentQuizData();
    showQuestion(quizData, currentQuestionIndex);
}

function submitQuizAnswer() {
    // Save final answer
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    if (selectedOption) {
        quizAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    }

    // Calculate score
    const quizData = getCurrentQuizData();
    let correctAnswers = 0;

    quizData.questions.forEach((question, index) => {
        if (quizAnswers[index] === question.correct) {
            correctAnswers++;
        }
    });

    const score = Math.round((correctAnswers / quizData.questions.length) * 100);

    // Show results
    const resultDiv = document.getElementById('quizResult');
    const questionContainer = document.getElementById('quizQuestionContainer');
    const navigation = document.getElementById('quizNavigation');

    // Hide question and navigation
    questionContainer.style.display = 'none';
    navigation.style.display = 'none';

    // Show results
    resultDiv.innerHTML = `
        <div class="quiz-results ${score >= 70 ? 'correct' : 'incorrect'}">
            <h3>Quiz Complete!</h3>
            <div class="score-display">
                <div class="score-circle ${score >= 70 ? 'pass' : 'fail'}">
                    ${score}%
                </div>
                <p>You got ${correctAnswers} out of ${quizData.questions.length} questions correct.</p>
            </div>
            <div class="result-message">
                ${score >= 90 ? 'Excellent work! 🎉' :
                  score >= 70 ? 'Good job! Keep practicing.' :
                  'Keep studying and try again! 📚'}
            </div>
        </div>
    `;
    resultDiv.style.display = 'block';

    // Mark as completed if passed
    if (score >= 70) {
        const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
        if (!completedQuizzes.includes(currentQuizId)) {
            completedQuizzes.push(currentQuizId);
            localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
        }

        // Increment quiz count
        const quizzes = parseInt(localStorage.getItem('quizzes') || '0') + 1;
        localStorage.setItem('quizzes', quizzes);

        updateQuizProgress();
        updateAchievements();
        addActivity(`Completed "${quizData.title}" with ${score}%`);
    }

    // Add close button after delay
    setTimeout(() => {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn';
        closeBtn.textContent = 'Close Quiz';
        closeBtn.onclick = closeQuizModal;
        resultDiv.appendChild(closeBtn);
    }, 2000);
}

function getCurrentQuizData() {
    const quizData = {
        'algebra': {
            title: 'Algebra Quiz',
            questions: [
                { question: 'What is the value of x in the equation 2x + 3 = 7?', options: ['2', '3', '4', '5'], correct: 0 },
                { question: 'Solve for y: 3y - 5 = 13', options: ['6', '7', '8', '9'], correct: 0 },
                { question: 'What is the slope of the line y = 2x + 3?', options: ['1', '2', '3', '4'], correct: 1 },
                { question: 'Simplify: 2(x + 3) - x', options: ['x + 3', 'x + 6', '3x + 3', 'x + 9'], correct: 1 },
                { question: 'What is the solution to |x| = 5?', options: ['x = 5', 'x = -5', 'x = ±5', 'x = 0'], correct: 2 }
            ]
        },
        'geometry': {
            title: 'Geometry Quiz',
            questions: [
                { question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correct: 1 },
                { question: 'What is the area of a circle with radius 5?', options: ['25π', '10π', '15π', '20π'], correct: 0 },
                { question: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], correct: 1 },
                { question: 'What is the Pythagorean theorem?', options: ['a² + b² = c²', 'a + b = c', 'a² - b² = c²', 'a × b = c²'], correct: 0 },
                { question: 'What is the area of a rectangle with length 8 and width 5?', options: ['13', '26', '40', '64'], correct: 2 }
            ]
        },
        'biology': {
            title: 'Biology Quiz',
            questions: [
                { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'], correct: 1 },
                { question: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Tissue'], correct: 2 },
                { question: 'Which organelle contains DNA?', options: ['Ribosome', 'Mitochondria', 'Nucleus', 'Vacuole'], correct: 2 },
                { question: 'What process do plants use to make food?', options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Digestion'], correct: 1 },
                { question: 'What is the function of red blood cells?', options: ['Fight infection', 'Carry oxygen', 'Clot blood', 'Produce antibodies'], correct: 1 }
            ]
        },
        'chemistry': {
            title: 'Chemistry Quiz',
            questions: [
                { question: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'O2', 'NaCl'], correct: 0 },
                { question: 'What is the atomic number of carbon?', options: ['4', '6', '8', '12'], correct: 1 },
                { question: 'What type of bond shares electrons?', options: ['Ionic', 'Covalent', 'Hydrogen', 'Metallic'], correct: 1 },
                { question: 'What is the pH of pure water?', options: ['0', '7', '14', '1'], correct: 1 },
                { question: 'What is the chemical formula for table salt?', options: ['H2O', 'CO2', 'NaCl', 'HCl'], correct: 2 }
            ]
        },
        'grammar': {
            title: 'Grammar Quiz',
            questions: [
                { question: 'Which sentence is grammatically correct?', options: ['She don\'t like apples.', 'She doesn\'t likes apples.', 'She doesn\'t like apples.', 'She don\'t likes apples.'], correct: 2 },
                { question: 'What is the plural of "child"?', options: ['Childs', 'Childen', 'Children', 'Childes'], correct: 2 },
                { question: 'Choose the correct preposition: "I am interested ___ mathematics."', options: ['at', 'in', 'on', 'with'], correct: 1 },
                { question: 'What is the past tense of "go"?', options: ['Went', 'Gone', 'Going', 'Goes'], correct: 0 },
                { question: 'Which word is a synonym for "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correct: 1 }
            ]
        },
        'literature': {
            title: 'Literature Quiz',
            questions: [
                { question: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correct: 1 },
                { question: 'What is the genre of "Pride and Prejudice"?', options: ['Science Fiction', 'Romance', 'Mystery', 'Horror'], correct: 1 },
                { question: 'What is a metaphor?', options: ['A comparison using "like" or "as"', 'A direct comparison', 'A story about animals', 'A type of poem'], correct: 1 },
                { question: 'Who is the author of "To Kill a Mockingbird"?', options: ['Harper Lee', 'J.K. Rowling', 'Stephen King', 'Ernest Hemingway'], correct: 0 },
                { question: 'What is the main theme of "1984"?', options: ['Love', 'Totalitarianism', 'Adventure', 'Friendship'], correct: 1 }
            ]
        },
        'world-history': {
            title: 'World History Quiz',
            questions: [
                { question: 'In which year did World War II end?', options: ['1944', '1945', '1946', '1947'], correct: 1 },
                { question: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'], correct: 2 },
                { question: 'What ancient civilization built the pyramids?', options: ['Romans', 'Greeks', 'Egyptians', 'Mayans'], correct: 2 },
                { question: 'The Renaissance began in which country?', options: ['France', 'England', 'Italy', 'Spain'], correct: 2 },
                { question: 'What was the main cause of World War I?', options: ['Assassination of Archduke Franz Ferdinand', 'Economic depression', 'Religious conflict', 'Colonial expansion'], correct: 0 }
            ]
        },
        'us-history': {
            title: 'US History Quiz',
            questions: [
                { question: 'In which year was the Declaration of Independence signed?', options: ['1775', '1776', '1777', '1778'], correct: 1 },
                { question: 'Who was the first president of the United States?', options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'James Madison'], correct: 2 },
                { question: 'What was the main cause of the American Civil War?', options: ['Taxes', 'Slavery', 'Land disputes', 'Religious differences'], correct: 1 },
                { question: 'In which year did the United States enter World War II?', options: ['1939', '1940', '1941', '1942'], correct: 2 },
                { question: 'Who wrote the Gettysburg Address?', options: ['Abraham Lincoln', 'Ulysses S. Grant', 'Robert E. Lee', 'Jefferson Davis'], correct: 0 }
            ]
        }
    };
    return quizData[currentQuizId];
}

function closeQuizModal() {
    document.getElementById('quizModal').style.display = 'none';
    document.getElementById('quizQuestionContainer').style.display = 'block';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizNavigation').style.display = 'flex';
    currentQuizId = null;
    currentQuestionIndex = 0;
    quizAnswers = [];
}

function updateQuizProgress() {
    const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');

    // Update individual quiz status
    const quizStatus = {
        'algebra': 'algebra-quiz-status',
        'geometry': 'geometry-quiz-status',
        'biology': 'biology-quiz-status',
        'chemistry': 'chemistry-quiz-status',
        'grammar': 'grammar-quiz-status',
        'literature': 'literature-quiz-status',
        'world-history': 'world-history-quiz-status',
        'us-history': 'us-history-quiz-status'
    };

    const quizBtns = {
        'algebra': 'algebra-quiz-btn',
        'geometry': 'geometry-quiz-btn',
        'biology': 'biology-quiz-btn',
        'chemistry': 'chemistry-quiz-btn',
        'grammar': 'grammar-quiz-btn',
        'literature': 'literature-quiz-btn',
        'world-history': 'world-history-quiz-btn',
        'us-history': 'us-history-quiz-btn'
    };

    Object.keys(quizStatus).forEach(quizId => {
        const statusEl = document.getElementById(quizStatus[quizId]);
        const btnEl = document.getElementById(quizBtns[quizId]);

        if (completedQuizzes.includes(quizId)) {
            if (statusEl) statusEl.textContent = '✓ Completed';
            if (btnEl) {
                btnEl.textContent = 'Retake Quiz';
                btnEl.classList.add('completed');
            }
        } else {
            if (statusEl) statusEl.textContent = '';
            if (btnEl) {
                btnEl.textContent = 'Take Quiz';
                btnEl.classList.remove('completed');
            }
        }
    });

    // Update course progress
    const quizCourses = {
        'math-quiz': { quizzes: ['algebra', 'geometry'], progressId: 'math-quiz-progress', courseId: 'math-quiz-course' },
        'science-quiz': { quizzes: ['biology', 'chemistry'], progressId: 'science-quiz-progress', courseId: 'science-quiz-course' },
        'english-quiz': { quizzes: ['grammar', 'literature'], progressId: 'english-quiz-progress', courseId: 'english-quiz-course' },
        'history-quiz': { quizzes: ['world-history', 'us-history'], progressId: 'history-quiz-progress', courseId: 'history-quiz-course' }
    };

    Object.keys(quizCourses).forEach(courseKey => {
        const course = quizCourses[courseKey];
        const completed = course.quizzes.filter(quiz => completedQuizzes.includes(quiz)).length;
        const total = course.quizzes.length;

        const progressEl = document.getElementById(course.progressId);
        if (progressEl) {
            progressEl.textContent = `${completed} / ${total} completed`;
        }

        const courseEl = document.getElementById(course.courseId);
        if (courseEl) {
            if (completed === total) {
                courseEl.classList.add('completed');
            } else {
                courseEl.classList.remove('completed');
            }
        }
    });
}

function startTimer() {
    showToast('Timer feature coming soon!');
}

function openNotes() {
    showToast('Notes feature coming soon!');
}



// Tab switching
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// Code Playground
function openCodePlayground() {
    document.getElementById('codePlayground').style.display = 'block';
}

function closeCodePlayground() {
    document.getElementById('codePlayground').style.display = 'none';
}

function runCode() {
    const html = document.getElementById('htmlCode').value;
    const css = document.getElementById('cssCode').value;
    const js = document.getElementById('jsCode').value;

    const outputFrame = document.getElementById('outputFrame');
    const outputDoc = outputFrame.contentDocument || outputFrame.contentWindow.document;

    outputDoc.open();
    outputDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${js}</script>
        </body>
        </html>
    `);
    outputDoc.close();
}

// Calculator
let calcDisplay = '';
let calcResult = 0;
let calcOperator = '';
let scientificMode = false;

function toggleScientific() {
    scientificMode = !scientificMode;
    const basicButtons = document.getElementById('basicButtons');
    const scientificButtons = document.getElementById('scientificButtons');
    const sciToggle = document.querySelector('.sci-toggle');
    
    if (scientificMode) {
        basicButtons.style.display = 'none';
        scientificButtons.style.display = 'grid';
        if (sciToggle) sciToggle.textContent = 'Basic';
    } else {
        basicButtons.style.display = 'grid';
        scientificButtons.style.display = 'none';
        if (sciToggle) sciToggle.textContent = 'Scientific';
    }
}

function toggleCalculator() {
    const calc = document.getElementById('calculator');
    if (calc) {
        calc.style.display = calc.style.display === 'block' ? 'none' : 'block';
    }
}

function calcPress(value) {
    const display = document.getElementById('calcDisplay');

    if (value === 'C') {
        calcDisplay = '';
        calcResult = 0;
        calcOperator = '';
        display.textContent = '0';
        return;
    }

    if (value === '=') {
        if (calcDisplay) {
            try {
                // Replace mathematical functions with JavaScript equivalents
                let expression = calcDisplay
                    .replace(/sin\(/g, 'Math.sin(')
                    .replace(/cos\(/g, 'Math.cos(')
                    .replace(/tan\(/g, 'Math.tan(')
                    .replace(/sqrt\(/g, 'Math.sqrt(')
                    .replace(/log\(/g, 'Math.log10(')
                    .replace(/ln\(/g, 'Math.log(')
                    .replace(/\^/g, '**');
                
                // Evaluate the expression
                calcResult = eval(expression);
                display.textContent = calcResult;
                calcDisplay = calcResult.toString();
                calcOperator = '';
            } catch (e) {
                display.textContent = 'Error';
                calcDisplay = '';
            }
        }
        return;
    }

    if (['+', '-', '*', '/', '^'].includes(value)) {
        if (calcDisplay && !calcDisplay.endsWith('(')) {
            calcOperator = value;
            calcDisplay += value;
            display.textContent = calcDisplay;
        } else if (!calcDisplay) {
            calcDisplay = '0' + value;
            display.textContent = calcDisplay;
        }
        return;
    }

    if (value === '(' || value === ')') {
        calcDisplay += value;
        display.textContent = calcDisplay;
        return;
    }

    if (value.includes('sin') || value.includes('cos') || value.includes('tan') || 
        value.includes('sqrt') || value.includes('log') || value.includes('ln')) {
        calcDisplay += value;
        display.textContent = calcDisplay;
        return;
    }

    calcDisplay += value;
    display.textContent = calcDisplay;
}

function calcFactorial() {
    try {
        if (calcDisplay) {
            const num = parseInt(calcDisplay);
            if (num < 0) {
                document.getElementById('calcDisplay').textContent = 'Error';
                return;
            }
            let result = 1;
            for (let i = 2; i <= num; i++) {
                result *= i;
            }
            document.getElementById('calcDisplay').textContent = result;
            calcDisplay = result.toString();
        }
    } catch (e) {
        document.getElementById('calcDisplay').textContent = 'Error';
    }
}

function calculate(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 0;
        default: return b;
    }
}

// Reset function
function resetAll() {
    localStorage.clear();
    location.reload();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadProgress();
    updateActivityList();
    updateLessonProgress();
    updateQuizProgress();
    
    // Initialize week display for schedule page
    if (document.querySelector('.calendar-wrapper')) {
        updateWeekDisplay();
    }
    
    // Start tracking study time
    startStudyTimeTracking();

    // Add event listeners
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll);
    }

    // Tab event listeners for resources page
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });

    // Filter event listeners for schedule page
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterSessions(filter);
        });
    });

    // Pill filter event listeners
    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterSessions(filter, this);
        });
    });

    // Calendar navigation event listeners
    const prevWeekBtn = document.querySelector('[onclick="previousWeek()"]');
    const nextWeekBtn = document.querySelector('[onclick="nextWeek()"]');
    const todayBtn = document.querySelector('[onclick="goToToday()"]');
    
    if (prevWeekBtn) {
        prevWeekBtn.onclick = previousWeek;
    }
    if (nextWeekBtn) {
        nextWeekBtn.onclick = nextWeek;
    }
    if (todayBtn) {
        todayBtn.onclick = goToToday;
    }

    // Initialize month view by default
    switchView('month');

    // Request notification permission
    requestNotificationPermission();
    
    // Set up reminder checking every minute
    setInterval(checkReminders, 60000);
    
    // Also check immediately on load
    checkReminders();

    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.feature-card, .subject-card, .session-card, .resource-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });

    // Schedule page specific functionality
    if (window.location.pathname.includes('schedule.html')) {
        initializeSchedulePage();
    }
});

// Ensure lesson progress is updated when page becomes visible (e.g., from cache)
window.addEventListener('pageshow', () => {
    updateLessonProgress();
    updateQuizProgress();
});

// Floating Calculator Functions
function toggleFloatingCalc() {
    const floatingCalc = document.getElementById('floatingCalc');
    floatingCalc.classList.toggle('active');
}

function closeFloatingCalc() {
    const floatingCalc = document.getElementById('floatingCalc');
    floatingCalc.classList.remove('active');
}

// Study Time Tracking
function startStudyTimeTracking() {
    sessionStartTime = Date.now();
    isPageVisible = !document.hidden;
    
    // Track when user leaves or closes the page
    window.addEventListener('beforeunload', saveStudyTime);
    
    // Track when user switches tabs
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Save study time every minute as a backup
    setInterval(saveStudyTime, 60000);
}

function handleVisibilityChange() {
    if (document.hidden) {
        // User switched away - save current session time
        saveStudyTime();
        isPageVisible = false;
    } else {
        // User came back - restart timer
        sessionStartTime = Date.now();
        isPageVisible = true;
    }
}

function saveStudyTime() {
    if (!sessionStartTime || !isPageVisible) return;
    
    const now = Date.now();
    const sessionDuration = Math.floor((now - sessionStartTime) / 1000 / 60); // Convert to minutes
    
    if (sessionDuration > 0) {
        const currentMinutes = parseInt(localStorage.getItem('studyMinutes') || '0');
        const newMinutes = currentMinutes + sessionDuration;
        localStorage.setItem('studyMinutes', newMinutes);
        
        // Reset session start time
        sessionStartTime = now;
        
        // Update display if on dashboard
        const hoursElement = document.getElementById('hoursCount');
        if (hoursElement) {
            const hours = Math.floor(newMinutes / 60);
            hoursElement.textContent = hours;
        }
    }
}

// New Schedule Page Functions
function initializeSchedulePage() {
    // Initialize filter pills
    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterSessionCards(filter, this);
        });
    });

    // Initialize view toggle buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            switchSessionView(view, this);
        });
    });

    // Initialize sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortSessionCards(this.value);
        });
    }
}

function filterSessionCards(category, button) {
    const sessionCards = document.querySelectorAll('.session-card');
    
    // Update button styles
    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
    
    // Filter cards
    sessionCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'grid';
            setTimeout(() => card.classList.add('fade-in'), 10);
        } else {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        }
    });
}

function switchSessionView(view, button) {
    const sessionsList = document.querySelector('.sessions-list');
    const dayGroups = document.querySelectorAll('.session-day-group');
    
    // Update button styles
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
    
    // Filter day groups based on view
    dayGroups.forEach((group, index) => {
        if (view === 'today') {
            // Show only first group (Today)
            group.style.display = index === 0 ? 'flex' : 'none';
        } else if (view === 'week') {
            // Show only second group (This Week)
            group.style.display = index === 1 ? 'flex' : 'none';
        } else {
            // Show all (Upcoming)
            group.style.display = 'flex';
        }
    });
}

function sortSessionCards(sortType) {
    const sessionsList = document.querySelector('.sessions-list');
    const allCards = Array.from(document.querySelectorAll('.session-card'));
    
    allCards.sort((a, b) => {
        if (sortType === 'time') {
            const timeA = a.querySelector('.time-main').textContent;
            const timeB = b.querySelector('.time-main').textContent;
            return timeA.localeCompare(timeB);
        } else if (sortType === 'subject') {
            const categoryA = a.dataset.category || '';
            const categoryB = b.dataset.category || '';
            return categoryA.localeCompare(categoryB);
        } else if (sortType === 'level') {
            const levelA = a.querySelector('.meta-item:nth-of-type(2)')?.textContent || '';
            const levelB = b.querySelector('.meta-item:nth-of-type(2)')?.textContent || '';
            return levelA.localeCompare(levelB);
        }
        return 0;
    });
    
    // Re-insert sorted cards back into their groups
    allCards.forEach(card => {
        const parentGroup = card.parentElement;
        if (parentGroup) {
            parentGroup.appendChild(card);
        }
    });
}