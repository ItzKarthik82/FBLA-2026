let editingSession = null;

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

    const sessionDate = new Date(time);
    const hours = sessionDate.getHours();
    const minutes = sessionDate.getMinutes();

    const isEditing = editingSession !== null;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayAbbrev = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthAbbrev = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = dayNames[sessionDate.getDay()];
    const dayShort = dayAbbrev[sessionDate.getDay()];
    const monthName = monthNames[sessionDate.getMonth()];
    const monthShort = monthAbbrev[sessionDate.getMonth()];
    const dayNum = sessionDate.getDate();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
    const dateStr = `${dayShort}, ${monthShort} ${dayNum}`;
    const fullDateTimeStr = `${dayName}, ${monthName} ${dayNum}, ${timeStr}`;

    const sessions = JSON.parse(localStorage.getItem('customSessions') || '[]');

    if (isEditing) {
        const editIndex = sessions.findIndex(s =>
            s.title === editingSession.title && s.dateTime === editingSession.dateTime
        );
        if (editIndex > -1) {
            sessions.splice(editIndex, 1);
        }
    }

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

    const sessionsList = document.querySelector('.sessions-list');
    if (sessionsList) {
        let customGroup = document.querySelector('.session-day-group[data-custom="true"]');
        if (!customGroup) {
            customGroup = document.createElement('div');
            customGroup.className = 'session-day-group';
            customGroup.setAttribute('data-custom', 'true');
            customGroup.innerHTML = '<div class="day-header-banner"><h3>Your Sessions</h3></div>';
            sessionsList.appendChild(customGroup);
        }

        const sessionCard = document.createElement('div');
        sessionCard.className = `session-card ${category}`;
        sessionCard.setAttribute('data-category', category);
        sessionCard.setAttribute('data-custom', 'true');

        sessionCard.innerHTML = `
            <div class="session-time-badge">
                <div class="time-icon"></div>
                <div class="time-info">
                    <span class="time-main">${dateStr}, ${timeStr}</span>
                    <span class="time-duration">60 min</span>
                </div>
            </div>
            <div class="session-content">
                <div class="session-header">
                    <h4>${title}</h4>
                    <span class="session-badge ${category}-badge">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </div>
                <div class="session-meta">
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        ${host}
                    </span>
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                        ${level}
                    </span>
                    <span class="meta-item participants">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        You're hosting
                    </span>
                </div>
                <p class="session-description">Your custom study session</p>
            </div>
            <div class="session-actions">
                <button class="session-join-btn" onclick="joinSession('${title}', '${meetingLink}', '${host}', '${level}', '${fullDateTimeStr}')">
                    View Details →
                </button>
                <button class="session-edit-btn" onclick="editCustomSession('${title}', '${fullDateTimeStr}', '${host}', '${time}', '${category}', '${level}', '${meetingLink}')">
                    ✏️ Edit
                </button>
                <button class="session-delete-btn" onclick="deleteCustomSession('${title}', '${fullDateTimeStr}')">
                    🗑️ Delete
                </button>
            </div>
        `;

        customGroup.appendChild(sessionCard);
    }

    const activeSubjectBtn = document.querySelector('.pill-btn.active');
    if (activeSubjectBtn) {
        const activeCategory = activeSubjectBtn.dataset.filter;
        filterSessionCards(activeCategory, activeSubjectBtn);
    }

    const activeViewBtn = document.querySelector('.view-btn.active');
    if (activeViewBtn) {
        const activeView = activeViewBtn.dataset.view;
        switchSessionView(activeView, activeViewBtn);
    }

    const actionText = isEditing ? 'updated' : 'added';
    showToast(`Session ${actionText} successfully!`);
    document.getElementById('hostForm').reset();
}

function editCustomSession(title, fullDateTimeStr, host, timeInput, category, level, meetingLink) {
    document.getElementById('editSessionTitle').value = title;
    document.getElementById('editSessionHost').value = host;
    document.getElementById('editSessionTime').value = timeInput;
    document.getElementById('editSessionCategory').value = category;
    document.getElementById('editSessionLevel').value = level;
    document.getElementById('editMeetingLink').value = meetingLink;

    editingSession = {
        title: title,
        dateTime: fullDateTimeStr,
        timeInput: timeInput
    };

    document.getElementById('editSessionModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editSessionModal').style.display = 'none';
    editingSession = null;
}

