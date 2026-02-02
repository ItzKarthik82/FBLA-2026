// Core utilities shared across pages
function checkAuth() {
    return localStorage.getItem('userLoggedIn') === 'true';
}

function getUserInfo() {
    return {
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        isAdmin: localStorage.getItem('userIsAdmin') === 'true'
    };
}

function isUserAdmin() {
    return localStorage.getItem('userIsAdmin') === 'true';
}

function logout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userIsAdmin');
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

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.animation = 'slideIn 0.3s ease-out forwards';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function resetAll() {
    localStorage.clear();
    location.reload();
}

function initBaseUI() {
    loadTheme();

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll);
    }
}

let sessionStartTime = null;
let isPageVisible = true;

function startStudyTimeTracking() {
    sessionStartTime = Date.now();
    isPageVisible = !document.hidden;

    window.addEventListener('beforeunload', saveStudyTime);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    setInterval(saveStudyTime, 60000);
}

function handleVisibilityChange() {
    if (document.hidden) {
        saveStudyTime();
        isPageVisible = false;
    } else {
        sessionStartTime = Date.now();
        isPageVisible = true;
    }
}

function saveStudyTime() {
    if (!sessionStartTime || !isPageVisible) return;

    const now = Date.now();
    const sessionDuration = Math.floor((now - sessionStartTime) / 1000 / 60);

    if (sessionDuration > 0) {
        const currentMinutes = parseInt(localStorage.getItem('studyMinutes') || '0');
        const newMinutes = currentMinutes + sessionDuration;
        localStorage.setItem('studyMinutes', newMinutes);

        sessionStartTime = now;

        const hoursElement = document.getElementById('hoursCount');
        if (hoursElement) {
            const hours = Math.floor(newMinutes / 60);
            hoursElement.textContent = hours;
        }
    }
}

let calcDisplay = '';
let calcResult = 0;
let calcOperator = '';
let scientificMode = false;

function toggleScientific() {
    scientificMode = !scientificMode;
    const basicButtons = document.getElementById('basicButtons');
    const scientificButtons = document.getElementById('scientificButtons');
    const sciToggle = document.querySelector('.sci-toggle');

    if (!basicButtons || !scientificButtons) return;

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

function calcPress(value) {
    const display = document.getElementById('calcDisplay');
    if (!display) return;

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
                let expression = calcDisplay
                    .replace(/sin\(/g, 'Math.sin(')
                    .replace(/cos\(/g, 'Math.cos(')
                    .replace(/tan\(/g, 'Math.tan(')
                    .replace(/sqrt\(/g, 'Math.sqrt(')
                    .replace(/log\(/g, 'Math.log10(')
                    .replace(/ln\(/g, 'Math.log(')
                    .replace(/\^/g, '**');

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

function toggleFloatingCalc() {
    const floatingCalc = document.getElementById('floatingCalc');
    if (floatingCalc) {
        floatingCalc.classList.toggle('active');
    }
}

function closeFloatingCalc() {
    const floatingCalc = document.getElementById('floatingCalc');
    if (floatingCalc) {
        floatingCalc.classList.remove('active');
    }
}
