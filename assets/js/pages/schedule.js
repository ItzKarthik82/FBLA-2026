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
    loadCustomSessions();

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
    closeEditModal();
    editingSession = null;
    loadCustomSessions();

    showToast('Session updated successfully!');
}

function deleteCustomSession(title, fullDateTimeStr) {
    if (!confirm('Are you sure you want to delete this session?')) {
        return;
    }

    const sessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
    const updatedSessions = sessions.filter(s => !(s.title === title && s.dateTime === fullDateTimeStr));
    localStorage.setItem('customSessions', JSON.stringify(updatedSessions));
    loadCustomSessions();

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
            filterCalendarEvents(filter, this);
        });
    });

    const allBtn = document.querySelector('.pill-btn[data-filter="all"]');
    if (allBtn && allBtn.classList.contains('active')) {
        filterCalendarEvents('all', allBtn);
    }

    loadCustomSessions();
    filterCalendarEvents('all', allBtn);

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
    document.querySelectorAll('.calendar-event.custom-session').forEach(event => event.remove());

    sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const dayBody = getCalendarDayBody(sessionDate.getDay());
        if (!dayBody) return;

        const { top, height } = calculateEventPosition(sessionDate);
        const eventBlock = document.createElement('div');
        eventBlock.className = `calendar-event event-${session.category} custom-session`;
        eventBlock.dataset.category = session.category;
        eventBlock.style.top = `${top}px`;
        eventBlock.style.height = `${height}px`;
        eventBlock.innerHTML = `
            <strong>${session.title}</strong>
            <span>${formatSessionTime(sessionDate)} · ${session.host}</span>
        `;

        dayBody.appendChild(eventBlock);
    });

    const activeFilter = document.querySelector('.pill-btn.active')?.dataset.filter || 'all';
    filterCalendarEvents(activeFilter);
}

function getCalendarDayBody(dayIndex) {
    return document.querySelector(`.calendar-day-column[data-day="${dayIndex}"] .calendar-day-body`);
}

function calculateEventPosition(date) {
    const startHour = date.getHours() + date.getMinutes() / 60;
    const offset = startHour - 8;
    const top = Math.max(0, offset * 72);
    const height = Math.max(60, 1 * 72);
    return { top, height };
}