function saveEditedSession() {
    const title = document.getElementById('editSessionTitle').value;
    const host = document.getElementById('editSessionHost').value;
    const time = document.getElementById('editSessionTime').value;
    const category = document.getElementById('editSessionCategory').value;
    const level = document.getElementById('editSessionLevel').value;
    const meetingLink = document.getElementById('editMeetingLink').value || '';

    if (!title || !host || !time) {
        showToast('Please fill in all fields');
        return;
    }

    const sessionDate = new Date(time);
    const hours = sessionDate.getHours();
    const minutes = sessionDate.getMinutes();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayAbbrev = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthAbbrev = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = dayNames[sessionDate.getDay()];
    const dayShort = dayAbbrev[sessionDate.getDay()];
    const monthName = monthNames[sessionDate.getMonth()];
    const monthShort = monthAbbrev[sessionDate.getMonth()];
    const dayNum = sessionDate.getDate();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
    const dateStr = `${dayShort}, ${monthShort} ${dayNum}`;
    const fullDateTimeStr = `${dayName}, ${monthName} ${dayNum}, ${timeStr}`;

    const sessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
    const filteredSessions = sessions.filter(s => !(s.title === editingSession.title && s.dateTime === editingSession.dateTime));

    filteredSessions.push({
        title: title,
        host: host,
        dateTime: fullDateTimeStr,
        category: category,
        level: level,
        meetingLink: meetingLink,
        date: sessionDate.toISOString()
    });

    localStorage.setItem('customSessions', JSON.stringify(filteredSessions));

    const sessionsList = document.querySelector('.sessions-list');
    if (sessionsList) {
        const cards = sessionsList.querySelectorAll('.session-card[data-custom="true"]');
        cards.forEach(card => {
            const h4 = card.querySelector('h4');
            if (h4 && h4.textContent === editingSession.title) {
                card.remove();
            }
        });
    }

    closeEditModal();
    editingSession = null;

    if (sessionsList) {
        let customGroup = document.querySelector('.session-day-group[data-custom="true"]');
        if (!customGroup) {
            customGroup = document.createElement('div');
            customGroup.className = 'session-day-group';
            customGroup.setAttribute('data-custom', 'true');
            customGroup.innerHTML = '<div class="day-header-banner"><h3>Your Sessions</h3></div>';
            sessionsList.appendChild(customGroup);
        }

        const sessionCard = document.createElement('div');
        sessionCard.className = `session-card ${category}`;
        sessionCard.setAttribute('data-category', category);
        sessionCard.setAttribute('data-custom', 'true');

        sessionCard.innerHTML = `
            <div class="session-time-badge">
                <div class="time-icon"></div>
                <div class="time-info">
                    <span class="time-main">${dateStr}, ${timeStr}</span>
                    <span class="time-duration">60 min</span>
                </div>
            </div>
            <div class="session-content">
                <div class="session-header">
                    <h4>${title}</h4>
                    <span class="session-badge ${category}-badge">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </div>
                <div class="session-meta">
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        ${host}
                    </span>
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                        ${level}
                    </span>
                    <span class="meta-item participants">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        You're hosting
                    </span>
                </div>
                <p class="session-description">Your custom study session</p>
            </div>
            <div class="session-actions">
                <button class="session-join-btn" onclick="joinSession('${title}', '${meetingLink}', '${host}', '${level}', '${fullDateTimeStr}')">
                    View Details →
                </button>
                <button class="session-edit-btn" onclick="editCustomSession('${title}', '${fullDateTimeStr}', '${host}', '${time}', '${category}', '${level}', '${meetingLink}')">
                    ✏️ Edit
                </button>
                <button class="session-delete-btn" onclick="deleteCustomSession('${title}', '${fullDateTimeStr}')">
                    🗑️ Delete
                </button>
            </div>
        `;

        customGroup.appendChild(sessionCard);
    }

    const activeSubjectBtn = document.querySelector('.pill-btn.active');
    if (activeSubjectBtn) {
        const activeCategory = activeSubjectBtn.dataset.filter;
        filterSessionCards(activeCategory, activeSubjectBtn);
    }

    const activeViewBtn = document.querySelector('.view-btn.active');
    if (activeViewBtn) {
        const activeView = activeViewBtn.dataset.view;
        switchSessionView(activeView, activeViewBtn);
    }

    showToast('Session updated successfully!');
}

