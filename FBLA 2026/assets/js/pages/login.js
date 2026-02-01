document.addEventListener('DOMContentLoaded', () => {
    initBaseUI();
    updateAuthUI();

    if (typeof checkAuth !== 'undefined' && checkAuth()) {
        window.location.href = 'dashboard.html';
    }

    function showNotif(msg, type) {
        const notif = document.createElement('div');
        notif.className = `notification-popup ${type}`;
        notif.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '!'}</span>
                <span class="notification-text">${msg}</span>
                <button type="button" class="notification-close">×</button>
            </div>
        `;
        document.body.appendChild(notif);
        
        const closeBtn = notif.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.onclick = function() {
                notif.remove();
            };
        }
        
        setTimeout(() => {
            if (document.body.contains(notif)) {
                notif.remove();
            }
        }, 4000);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const focusState = {};

    function setInputState(inputId, state) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.classList.remove('input-valid', 'input-error');
        if (state === 'valid') input.classList.add('input-valid');
        if (state === 'error') input.classList.add('input-error');
    }

    document.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', () => {
            const errorId = field.id + 'Err';
            const errorEl = document.getElementById(errorId);
            if (errorEl) {
                errorEl.style.display = 'none';
            }
            field.classList.remove('input-error');
        });
    });

    function updateLoginReqs() {
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPass').value;

        const emailValid = isValidEmail(email);
        const passValid = pass.length > 0;

        updateReqDisplay('loginEmailReqs', 'loginEmailCheck', emailValid, focusState.loginEmail || email.length > 0);
        updateReqDisplay('loginPassReqs', 'loginPassCheck', passValid, focusState.loginPass || pass.length > 0);

        setInputState('loginEmail', email.length === 0 ? '' : (emailValid ? 'valid' : 'error'));
        setInputState('loginPass', pass.length === 0 ? '' : 'valid');
    }

    function updateSignupReqs() {
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass = document.getElementById('regPass').value;
        const confirm = document.getElementById('regPassConfirm').value;
        const question = document.getElementById('regQuestion').value;
        const answer = document.getElementById('regAnswer').value.trim();

        const nameValid = name.length > 0;
        const emailValid = isValidEmail(email);
        const passValid = pass.length >= 6;
        const matchValid = pass === confirm && pass.length > 0;
        const questionValid = question.length > 0;
        const answerValid = answer.length > 0;

        updateReqDisplay('regNameReqs', 'regNameCheck', nameValid, focusState.regName || name.length > 0);
        updateReqDisplay('regEmailReqs', 'regEmailCheck', emailValid, focusState.regEmail || email.length > 0);
        updateReqDisplay('regPassReqs', 'regPassCheck', passValid, focusState.regPass || pass.length > 0);
        updateReqDisplay('regPassConfirmReqs', 'regPassConfirmCheck', matchValid, focusState.regPassConfirm || confirm.length > 0);
        updateReqDisplay('regQuestionReqs', 'regQuestionCheck', questionValid, focusState.regQuestion || question.length > 0);
        updateReqDisplay('regAnswerReqs', 'regAnswerCheck', answerValid, focusState.regAnswer || answer.length > 0);

        setInputState('regName', name.length === 0 ? '' : (nameValid ? 'valid' : 'error'));
        setInputState('regEmail', email.length === 0 ? '' : (emailValid ? 'valid' : 'error'));
        setInputState('regPass', pass.length === 0 ? '' : (passValid ? 'valid' : 'error'));
        setInputState('regPassConfirm', confirm.length === 0 ? '' : (matchValid ? 'valid' : 'error'));
        setInputState('regQuestion', question.length === 0 ? '' : (questionValid ? 'valid' : 'error'));
        setInputState('regAnswer', answer.length === 0 ? '' : (answerValid ? 'valid' : 'error'));
    }

    function updateReqDisplay(containerId, checkId, isMet, show) {
        const container = document.getElementById(containerId);
        const check = document.getElementById(checkId);
        const item = check ? check.parentElement : null;

        const shouldShow = show && !isMet;

        if (shouldShow) {
            container.classList.add('show');
            check.classList.remove('met');
            check.classList.add('unmet');
            check.textContent = '!';
            if (item) {
                item.classList.remove('met');
                item.classList.add('unmet');
            }
        } else {
            container.classList.remove('show');
            check.classList.remove('unmet');
            if (item) item.classList.remove('unmet');
            if (isMet) {
                check.classList.add('met');
                check.textContent = '✓';
                if (item) item.classList.add('met');
            } else {
                check.classList.remove('met');
                check.textContent = '';
                if (item) item.classList.remove('met');
            }
        }
    }

    function updateAllReqs() {
        updateLoginReqs();
        updateSignupReqs();
    }

    const trackedFields = [
        'loginEmail', 'loginPass',
        'regName', 'regEmail', 'regPass', 'regPassConfirm', 'regQuestion', 'regAnswer'
    ];

    trackedFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('focus', () => {
            focusState[id] = true;
            updateAllReqs();
        });
        el.addEventListener('blur', () => {
            focusState[id] = false;
            updateAllReqs();
        });
        el.addEventListener('input', updateAllReqs);
        if (el.tagName === 'SELECT') {
            el.addEventListener('change', updateAllReqs);
        }
    });

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const formId = btn.getAttribute('data-form');

            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(formId).classList.add('active');

            document.querySelectorAll('.error-text').forEach(e => e.style.display = 'none');
            document.querySelectorAll('input, select').forEach(field => field.classList.remove('input-error'));
            updateAllReqs();
        });
    });

    if (window.location.hash === '#signup') {
        const signupBtn = document.querySelector('.tab-button[data-form="signup"]');
        if (signupBtn) signupBtn.click();
    }

    const forgotLink = document.getElementById('forgotLink');
    const resetModal = document.getElementById('resetModal');
    const resetClose = document.getElementById('resetClose');
    const resetStepEmail = document.getElementById('resetStepEmail');
    const resetStepVerify = document.getElementById('resetStepVerify');
    const resetQuestionText = document.getElementById('resetQuestionText');
    const resetBack = document.getElementById('resetBack');

    const questionMap = {
        pet: "What was your first pet's name?",
        city: "What city were you born in?",
        school: "What was your elementary school?",
        teacher: "Favorite teacher's name?",
        color: "What is your favorite color?"
    };

    let resetUserIndex = null;

    function showResetPanel() {
        resetModal.classList.add('show');
        resetModal.setAttribute('aria-hidden', 'false');
        resetStepEmail.classList.add('active');
        resetStepVerify.classList.remove('active');
        resetUserIndex = null;
        document.getElementById('resetEmail').value = '';
        document.getElementById('resetAnswer').value = '';
        document.getElementById('resetNewPass').value = '';
        document.getElementById('resetConfirmPass').value = '';
        document.querySelectorAll('#resetPanel .error-text').forEach(e => e.style.display = 'none');
        document.body.style.overflow = 'hidden';
    }

    function hideResetPanel() {
        resetModal.classList.remove('show');
        resetModal.setAttribute('aria-hidden', 'true');
        resetStepEmail.classList.add('active');
        resetStepVerify.classList.remove('active');
        resetUserIndex = null;
        document.body.style.overflow = '';
    }

    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showResetPanel();
        });
    }

    resetClose.addEventListener('click', hideResetPanel);

    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) hideResetPanel();
    });

    resetBack.addEventListener('click', () => {
        hideResetPanel();
    });

    resetStepEmail.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();
        const emailErr = document.getElementById('resetEmailErr');
        emailErr.style.display = 'none';

        if (!email || !isValidEmail(email)) {
            emailErr.textContent = email ? 'Enter a valid email address' : 'Email is required';
            emailErr.style.display = 'block';
            return;
        }

        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

        if (index === -1) {
            emailErr.textContent = 'No account found with that email';
            emailErr.style.display = 'block';
            return;
        }

        resetUserIndex = index;
        const questionKey = users[index].securityQuestion;
        resetQuestionText.textContent = questionMap[questionKey] || 'Security question';

        resetStepEmail.classList.remove('active');
        resetStepVerify.classList.add('active');
    });

    resetStepVerify.addEventListener('submit', (e) => {
        e.preventDefault();

        const answer = document.getElementById('resetAnswer').value.trim();
        const newPass = document.getElementById('resetNewPass').value;
        const confirmPass = document.getElementById('resetConfirmPass').value;

        const answerErr = document.getElementById('resetAnswerErr');
        const newPassErr = document.getElementById('resetNewPassErr');
        const confirmErr = document.getElementById('resetConfirmPassErr');

        answerErr.style.display = 'none';
        newPassErr.style.display = 'none';
        confirmErr.style.display = 'none';

        let valid = true;

        if (!answer) {
            answerErr.textContent = 'Answer is required';
            answerErr.style.display = 'block';
            valid = false;
        }

        if (!newPass || newPass.length < 6) {
            newPassErr.textContent = newPass ? 'Password must be at least 6 characters' : 'New password is required';
            newPassErr.style.display = 'block';
            valid = false;
        }

        if (!confirmPass || confirmPass !== newPass) {
            confirmErr.textContent = confirmPass ? 'Passwords must match' : 'Confirm your new password';
            confirmErr.style.display = 'block';
            valid = false;
        }

        if (!valid) return;

        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = users[resetUserIndex];

        if (!user || user.securityAnswer?.toLowerCase() !== answer.toLowerCase()) {
            answerErr.textContent = 'Incorrect answer';
            answerErr.style.display = 'block';
            return;
        }

        users[resetUserIndex].password = newPass;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        showNotif('Password reset successful. Please sign in.', 'success');
        hideResetPanel();
    });

    document.getElementById('login').addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPass').value;

        const emailErr = document.getElementById('loginEmailErr');
        const passErr = document.getElementById('loginPassErr');

        emailErr.style.display = 'none';
        passErr.style.display = 'none';

        let valid = true;

        if (!email) {
            emailErr.textContent = 'Email is required';
            emailErr.style.display = 'block';
            setInputState('loginEmail', 'error');
            valid = false;
        } else if (!isValidEmail(email)) {
            emailErr.textContent = 'Invalid email format';
            emailErr.style.display = 'block';
            setInputState('loginEmail', 'error');
            valid = false;
        }

        if (!pass) {
            passErr.textContent = 'Password is required';
            passErr.style.display = 'block';
            setInputState('loginPass', 'error');
            valid = false;
        }

        if (!valid) return;

        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

        if (user) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userIsAdmin', user.isAdmin ? 'true' : 'false');
            showNotif('Login successful!', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        } else {
            showNotif('Invalid email or password', 'error');
        }
    });

    document.getElementById('signup').addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass = document.getElementById('regPass').value;
        const passConfirm = document.getElementById('regPassConfirm').value;
        const question = document.getElementById('regQuestion').value;
        const answer = document.getElementById('regAnswer').value.trim();

        document.querySelectorAll('.error-text').forEach(e => e.style.display = 'none');

        let valid = true;

        if (!name) {
            document.getElementById('regNameErr').textContent = 'Name is required';
            document.getElementById('regNameErr').style.display = 'block';
            setInputState('regName', 'error');
            valid = false;
        }

        if (!email) {
            document.getElementById('regEmailErr').textContent = 'Email is required';
            document.getElementById('regEmailErr').style.display = 'block';
            setInputState('regEmail', 'error');
            valid = false;
        } else if (!isValidEmail(email)) {
            document.getElementById('regEmailErr').textContent = 'Invalid email format';
            document.getElementById('regEmailErr').style.display = 'block';
            setInputState('regEmail', 'error');
            valid = false;
        }

        if (!pass) {
            document.getElementById('regPassErr').textContent = 'Password is required';
            document.getElementById('regPassErr').style.display = 'block';
            setInputState('regPass', 'error');
            valid = false;
        } else if (pass.length < 6) {
            document.getElementById('regPassErr').textContent = 'Password must be 6+ characters';
            document.getElementById('regPassErr').style.display = 'block';
            setInputState('regPass', 'error');
            valid = false;
        }

        if (!passConfirm) {
            document.getElementById('regPassConfirmErr').textContent = 'Confirm your password';
            document.getElementById('regPassConfirmErr').style.display = 'block';
            setInputState('regPassConfirm', 'error');
            valid = false;
        } else if (pass !== passConfirm) {
            document.getElementById('regPassConfirmErr').textContent = 'Passwords do not match';
            document.getElementById('regPassConfirmErr').style.display = 'block';
            setInputState('regPassConfirm', 'error');
            valid = false;
        }

        if (!question) {
            document.getElementById('regQuestionErr').textContent = 'Select a question';
            document.getElementById('regQuestionErr').style.display = 'block';
            setInputState('regQuestion', 'error');
            valid = false;
        }

        if (!answer) {
            document.getElementById('regAnswerErr').textContent = 'Answer is required';
            document.getElementById('regAnswerErr').style.display = 'block';
            setInputState('regAnswer', 'error');
            valid = false;
        }

        if (!valid) return;

        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            document.getElementById('regEmailErr').textContent = 'Email already registered';
            document.getElementById('regEmailErr').style.display = 'block';
            return;
        }

        users.push({
            name,
            email,
            password: pass,
            securityQuestion: question,
            securityAnswer: answer.toLowerCase(),
            isAdmin: false
        });
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userIsAdmin', 'false');

        showNotif('Account created! Logging in...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
    });
});