function formatSessionTime(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function filterCalendarEvents(category, button) {
    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');

    document.querySelectorAll('.calendar-event').forEach(event => {
        const eventCategory = event.dataset.category;
        event.style.display = category === 'all' || eventCategory === category ? 'block' : 'none';
    });
}

function switchSessionView(view, button) {
    const dayGroups = document.querySelectorAll('.session-day-group');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');

    // Re-apply category filter with new view
    const activePillBtn = document.querySelector('.pill-btn.active');
    const activeCategory = activePillBtn?.dataset.filter || 'all';
    
    // Re-filter all sessions with current category and new view
    const sessionCards = document.querySelectorAll('.session-card');
    const customGroup = document.querySelector('.session-day-group[data-custom="true"]');
    let hasVisibleCustomCards = false;
    
    sessionCards.forEach(card => {
        const cardCategory = card.dataset.category;
        const isCustom = card.getAttribute('data-custom') === 'true';
        
        // Check category filter
        const categoryMatch = activeCategory === 'all' || cardCategory === activeCategory;
        
        // Check view filter
        let viewMatch = true;
        const timeMain = card.querySelector('.time-main');
        
        if (timeMain && categoryMatch) {
            const fullDateStr = timeMain.textContent;
            const sessionDate = parseSessionDateString(fullDateStr);
            
            if (view === 'today') {
                viewMatch = sessionDate.toDateString() === today.toDateString();
            } else if (view === 'week') {
                const weekEnd = new Date(today);
                weekEnd.setDate(weekEnd.getDate() + 6);
                viewMatch = sessionDate >= today && sessionDate <= weekEnd;
            } else if (view === 'month') {
                viewMatch = sessionDate.getMonth() === today.getMonth() &&
                           sessionDate.getFullYear() === today.getFullYear();
            } else {
                // upcoming
                viewMatch = sessionDate >= today;
            }
        }
        
        if (isCustom && categoryMatch && viewMatch) {
            card.style.display = 'grid';
            hasVisibleCustomCards = true;
        } else if (isCustom) {
            card.style.display = 'none';
        }
    });

    if (customGroup) {
        customGroup.style.display = hasVisibleCustomCards ? 'flex' : 'none';
    }

    // Show/hide default session groups based on view
    dayGroups.forEach((group, index) => {
        const isCustom = group.getAttribute('data-custom') === 'true';
        
        if (!isCustom) {
            if (view === 'today') {
                group.style.display = index === 0 ? 'flex' : 'none';
            } else if (view === 'week') {
                group.style.display = index === 2 ? 'flex' : 'none';
            } else if (view === 'month') {
                const headerBanner = group.querySelector('.day-header-banner h3');
                if (headerBanner) {
                    const headerText = headerBanner.textContent;
                    const currentMonth = today.getMonth();
                    const monthText = headerText.toLowerCase();
                    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
                    
                    let groupMonth = -1;
                    for (let i = 0; i < months.length; i++) {
                        if (monthText.includes(months[i])) {
                            groupMonth = i;
                            break;
                        }
                    }
                    
                    group.style.display = groupMonth === currentMonth ? 'flex' : 'none';
                }
            } else {
                group.style.display = 'flex';
            }
        }
    });
}

function parseSessionDateString(dateStr) {
    const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    // Handle format like "Fri, Jan 31, 3:00 PM" or "Fri, Jan 31"
    const parts = dateStr.split(',');
    if (parts.length >= 2) {
        // parts[1] will be something like " Jan 31" or " Jan 31 " (with spaces)
        const monthDay = parts[1].trim().split(' ');
        if (monthDay.length >= 2) {
            const month = monthMap[monthDay[0]];
            const day = parseInt(monthDay[1]);
            
            if (!isNaN(month) && !isNaN(day)) {
                const year = new Date().getFullYear();
                return new Date(year, month, day);
            }
        }
    }
    
    return new Date();
}

// Available sessions for browsing
const availableSessions = [
    {
        title: "Advanced Algebra Study Group",
        description: "Master complex equations, polynomials, and graphing techniques with step-by-step guidance.",
        category: "math",
        level: "Advanced",
        host: "Dr. Sarah Chen",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        dateTime: "Thursday, April 11, 7:00 PM"
    },
    {
        title: "Chemistry Lab Review",
        description: "Review key experiments, chemical reactions, and lab safety protocols for upcoming tests.",
        category: "science",
        level: "Intermediate",
        host: "Prof. Michael Torres",
        meetingLink: "https://meet.google.com/klm-nopq-rst",
        dateTime: "Friday, April 12, 5:00 PM"
    },
    {
        title: "Essay Writing Workshop",
        description: "Learn effective essay structure, thesis development, and persuasive writing techniques.",
        category: "english",
        level: "Beginner",
        host: "Ms. Emily Rodriguez",
        meetingLink: "https://meet.google.com/uvw-xyza-bcd",
        dateTime: "Saturday, April 13, 10:00 AM"
    },
    {
        title: "World History Debate Prep",
        description: "Prepare for history debates with research strategies and argumentation skills.",
        category: "history",
        level: "Intermediate",
        host: "Mr. David Kim",
        meetingLink: "https://meet.google.com/efg-hijk-lmn",
        dateTime: "Monday, April 15, 6:00 PM"
    },
    {
        title: "Calculus Problem Solving",
        description: "Tackle derivatives, integrals, and limits with interactive problem-solving sessions.",
        category: "math",
        level: "Advanced",
        host: "Dr. James Wilson",
        meetingLink: "https://meet.google.com/opq-rstu-vwx",
        dateTime: "Tuesday, April 16, 4:00 PM"
    },
    {
        title: "Biology Cell Structure Deep Dive",
        description: "Explore cellular organelles, membrane transport, and cell division processes.",
        category: "science",
        level: "Intermediate",
        host: "Dr. Lisa Park",
        meetingLink: "https://meet.google.com/yz-abcd-efg",
        dateTime: "Wednesday, April 17, 3:00 PM"
    },
    {
        title: "Grammar and Literature Analysis",
        description: "Improve grammar skills and learn to analyze classic literature with expert guidance.",
        category: "english",
        level: "Beginner",
        host: "Ms. Rachel Thompson",
        meetingLink: "https://meet.google.com/hij-klmn-opq",
        dateTime: "Thursday, April 18, 2:00 PM"
    },
    {
        title: "American History Timeline Review",
        description: "Review key events, figures, and movements that shaped American history.",
        category: "history",
        level: "Intermediate",
        host: "Mr. Robert Johnson",
        meetingLink: "https://meet.google.com/rst-uvwx-yza",
        dateTime: "Friday, April 19, 6:00 PM"
    }
];

function loadAvailableSessions() {
    const sessionGrid = document.getElementById('sessionGrid');
    if (!sessionGrid) return;

    sessionGrid.innerHTML = '';

    availableSessions.forEach(session => {
        const sessionCard = document.createElement('div');
        sessionCard.className = 'session-card';
        sessionCard.dataset.category = session.category;

        sessionCard.innerHTML = `
            <h4>${session.title}</h4>
            <div class="session-meta">
                <span class="meta-item">📚 ${session.category.charAt(0).toUpperCase() + session.category.slice(1)}</span>
                <span class="meta-item">🎯 ${session.level}</span>
            </div>
            <p class="session-description">${session.description}</p>
            <div class="session-details">
                <div class="detail-item">
                    <span class="detail-label">👨‍🏫 Host:</span> ${session.host}
                </div>
                <div class="detail-item">
                    <span class="detail-label">📅 When:</span> ${session.dateTime}
                </div>
            </div>
            <button class="add-to-calendar-btn" onclick="openBrowseSessionModal('${session.title.replace(/'/g, "\\'")}', '${session.dateTime}', '${session.category}', '${session.level}', '${session.host.replace(/'/g, "\\'")}', '${session.meetingLink}', '${session.description.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">
                Join & Add to Calendar
            </button>
        `;

        sessionGrid.appendChild(sessionCard);
    });
}

function openBrowseSessionModal(title, dateTime, category, level, host, meetingLink, description) {
    const sessionId = generateSessionId(title, dateTime);
    const isInterested = isSessionInterested(sessionId);
    const existingSessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
    const alreadyAdded = existingSessions.some(s => s.title === title && s.dateTime === dateTime);

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

    const modal = document.createElement('div');
    modal.className = 'session-modal';
    modal.innerHTML = `
        <div class="modal-content session-modal-content">
            <div class="modal-header">
                <div>
                    <h3>${title}</h3>
                    <span class="category-badge" style="background: var(--${category === 'math' ? 'purple' : category === 'science' ? 'teal' : category === 'english' ? 'pink' : 'orange'}-600);">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </div>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="session-modal-info">
                    ${description ? `<div class="info-group"><p class="session-description">${description}</p></div>` : ''}
                    <div class="info-group">
                        <span class="info-label">📅 When</span>
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
                <button class="btn small ${isInterested ? 'interested' : ''}" onclick="toggleSessionInterest('${sessionId}', '${title}', '${dateTime}', this)">
                    ${isInterested ? '❤️ Interested' : '🤍 Mark Interested'}
                </button>
                <button class="btn small ${alreadyAdded ? 'disabled' : 'primary'}" onclick="addToCalendarFromModal('${title}', '${dateTime}', '${category}', '${level}', '${host}', '${meetingLink}')" ${alreadyAdded ? 'disabled' : ''}>
                    ${alreadyAdded ? '✓ Added to Calendar' : '📌 Add to Calendar'}
                </button>
                <button class="btn small secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function addToCalendarFromModal(title, dateTime, category, level, host, meetingLink) {
    // Check if already added
    const existingSessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
    const alreadyExists = existingSessions.some(s => s.title === title && s.dateTime === dateTime);

    if (alreadyExists) {
        showToast('Session already added to your calendar!');
        return;
    }

    // Parse the dateTime string to create a Date object
    const dateMatch = dateTime.match(/(\w+), (\w+) (\d+), (\d+):(\d+) (AM|PM)/);
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
    const sessionDate = new Date(year, month, parseInt(day), hour, parseInt(minutes), 0, 0);

    // Add to custom sessions
    const newSession = {
        title: title,
        host: host,
        dateTime: dateTime,
        category: category,
        level: level,
        meetingLink: meetingLink,
        date: sessionDate.toISOString()
    };

    existingSessions.push(newSession);
    localStorage.setItem('customSessions', JSON.stringify(existingSessions));

    // Reload calendar to show the new session
    loadCustomSessions();

    // Update button to show it's added
    const button = event.target;
    button.textContent = '✓ Added to Calendar';
    button.disabled = true;
    button.classList.add('disabled');

    showToast('Session added to your calendar!');
}

function initializeSchedulePage() {
    // Attach filter button listeners
    document.querySelectorAll('.pill-btn').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.filter;
            filterCalendarEvents(category, button);
        });
    });

    // Load custom sessions and available sessions
    loadCustomSessions();
    loadAvailableSessions();
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