function deleteCustomSession(title, fullDateTimeStr) {
    if (!confirm('Are you sure you want to delete this session?')) {
        return;
    }

    const sessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
    const updatedSessions = sessions.filter(s => !(s.title === title && s.dateTime === fullDateTimeStr));
    localStorage.setItem('customSessions', JSON.stringify(updatedSessions));

    const sessionsList = document.querySelector('.sessions-list');
    if (sessionsList) {
        const cards = sessionsList.querySelectorAll('.session-card[data-custom="true"]');
        cards.forEach(card => {
            const h4 = card.querySelector('h4');
            const timeMain = card.querySelector('.time-main');
            if (h4 && timeMain && h4.textContent === title && timeMain.textContent.includes(fullDateTimeStr.split(',')[1])) {
                card.remove();
            }
        });

        const customGroup = document.querySelector('.session-day-group[data-custom="true"]');
        if (customGroup && customGroup.querySelectorAll('.session-card').length === 0) {
            customGroup.remove();
        }
    }

    const activeSubjectBtn = document.querySelector('.pill-btn.active');
    if (activeSubjectBtn) {
        const activeCategory = activeSubjectBtn.dataset.filter;
        filterSessionCards(activeCategory, activeSubjectBtn);
    }

    const activeViewBtn = document.querySelector('.view-btn.active');
    if (activeViewBtn) {
        const activeView = activeViewBtn.dataset.view;
        switchSessionView(activeView, activeViewBtn);
    }

    showToast('Session deleted successfully!');
}

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
        interested.splice(index, 1);
        button.textContent = '🤍 Mark Interested';
        button.classList.remove('interested');
        showToast('Removed from interested sessions');
    } else {
        interested.push({ id: sessionId, title: sessionTitle, dateTime: dateTime });
        button.textContent = '❤️ Interested';
        button.classList.add('interested');
        showToast('✅ Added to interested sessions - you will get a reminder 15 minutes before!');
        setupReminder(sessionId, sessionTitle, dateTime);
    }

    localStorage.setItem('interestedSessions', JSON.stringify(interested));
}

function setupReminder(sessionId, sessionTitle, dateTime) {
    const reminders = JSON.parse(localStorage.getItem('sessionReminders') || '{}');
    reminders[sessionId] = { title: sessionTitle, dateTime: dateTime, set: true, notified: false };
    localStorage.setItem('sessionReminders', JSON.stringify(reminders));
}

function checkReminders() {
    const reminders = JSON.parse(localStorage.getItem('sessionReminders') || '{}');
    const now = new Date();

    Object.keys(reminders).forEach(sessionId => {
        const reminder = reminders[sessionId];
        if (reminder.notified) return;

        try {
            const sessionDateTime = parseSessionDateTime(reminder.dateTime);
            if (!sessionDateTime) return;

            const timeDiff = (sessionDateTime - now) / 1000 / 60;

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
    const dateParts = dateTimeStr.match(/(\w+),\s+(\w+)\s+(\d+),\s+(\d+):(\d+)\s+(AM|PM)/);
    if (!dateParts) return null;

    const [, , monthName, day, hours, minutes, ampm] = dateParts;
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

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('📚 Study Session Reminder', {
            body: message,
            icon: '📚'
        });
    } else {
        showToast(`⏰ Reminder: ${message}`);
    }
}

function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showToast('✅ Notifications enabled! You\'ll get reminders 15 minutes before sessions.');
                } else {
                    showToast('⏰ Notifications disabled. You\'ll still get reminders on this page though!');
                }
            });
        }
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
        const sessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
        const updatedSessions = sessions.filter(s =>
            !(s.title === sessionTitle && s.dateTime === dateTime)
        );
        localStorage.setItem('customSessions', JSON.stringify(updatedSessions));

        if (modal) {
            modal.remove();
        }
        showToast('Session deleted successfully');
    }
}

