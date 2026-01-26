// Theme Management
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';

    body.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.textContent = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.textContent = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    }
}

// Progress Management
function loadProgress() {
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    const quizzes = parseInt(localStorage.getItem('quizzes') || '0');
    const hours = parseInt(localStorage.getItem('hours') || '0');
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

    if (!title || !host || !time) {
        showToast('Please fill in all fields');
        return;
    }

    // In a real app, this would send to server
    showToast('Session proposed successfully!');
    document.getElementById('hostForm').reset();
}

// Filter sessions
function filterSessions(category) {
    const cards = document.querySelectorAll('.session-card');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
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
        'history': { file: 'history-guide.txt', title: 'World History' }
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
        { id: 'history', statusId: 'history-status', btnId: 'history-btn' }
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
        'english': { lessons: ['essay'], progressId: 'english-progress', courseId: 'english-course' },
        'history': { lessons: ['history'], progressId: 'history-progress', courseId: 'history-course' }
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

function toggleCalculator() {
    const calc = document.getElementById('calculator');
    calc.style.display = calc.style.display === 'block' ? 'none' : 'block';
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
        if (calcOperator && calcDisplay) {
            calcResult = calculate(calcResult, parseFloat(calcDisplay), calcOperator);
            display.textContent = calcResult;
            calcDisplay = calcResult.toString();
            calcOperator = '';
        }
        return;
    }

    if (['+', '-', '*', '/'].includes(value)) {
        if (calcDisplay) {
            if (calcOperator) {
                calcResult = calculate(calcResult, parseFloat(calcDisplay), calcOperator);
            } else {
                calcResult = parseFloat(calcDisplay);
            }
            calcOperator = value;
            calcDisplay = '';
        }
        return;
    }

    calcDisplay += value;
    display.textContent = calcDisplay;
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

    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.feature-card, .subject-card, .session-card, .resource-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
});

// Ensure lesson progress is updated when page becomes visible (e.g., from cache)
window.addEventListener('pageshow', () => {
    updateLessonProgress();
});

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

// Add fade-in animation to cards
const cards = document.querySelectorAll('.feature-card, .subject-card, .session-card, .resource-card');
cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-in');
});