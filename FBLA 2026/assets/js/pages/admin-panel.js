// Show notification toast
function showNotification(msg, type) {
    try {
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
    } catch (e) {
        console.error('Notification error:', e);
        alert(msg);
    }
}

function initAdminPanel() {
    // Load dashboard stats and setup
    loadDashboardStats();
    setupNavigation();
    setupLessonForm();
    setupQuizForm();
    setupVideoForm();
    setupMaterialsForm();
    loadLessons();
    loadQuizzes();
    loadVideos();
    loadMaterials();
    loadUsers();

    function setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionId = btn.getAttribute('data-section');
                switchSection(sectionId);
                btn.classList.add('active');
                document.querySelectorAll('.nav-btn').forEach(b => {
                    if (b !== btn) b.classList.remove('active');
                });
            });
        });
    }

    function switchSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        const section = document.getElementById(sectionId);
        if (section) section.classList.add('active');
    }

    function loadDashboardStats() {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const lessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
        const adminCount = users.filter(u => u.isAdmin).length;

        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalLessons').textContent = lessons.length + 8; // 8 default lessons
        document.getElementById('activeSessions').textContent = parseInt(localStorage.getItem('sessions') || '0');
        document.getElementById('adminCount').textContent = adminCount;
    }

    function setupLessonForm() {
        document.getElementById('lessonForm').addEventListener('submit', (e) => {
            e.preventDefault();

            const category = document.getElementById('lessonCategory').value;
            const title = document.getElementById('lessonTitle').value.trim();
            const id = document.getElementById('lessonId').value.trim();
            const desc = document.getElementById('lessonDesc').value.trim();
            const content = document.getElementById('lessonContent').value.trim();

            if (!category || !title || !id || !desc || !content) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            // Check for duplicate ID
            const customLessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
            if (customLessons.some(l => l.id === id)) {
                showNotification('A lesson with this ID already exists', 'error');
                return;
            }

            const lesson = {
                id,
                title,
                category,
                description: desc,
                content,
                createdAt: new Date().toISOString(),
                createdBy: localStorage.getItem('userName')
            };

            customLessons.push(lesson);
            localStorage.setItem('customLessons', JSON.stringify(customLessons));

            showNotification('Lesson added successfully!', 'success');
            document.getElementById('lessonForm').reset();
            loadDashboardStats();
            loadLessons();
            
            // Notify other pages about lesson update
            window.dispatchEvent(new Event('lessonsUpdated'));
        });
    }

    function loadLessons() {
        const customLessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
        const lessonsList = document.getElementById('lessonsList');
        lessonsList.innerHTML = '';

        // Default lessons
        const defaultLessons = [
            { id: 'algebra', title: 'Algebra Essentials', category: 'mathematics', description: 'Master fundamental mathematical concepts' },
            { id: 'geometry', title: 'Geometry Fundamentals', category: 'mathematics', description: 'Explore shapes and spatial reasoning' },
            { id: 'biology', title: 'Biology Basics', category: 'science', description: 'Understand living organisms' },
            { id: 'chemistry', title: 'Chemistry Fundamentals', category: 'science', description: 'Explore matter and reactions' },
            { id: 'essay', title: 'Essay Writing', category: 'english', description: 'Master essay composition' },
            { id: 'grammar', title: 'Grammar Basics', category: 'english', description: 'Learn essential grammar rules' },
            { id: 'history', title: 'World History', category: 'history', description: 'Explore world events and civilizations' },
            { id: 'us-history', title: 'US History', category: 'history', description: 'Study American history' }
        ];

        // Display default lessons
        defaultLessons.forEach(lesson => {
            const lessonEl = createLessonElement(lesson, true);
            lessonsList.appendChild(lessonEl);
        });

        // Display custom lessons
        customLessons.forEach(lesson => {
            const lessonEl = createLessonElement(lesson, false);
            lessonsList.appendChild(lessonEl);
        });

        if (customLessons.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'No custom lessons created yet. Add one using the form above!';
            emptyMsg.style.color = 'var(--text-muted)';
            lessonsList.appendChild(emptyMsg);
        }
    }

    function createLessonElement(lesson, isDefault) {
        const div = document.createElement('div');
        div.className = 'lesson-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'lesson-info';
        infoDiv.innerHTML = `
            <h4>${lesson.title}</h4>
            <p>Category: <strong>${lesson.category}</strong></p>
            <p>${lesson.description}</p>
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'lesson-actions';

        if (!isDefault) {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn small primary';
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => editLesson(lesson.id);
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn small danger';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => deleteLesson(lesson.id);
            actionsDiv.appendChild(deleteBtn);
        } else {
            const badge = document.createElement('span');
            badge.style.fontSize = '0.85em';
            badge.style.color = 'var(--text-muted)';
            badge.textContent = 'Default Lesson';
            actionsDiv.appendChild(badge);
        }

        div.appendChild(infoDiv);
        div.appendChild(actionsDiv);
        return div;
    }

    function editLesson(lessonId) {
        const customLessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
        const lesson = customLessons.find(l => l.id === lessonId);

        if (!lesson) return;

        document.getElementById('lessonCategory').value = lesson.category;
        document.getElementById('lessonTitle').value = lesson.title;
        document.getElementById('lessonId').value = lesson.id;
        document.getElementById('lessonDesc').value = lesson.description;
        document.getElementById('lessonContent').value = lesson.content;

        // Remove old lesson and save new one on submit
        const form = document.getElementById('lessonForm');
        const originalOnSubmit = form.onsubmit;
        
        form.onsubmit = (e) => {
            e.preventDefault();
            const index = customLessons.findIndex(l => l.id === lessonId);
            if (index !== -1) {
                customLessons[index] = {
                    ...lesson,
                    title: document.getElementById('lessonTitle').value,
                    category: document.getElementById('lessonCategory').value,
                    description: document.getElementById('lessonDesc').value,
                    content: document.getElementById('lessonContent').value,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem('customLessons', JSON.stringify(customLessons));
                showNotification('Lesson updated successfully!', 'success');
                form.reset();
                form.onsubmit = originalOnSubmit;
                loadLessons();
            }
        };

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteLesson(lessonId) {
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        const customLessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
        const filtered = customLessons.filter(l => l.id !== lessonId);
        localStorage.setItem('customLessons', JSON.stringify(filtered));

        showNotification('Lesson deleted successfully!', 'success');
        loadDashboardStats();
        loadLessons();
        
        // Notify other pages about lesson update
        window.dispatchEvent(new Event('lessonsUpdated'));
    }

    function loadUsers() {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        users.forEach((user, index) => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-item';

            const joinDate = new Date(parseInt(localStorage.getItem('userJoinDate_' + user.email) || Date.now())).toLocaleDateString();

            userDiv.innerHTML = `
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                </div>
                <div>
                    <span class="badge ${user.isAdmin ? 'admin' : 'student'}">${user.isAdmin ? 'Admin' : 'Student'}</span>
                </div>
                <div class="user-info">
                    <p>Joined: ${joinDate}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    ${!user.isAdmin ? `<button class="btn small primary" onclick="window.makeAdmin(${index})">Make Admin</button>` : ''}
                    ${!user.isAdmin ? `<button class="btn small danger" onclick="window.removeUser(${index})">Remove</button>` : '<span style="color: var(--text-muted);">Admin Account</span>'}
                </div>
            `;
            usersList.appendChild(userDiv);
        });

        if (users.length === 0) {
            usersList.innerHTML = '<p style="color: var(--text-muted);">No users registered yet.</p>';
        }
    }

}

window.makeAdmin = function(index) {
    if (!confirm('Make this user an admin?')) return;

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    users[index].isAdmin = true;
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    showNotification('User promoted to admin!', 'success');
    const customLessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
    const adminCount = users.filter(u => u.isAdmin).length;
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('adminCount').textContent = adminCount;
    
    const usersList = document.getElementById('usersList');
    if (usersList) {
        loadUsers();
    }
};

window.removeUser = function(index) {
    if (!confirm('Remove this user permanently?')) return;

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    users.splice(index, 1);
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    showNotification('User removed!', 'success');
    document.getElementById('totalUsers').textContent = users.length;
    
    const usersList = document.getElementById('usersList');
    if (usersList) {
        loadUsers();
    }
};

// ==================== QUIZ MANAGEMENT ====================
function setupQuizForm() {
    const form = document.getElementById('quizForm');
    if (!form) return;

    // Create default question fields
    const container = document.getElementById('questionsContainer');
    if (container) {
        container.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            container.innerHTML += `
                <div class="form-input-group">
                    <label>Question ${i}</label>
                    <input type="text" class="quiz-question" placeholder="Enter question ${i}" data-q="${i}">
                    <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                        ${['A', 'B', 'C', 'D'].map(opt => `
                            <input type="text" class="quiz-option" placeholder="Option ${opt}" data-q="${i}" data-opt="${opt}" style="flex: 1; min-width: 100px;">
                        `).join('')}
                    </div>
                    <select class="quiz-answer" data-q="${i}" style="margin-top: 8px;">
                        <option value="">Select correct answer...</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>
            `;
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const category = document.getElementById('quizCategory').value;
        const title = document.getElementById('quizTitle').value;
        const id = document.getElementById('quizId').value;
        const desc = document.getElementById('quizDesc').value;

        if (!category || !title || !id || !desc) {
            showNotification('Please fill in all fields!', 'error');
            return;
        }

        // Build questions array
        const questions = [];
        for (let i = 1; i <= 5; i++) {
            const q = document.querySelector(`.quiz-question[data-q="${i}"]`).value;
            if (q.trim()) {
                const options = {};
                ['A', 'B', 'C', 'D'].forEach(opt => {
                    const opt_val = document.querySelector(`.quiz-option[data-q="${i}"][data-opt="${opt}"]`).value;
                    if (opt_val) options[opt] = opt_val;
                });
                const answer = document.querySelector(`.quiz-answer[data-q="${i}"]`).value;
                if (answer && Object.keys(options).length > 0) {
                    questions.push({
                        question: q,
                        options: options,
                        correctAnswer: answer
                    });
                }
            }
        }

        if (questions.length === 0) {
            showNotification('Add at least one complete question!', 'error');
            return;
        }

        const customQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
        const newQuiz = {
            id: id,
            title: title,
            category: category,
            description: desc,
            questions: questions,
            createdAt: new Date().toISOString()
        };

        customQuizzes.push(newQuiz);
        localStorage.setItem('customQuizzes', JSON.stringify(customQuizzes));

        showNotification(`Quiz "${title}" added successfully!`, 'success');
        form.reset();
        loadQuizzes();
        
        // Dispatch event for resources page to update
        window.dispatchEvent(new Event('quizzesUpdated'));
    });
}

function loadQuizzes() {
    const customQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
    const quizzesList = document.getElementById('quizzesList');
    if (!quizzesList) return;

    quizzesList.innerHTML = '';

    if (customQuizzes.length === 0) {
        quizzesList.innerHTML = '<p style="color: var(--text-muted);">No custom quizzes created yet.</p>';
        return;
    }

    customQuizzes.forEach((quiz, index) => {
        const quizDiv = document.createElement('div');
        quizDiv.className = 'admin-item';
        quizDiv.innerHTML = `
            <div>
                <h4>${quiz.title}</h4>
                <p style="margin: 5px 0; color: var(--text-muted);">${quiz.description}</p>
                <p style="margin: 5px 0; font-size: 0.9em; color: var(--text-muted);">
                    Category: ${quiz.category} • Questions: ${quiz.questions.length}
                </p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn small outline" onclick="window.editQuiz(${index})">Edit</button>
                <button class="btn small danger" onclick="window.deleteQuiz(${index})">Delete</button>
            </div>
        `;
        quizzesList.appendChild(quizDiv);
    });
}

window.editQuiz = function(index) {
    showNotification('Edit functionality coming soon!', 'error');
};

window.deleteQuiz = function(index) {
    if (!confirm('Delete this quiz permanently?')) return;

    const customQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
    const quizTitle = customQuizzes[index].title;
    customQuizzes.splice(index, 1);
    localStorage.setItem('customQuizzes', JSON.stringify(customQuizzes));

    showNotification(`Quiz "${quizTitle}" deleted!`, 'success');
    loadQuizzes();
    
    // Dispatch event for resources page to update
    window.dispatchEvent(new Event('quizzesUpdated'));
};

// ==================== VIDEO MANAGEMENT ====================
function setupVideoForm() {
    const form = document.getElementById('videoForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const category = document.getElementById('videoCategory').value;
        const title = document.getElementById('videoTitle').value;
        const id = document.getElementById('videoId').value;
        const desc = document.getElementById('videoDesc').value;
        const youtubeId = document.getElementById('youtubeVideoId').value;

        if (!category || !title || !id || !desc || !youtubeId) {
            showNotification('Please fill in all fields!', 'error');
            return;
        }

        const customVideos = JSON.parse(localStorage.getItem('customVideos') || '[]');
        const newVideo = {
            id: id,
            title: title,
            category: category,
            description: desc,
            youtubeId: youtubeId,
            createdAt: new Date().toISOString()
        };

        customVideos.push(newVideo);
        localStorage.setItem('customVideos', JSON.stringify(customVideos));

        showNotification(`Video "${title}" added successfully!`, 'success');
        form.reset();
        loadVideos();
        
        // Dispatch event for resources page to update
        window.dispatchEvent(new Event('videosUpdated'));
    });
}

function loadVideos() {
    const customVideos = JSON.parse(localStorage.getItem('customVideos') || '[]');
    const videosList = document.getElementById('videosList');
    if (!videosList) return;

    videosList.innerHTML = '';

    if (customVideos.length === 0) {
        videosList.innerHTML = '<p style="color: var(--text-muted);">No custom videos created yet.</p>';
        return;
    }

    customVideos.forEach((video, index) => {
        const videoDiv = document.createElement('div');
        videoDiv.className = 'admin-item';
        videoDiv.innerHTML = `
            <div>
                <h4>${video.title}</h4>
                <p style="margin: 5px 0; color: var(--text-muted);">${video.description}</p>
                <p style="margin: 5px 0; font-size: 0.9em; color: var(--text-muted);">
                    Category: ${video.category} • YouTube ID: ${video.youtubeId}
                </p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn small outline" onclick="window.editVideo(${index})">Edit</button>
                <button class="btn small danger" onclick="window.deleteVideo(${index})">Delete</button>
            </div>
        `;
        videosList.appendChild(videoDiv);
    });
}

window.editVideo = function(index) {
    showNotification('Edit functionality coming soon!', 'error');
};

window.deleteVideo = function(index) {
    if (!confirm('Delete this video permanently?')) return;

    const customVideos = JSON.parse(localStorage.getItem('customVideos') || '[]');
    const videoTitle = customVideos[index].title;
    customVideos.splice(index, 1);
    localStorage.setItem('customVideos', JSON.stringify(customVideos));

    showNotification(`Video "${videoTitle}" deleted!`, 'success');
    loadVideos();
    
    // Dispatch event for resources page to update
    window.dispatchEvent(new Event('videosUpdated'));
};

// ==================== MATERIALS MANAGEMENT ====================
function setupMaterialsForm() {
    const form = document.getElementById('materialsForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const category = document.getElementById('materialCategory').value;
        const title = document.getElementById('materialTitle').value;
        const id = document.getElementById('materialId').value;
        const desc = document.getElementById('materialDesc').value;
        const url = document.getElementById('materialUrl').value;
        const type = document.getElementById('materialType').value;

        if (!category || !title || !id || !desc || !url || !type) {
            showNotification('Please fill in all fields!', 'error');
            return;
        }

        const customMaterials = JSON.parse(localStorage.getItem('customMaterials') || '[]');
        const newMaterial = {
            id: id,
            title: title,
            category: category,
            description: desc,
            url: url,
            type: type,
            createdAt: new Date().toISOString()
        };

        customMaterials.push(newMaterial);
        localStorage.setItem('customMaterials', JSON.stringify(customMaterials));

        showNotification(`Material "${title}" added successfully!`, 'success');
        form.reset();
        loadMaterials();
        
        // Dispatch event for resources page to update
        window.dispatchEvent(new Event('materialsUpdated'));
    });
}

function loadMaterials() {
    const customMaterials = JSON.parse(localStorage.getItem('customMaterials') || '[]');
    const materialsList = document.getElementById('materialsList');
    if (!materialsList) return;

    materialsList.innerHTML = '';

    if (customMaterials.length === 0) {
        materialsList.innerHTML = '<p style="color: var(--text-muted);">No custom materials created yet.</p>';
        return;
    }

    customMaterials.forEach((material, index) => {
        const materialDiv = document.createElement('div');
        materialDiv.className = 'admin-item';
        materialDiv.innerHTML = `
            <div>
                <h4>${material.title}</h4>
                <p style="margin: 5px 0; color: var(--text-muted);">${material.description}</p>
                <p style="margin: 5px 0; font-size: 0.9em; color: var(--text-muted);">
                    Category: ${material.category} • Type: ${material.type.toUpperCase()}
                </p>
                <p style="margin: 5px 0; font-size: 0.85em; word-break: break-all;">
                    <a href="${material.url}" target="_blank" style="color: var(--primary);">View File →</a>
                </p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn small outline" onclick="window.editMaterial(${index})">Edit</button>
                <button class="btn small danger" onclick="window.deleteMaterial(${index})">Delete</button>
            </div>
        `;
        materialsList.appendChild(materialDiv);
    });
}

window.editMaterial = function(index) {
    showNotification('Edit functionality coming soon!', 'error');
};

window.deleteMaterial = function(index) {
    if (!confirm('Delete this material permanently?')) return;

    const customMaterials = JSON.parse(localStorage.getItem('customMaterials') || '[]');
    const materialTitle = customMaterials[index].title;
    customMaterials.splice(index, 1);
    localStorage.setItem('customMaterials', JSON.stringify(customMaterials));

    showNotification(`Material "${materialTitle}" deleted!`, 'success');
    loadMaterials();
    
    // Dispatch event for resources page to update
    window.dispatchEvent(new Event('materialsUpdated'));
};

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';

    users.forEach((user, index) => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';

        const joinDate = new Date(parseInt(localStorage.getItem('userJoinDate_' + user.email) || Date.now())).toLocaleDateString();

        userDiv.innerHTML = `
            <div class="user-info">
                <h4>${user.name}</h4>
                <p>${user.email}</p>
            </div>
            <div>
                <span class="badge ${user.isAdmin ? 'admin' : 'student'}">${user.isAdmin ? 'Admin' : 'Student'}</span>
            </div>
            <div class="user-info">
                <p>Joined: ${joinDate}</p>
            </div>
            <div style="display: flex; gap: 10px;">
                ${!user.isAdmin ? `<button class="btn small primary" onclick="window.makeAdmin(${index})">Make Admin</button>` : ''}
                ${!user.isAdmin ? `<button class="btn small danger" onclick="window.removeUser(${index})">Remove</button>` : '<span style="color: var(--text-muted);">Admin Account</span>'}
            </div>
        `;
        usersList.appendChild(userDiv);
    });

    if (users.length === 0) {
        usersList.innerHTML = '<p style="color: var(--text-muted);">No users registered yet.</p>';
    }
}