function editSession(oldTitle, oldMeetingLink, oldHost, oldLevel, oldDateTime, displayTitle, modal) {
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

    const year = new Date().getFullYear();
    const dateTimeLocal = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${minutes}`;

    document.getElementById('sessionTitle').value = oldTitle;
    document.getElementById('sessionHost').value = oldHost;
    document.getElementById('sessionTime').value = dateTimeLocal;
    document.getElementById('sessionLevel').value = oldLevel;
    document.getElementById('meetingLink').value = oldMeetingLink;

    editingSession = { title: oldTitle, dateTime: oldDateTime };

    if (modal) modal.remove();

    document.getElementById('hostForm').scrollIntoView({ behavior: 'smooth' });
    showToast('Edit the session details and click Create Session');
}

function initializeSchedulePage() {
    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterSessionCards(filter, this);
        });
    });

    const allBtn = document.querySelector('.pill-btn[data-filter="all"]');
    if (allBtn && allBtn.classList.contains('active')) {
        filterSessionCards('all', allBtn);
    }

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            switchSessionView(view, this);
        });
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortSessionCards(this.value);
        });
    }

    loadCustomSessions();

    const editModal = document.getElementById('editSessionModal');
    if (editModal) {
        window.addEventListener('click', function(event) {
            if (event.target === editModal) {
                closeEditModal();
            }
        });
    }
}

function loadCustomSessions() {
    const sessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
    const sessionsList = document.querySelector('.sessions-list');

    if (!sessionsList || sessions.length === 0) return;

    let customGroup = document.querySelector('.session-day-group[data-custom="true"]');
    if (!customGroup) {
        customGroup = document.createElement('div');
        customGroup.className = 'session-day-group';
        customGroup.setAttribute('data-custom', 'true');
        customGroup.innerHTML = '<div class="day-header-banner"><h3>Your Sessions</h3></div>';
        sessionsList.appendChild(customGroup);
    }

    sessions.forEach(session => {
        const sessionCard = document.createElement('div');
        sessionCard.className = `session-card ${session.category}`;
        sessionCard.setAttribute('data-category', session.category);
        sessionCard.setAttribute('data-custom', 'true');

        const timeMatch = session.dateTime.match(/(\d{1,2}):(\d{2})\s(AM|PM)/);
        const timeStr = timeMatch ? `${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3]}` : '';

        const dateMatch = session.dateTime.match(/(\w+),\s+(\w+)\s+(\d+)/);
        let dateStr = '';
        if (dateMatch) {
            const dayMap = { 'Sunday': 'Sun', 'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat' };
            const monthMap = { 'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr', 'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug', 'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec' };
            const dayAbbrev = dayMap[dateMatch[1]] || dateMatch[1];
            const monthAbbrev = monthMap[dateMatch[2]] || dateMatch[2];
            dateStr = `${dayAbbrev}, ${monthAbbrev} ${dateMatch[3]}`;
        }

        sessionCard.innerHTML = `
            <div class="session-time-badge">
                <div class="time-icon"></div>
                <div class="time-info">
                    <span class="time-main">${dateStr}, ${timeStr}</span>
                    <span class="time-duration">60 min</span>
                </div>
            </div>
            <div class="session-content">
                <div class="session-header">
                    <h4>${session.title}</h4>
                    <span class="session-badge ${session.category}-badge">${session.category.charAt(0).toUpperCase() + session.category.slice(1)}</span>
                </div>
                <div class="session-meta">
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        ${session.host}
                    </span>
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                        ${session.level}
                    </span>
                    <span class="meta-item participants">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        You're hosting
                    </span>
                </div>
                <p class="session-description">Your custom study session</p>
            </div>
            <div class="session-actions">
                <button class="session-join-btn" onclick="joinSession('${session.title}', '${session.meetingLink}', '${session.host}', '${session.level}', '${session.dateTime}')">
                    View Details →
                </button>
                <button class="session-edit-btn" onclick="editCustomSession('${session.title}', '${session.dateTime}', '${session.host}', '${session.date}', '${session.category}', '${session.level}', '${session.meetingLink}')">
                    ✏️ Edit
                </button>
                <button class="session-delete-btn" onclick="deleteCustomSession('${session.title}', '${session.dateTime}')">
                    🗑️ Delete
                </button>
            </div>
        `;

        customGroup.appendChild(sessionCard);
    });
}

function filterSessionCards(category, button) {
    const sessionCards = document.querySelectorAll('.session-card');
    const customGroup = document.querySelector('.session-day-group[data-custom="true"]');

    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');

    let hasVisibleCustomCards = false;

    sessionCards.forEach(card => {
        const cardCategory = card.dataset.category;
        const isCustom = card.getAttribute('data-custom') === 'true';

        if (category === 'all' || cardCategory === category) {
            card.style.display = 'grid';
            setTimeout(() => card.classList.add('fade-in'), 10);
            if (isCustom) {
                hasVisibleCustomCards = true;
            }
        } else {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        }
    });

    if (customGroup) {
        customGroup.style.display = hasVisibleCustomCards ? 'flex' : 'none';
    }
}

function switchSessionView(view, button) {
    const dayGroups = document.querySelectorAll('.session-day-group');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');

    let hasVisibleCustomSessions = false;

    dayGroups.forEach((group, index) => {
        if (group.getAttribute('data-custom') === 'true') {
            const customCards = group.querySelectorAll('.session-card[data-custom="true"]');
            customCards.forEach(card => {
                const timeMain = card.querySelector('.time-main');
                if (timeMain) {
                    const dateStr = timeMain.textContent;
                    const sessionDate = parseSessionDateString(dateStr);

                    let shouldShow = false;

                    if (view === 'today') {
                        shouldShow = sessionDate.toDateString() === today.toDateString();
                    } else if (view === 'week') {
                        const weekEnd = new Date(today);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        shouldShow = sessionDate >= today && sessionDate <= weekEnd;
                    } else if (view === 'month') {
                        shouldShow = sessionDate.getMonth() === today.getMonth() &&
                                   sessionDate.getFullYear() === today.getFullYear();
                    } else {
                        shouldShow = sessionDate >= today;
                    }

                    if (shouldShow) {
                        card.style.display = 'grid';
                        hasVisibleCustomSessions = true;
                    } else {
                        card.style.display = 'none';
                    }
                }
            });

            group.style.display = hasVisibleCustomSessions ? 'flex' : 'none';
            return;
        }

        if (view === 'today') {
            group.style.display = index === 0 ? 'flex' : 'none';
        } else if (view === 'week') {
            group.style.display = index === 2 ? 'flex' : 'none';
        } else if (view === 'month') {
            const headerBanner = group.querySelector('.day-header-banner h3');
            if (headerBanner) {
                const headerText = headerBanner.textContent;
                let groupMonth = null;

                if (headerText.includes('January')) {
                    groupMonth = 0;
                } else if (headerText.includes('February')) {
                    groupMonth = 1;
                } else if (headerText.includes('March')) {
                    groupMonth = 2;
                } else if (headerText.includes('April')) {
                    groupMonth = 3;
                } else if (headerText.includes('May')) {
                    groupMonth = 4;
                } else if (headerText.includes('June')) {
                    groupMonth = 5;
                } else if (headerText.includes('July')) {
                    groupMonth = 6;
                } else if (headerText.includes('August')) {
                    groupMonth = 7;
                } else if (headerText.includes('September')) {
                    groupMonth = 8;
                } else if (headerText.includes('October')) {
                    groupMonth = 9;
                } else if (headerText.includes('November')) {
                    groupMonth = 10;
                } else if (headerText.includes('December')) {
                    groupMonth = 11;
                }

                const isCurrentMonth = groupMonth === today.getMonth();
                group.style.display = isCurrentMonth ? 'flex' : 'none';
            }
        } else {
            group.style.display = 'flex';
        }
    });
}

function parseSessionDateString(dateStr) {
    const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    const parts = dateStr.split(',');
    if (parts.length >= 3) {
        const monthDay = parts[1].trim().split(' ');
        const month = monthMap[monthDay[0]];
        const day = parseInt(monthDay[1]);
        const year = new Date().getFullYear();

        return new Date(year, month, day);
    }
    return new Date();
}

function sortSessionCards(sortType) {
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

    allCards.forEach(card => {
        const parentGroup = card.parentElement;
        if (parentGroup) {
            parentGroup.appendChild(card);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initBaseUI();
    requireAuth();
    updateAuthUI();
    startStudyTimeTracking();
    initializeSchedulePage();
    requestNotificationPermission();

    setInterval(checkReminders, 60000);
    checkReminders();
});
