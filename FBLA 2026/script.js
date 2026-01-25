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
    const lessons = parseInt(localStorage.getItem('lessons') || '0');
    const quizzes = parseInt(localStorage.getItem('quizzes') || '0');
    const hours = parseInt(localStorage.getItem('hours') || '0');
    const achievements = parseInt(localStorage.getItem('achievements') || '0');

    updateDisplay('lessonsCount', lessons);
    updateDisplay('quizzesCount', quizzes);
    updateDisplay('hoursCount', hours);
    updateDisplay('achievementsCount', achievements);

    // Update progress bars
    updateProgressBar('mathProgress', Math.min(100, lessons * 5));
    updateProgressBar('scienceProgress', Math.min(100, quizzes * 12));
    updateProgressBar('englishProgress', Math.min(100, hours * 10));
}

function updateDisplay(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function updateProgressBar(id, percentage) {
    const bar = document.getElementById(id);
    if (bar) bar.style.width = percentage + '%';
}

function markLessonComplete() {
    const current = parseInt(localStorage.getItem('lessons') || '0');
    const newValue = Math.min(100, current + 1);
    localStorage.setItem('lessons', newValue);
    addActivity('Completed a lesson');
    loadProgress();
    showToast('Lesson marked as complete!');
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
    addActivity('Joined a study session');
    showToast('Joined study session!');
}

function addActivity(description) {
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
}

function getActivityIcon(description) {
    if (description.includes('lesson')) return '📚';
    if (description.includes('quiz')) return '✅';
    if (description.includes('session')) return '👥';
    return '🎯';
}

function updateActivityList() {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const listElement = document.getElementById('activityList');
    if (!listElement) return;

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
function openLesson(lessonId) {
    const lessonData = {
        'algebra': {
            file: 'algebra-guide.txt',
            title: 'Algebra Essentials'
        },
        'geometry': {
            file: 'geometry-guide.txt',
            title: 'Geometry Fundamentals'
        },
        'biology': {
            file: 'biology-guide.txt',
            title: 'Biology Basics'
        },
        'chemistry': {
            file: 'chemistry-guide.txt',
            title: 'Chemistry Fundamentals'
        },
        'essay-writing': {
            file: 'essay-guide.txt',
            title: 'Essay Writing'
        },
        'world-history': {
            file: 'history-guide.txt',
            title: 'World History'
        }
    };

    const data = lessonData[lessonId];
    if (!data) {
        showToast('Lesson not available yet.');
        return;
    }

    fetch(`materials/${data.file}`)
        .then(response => response.text())
        .then(content => {
            document.getElementById('lessonTitle').textContent = data.title;
            document.getElementById('lessonContent').innerHTML = '<pre>' + content + '</pre>';
            document.getElementById('lessonModal').style.display = 'block';
        })
        .catch(error => {
            showToast('Error loading lesson content.');
            console.error('Error:', error);
        });
}

function closeLesson() {
    document.getElementById('lessonModal').style.display = 'none';
}

function startQuiz(quizId) {
    const quizElement = document.getElementById(`${quizId}-quiz`);
    if (quizElement) {
        quizElement.style.display = 'block';
    }
}

function checkQuiz(quizId) {
    const form = document.getElementById(`${quizId}-quiz`);
    const resultElement = document.getElementById(`${quizId}-result`);
    const radios = form.querySelectorAll('input[type="radio"]');
    let selectedValue = null;

    radios.forEach(radio => {
        if (radio.checked) selectedValue = radio.value;
    });

    if (!selectedValue) {
        resultElement.textContent = 'Please select an answer.';
        resultElement.className = 'quiz-result incorrect';
        return;
    }

    // Simple quiz logic - in real app, this would be more sophisticated
    const correctAnswers = { q1: '2', q2: 'cell' };
    const isCorrect = selectedValue === correctAnswers.q1 || selectedValue === correctAnswers.q2;

    if (isCorrect) {
        resultElement.textContent = 'Correct! Well done!';
        resultElement.className = 'quiz-result correct';
        takeQuiz(); // Update progress
    } else {
        resultElement.textContent = 'Not quite right. Try again!';
        resultElement.className = 'quiz-result incorrect';
    }
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