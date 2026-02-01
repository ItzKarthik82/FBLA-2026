let currentLessonId = null;
let currentQuizId = null;
let currentQuestionIndex = 0;
let quizAnswers = [];

function switchTab(tabId, button) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (button) button.classList.add('active');
}

function startLesson(lessonId) {
    currentLessonId = lessonId;

    const defaultLessonData = {
        'algebra': { file: 'algebra-guide.txt', title: 'Algebra Essentials' },
        'geometry': { file: 'geometry-guide.txt', title: 'Geometry Fundamentals' },
        'biology': { file: 'biology-guide.txt', title: 'Biology Basics' },
        'chemistry': { file: 'chemistry-guide.txt', title: 'Chemistry Fundamentals' },
        'essay': { file: 'essay-guide.txt', title: 'Essay Writing' },
        'grammar': { file: 'grammar-guide.txt', title: 'Grammar Basics' },
        'history': { file: 'history-guide.txt', title: 'World History' },
        'us-history': { file: 'us-history-guide.txt', title: 'US History' }
    };

    // Check for custom lessons first
    const customLessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
    const customLesson = customLessons.find(l => l.id === lessonId);

    const lessonTitle = document.getElementById('lessonTitle');
    const lessonContent = document.getElementById('lessonContent');
    const lessonModal = document.getElementById('lessonModal');

    if (customLesson) {
        // Custom lesson
        if (lessonTitle) lessonTitle.textContent = customLesson.title;
        if (lessonContent) lessonContent.innerHTML = `<pre>${customLesson.content}</pre>`;
        if (lessonModal) lessonModal.classList.add('open');
    } else {
        // Default lesson
        const data = defaultLessonData[lessonId];
        if (!data) {
            showToast('Lesson not available yet.');
            return;
        }

        if (lessonTitle) lessonTitle.textContent = data.title;

        fetch(`../assets/materials/${data.file}`)
            .then(response => response.text())
            .then(content => {
                if (lessonContent) lessonContent.innerHTML = `<pre>${content}</pre>`;
                if (lessonModal) lessonModal.classList.add('open');
            })
            .catch(() => {
                if (lessonContent) lessonContent.innerHTML = '<p>Error loading lesson content.</p>';
                if (lessonModal) lessonModal.classList.add('open');
            });
    }
}

function completeLesson() {
    if (!currentLessonId) return;

    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    if (!completedLessons.includes(currentLessonId)) {
        completedLessons.push(currentLessonId);
        localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    }

    updateLessonProgress();

    const lessons = completedLessons.length;
    const quizzes = parseInt(localStorage.getItem('quizzes') || '0');
    const sessions = parseInt(localStorage.getItem('sessions') || '0');
    updateAchievements(lessons, quizzes, sessions);

    addActivity(`Completed "${currentLessonId.replace('-', ' ')}" lesson`);

    showToast('Lesson completed!');
    closeModal();
}

function closeModal() {
    const lessonModal = document.getElementById('lessonModal');
    if (lessonModal) lessonModal.classList.remove('open');
    currentLessonId = null;
}

function updateLessonProgress() {
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');

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

    // Add custom lessons to the list
    const customLessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
    customLessons.forEach(lesson => {
        lessons.push({
            id: lesson.id,
            statusId: `${lesson.id}-status`,
            btnId: `${lesson.id}-btn`
        });
    });

    lessons.forEach(lesson => {
        const statusEl = document.getElementById(lesson.statusId);
        const btnEl = document.getElementById(lesson.btnId);

        if (completedLessons.includes(lesson.id)) {
            if (statusEl) statusEl.textContent = '✓ Completed';
            if (btnEl) {
                btnEl.classList.add('completed');
            }
        } else {
            if (statusEl) statusEl.textContent = '';
            if (btnEl) {
                btnEl.classList.remove('completed');
            }
        }
    });

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
            if (completed === total && total > 0) {
                courseEl.classList.add('completed');
            } else {
                courseEl.classList.remove('completed');
            }
        }
    });
}

function startQuiz(quizId) {
    currentQuizId = quizId;
    currentQuestionIndex = 0;
    quizAnswers = [];

    const quizData = getCurrentQuizData();
    const quiz = quizData[quizId];
    if (!quiz) {
        showToast('Quiz not available yet.');
        return;
    }

    const quizTitle = document.getElementById('quizTitle');
    if (quizTitle) quizTitle.textContent = quiz.title;

    // Reset quiz UI
    const resultDiv = document.getElementById('quizResult');
    const questionContainer = document.getElementById('quizQuestionContainer');
    const navigation = document.getElementById('quizNavigation');

    if (questionContainer) questionContainer.style.display = 'block';
    if (navigation) navigation.style.display = 'flex';
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }

    showQuestion(quiz, 0);

    const quizModal = document.getElementById('quizModal');
    if (quizModal) quizModal.classList.add('open');
}

function showQuestion(quiz, index) {
    const question = quiz.questions[index];

    const questionEl = document.getElementById('quizQuestion');
    if (questionEl) questionEl.textContent = question.question;

    const optionsContainer = document.getElementById('quizOptions');
    if (optionsContainer) {
        optionsContainer.innerHTML = question.options.map((option, i) =>
            `<label class="quiz-option">
                <input type="radio" name="quiz-option" value="${i}" ${quizAnswers[index] !== undefined && quizAnswers[index] === i ? 'checked' : ''}>
                <span class="option-text">${option}</span>
            </label>`
        ).join('');
    }

    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');
    const submitBtn = document.getElementById('submitQuiz');

    if (prevBtn) prevBtn.style.display = index > 0 ? 'inline-block' : 'none';
    if (nextBtn) nextBtn.style.display = index < quiz.questions.length - 1 ? 'inline-block' : 'none';
    if (submitBtn) submitBtn.style.display = index === quiz.questions.length - 1 ? 'inline-block' : 'none';

    const counter = document.getElementById('questionCounter');
    if (counter) counter.textContent = `Question ${index + 1} of ${quiz.questions.length}`;
}

function nextQuestion() {
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    if (selectedOption) {
        quizAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    }

    currentQuestionIndex++;
    const quizData = getCurrentQuizData();
    showQuestion(quizData[currentQuizId], currentQuestionIndex);
}

function prevQuestion() {
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    if (selectedOption) {
        quizAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    }

    currentQuestionIndex--;
    const quizData = getCurrentQuizData();
    showQuestion(quizData[currentQuizId], currentQuestionIndex);
}

function submitQuizAnswer() {
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    if (selectedOption) {
        quizAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    }

    const quizData = getCurrentQuizData();
    const quiz = quizData[currentQuizId];
    let correctAnswers = 0;

    quiz.questions.forEach((question, index) => {
        if (quizAnswers[index] === question.correct) {
            correctAnswers++;
        }
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    const resultDiv = document.getElementById('quizResult');
    const questionContainer = document.getElementById('quizQuestionContainer');
    const navigation = document.getElementById('quizNavigation');

    if (questionContainer) questionContainer.style.display = 'none';
    if (navigation) navigation.style.display = 'none';

    if (resultDiv) {
        resultDiv.innerHTML = `
            <div class="quiz-results ${score >= 70 ? 'correct' : 'incorrect'}">
                <h3>Quiz Complete!</h3>
                <div class="score-display">
                    <div class="score-circle ${score >= 70 ? 'pass' : 'fail'}">
                        ${score}%
                    </div>
                    <p>You got ${correctAnswers} out of ${quiz.questions.length} questions correct.</p>
                </div>
                <div class="result-message">
                    ${score >= 90 ? 'Excellent work! 🎉' :
                      score >= 70 ? 'Good job! Keep practicing.' :
                      'Keep studying and try again! 📚'}
                </div>
            </div>
        `;
        resultDiv.style.display = 'block';
    }

    if (score >= 70) {
        const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
        if (!completedQuizzes.includes(currentQuizId)) {
            completedQuizzes.push(currentQuizId);
            localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
        }

        const quizzes = parseInt(localStorage.getItem('quizzes') || '0') + 1;
        localStorage.setItem('quizzes', quizzes);

        updateQuizProgress();
        updateAchievements();
        addActivity(`Completed "${quiz.title}" with ${score}%`);
    }

    setTimeout(() => {
        if (!resultDiv) return;
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn';
        closeBtn.textContent = 'Close Quiz';
        closeBtn.onclick = closeQuizModal;
        resultDiv.appendChild(closeBtn);
    }, 2000);
}

function getCurrentQuizData() {
    return {
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
}

function closeQuizModal() {
    const quizModal = document.getElementById('quizModal');
    if (quizModal) quizModal.classList.remove('open');
    const questionContainer = document.getElementById('quizQuestionContainer');
    if (questionContainer) questionContainer.style.display = 'block';
    const result = document.getElementById('quizResult');
    if (result) result.style.display = 'none';
    const navigation = document.getElementById('quizNavigation');
    if (navigation) navigation.style.display = 'flex';
    currentQuizId = null;
    currentQuestionIndex = 0;
    quizAnswers = [];
}

function updateQuizProgress() {
    const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');

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

document.addEventListener('DOMContentLoaded', () => {
    initBaseUI();
    updateAuthUI();
    
    // Load custom lessons first, before updating progress
    loadCustomLessons();
    
    updateLessonProgress();
    updateQuizProgress();
    startStudyTimeTracking();

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId, btn);
        });
    });

    // Refresh lessons on visible to catch any changes
    setTimeout(() => {
        loadCustomLessons();
        updateLessonProgress();
    }, 500);
});

function loadCustomLessons() {
    const customLessons = JSON.parse(localStorage.getItem('customLessons') || '[]');
    if (customLessons.length === 0) return;

    // Map categories to existing course containers
    // Handle both "mathematics"/"math" and "history"/"history & social studies" variations
    const categoryToCourseId = {
        'mathematics': 'math-course',
        'math': 'math-course',
        'science': 'science-course',
        'english': 'english-course',
        'english & writing': 'english-course',
        'history': 'history-course',
        'history & social studies': 'history-course'
    };

    // Group custom lessons by category
    const categories = {};
    customLessons.forEach(lesson => {
        // Normalize category to lowercase for grouping
        const normalizedCategory = lesson.category ? lesson.category.toLowerCase() : '';
        if (!categories[normalizedCategory]) {
            categories[normalizedCategory] = [];
        }
        categories[normalizedCategory].push(lesson);
    });

    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');

    // Add custom lessons to existing course cards
    Object.keys(categories).forEach(category => {
        const courseId = categoryToCourseId[category];
        if (!courseId) return; // Skip if category doesn't map to a course

        const courseCard = document.getElementById(courseId);
        if (!courseCard) return;

        const subLessonsDiv = courseCard.querySelector('.sub-lessons');
        if (!subLessonsDiv) return;

        const lessons = categories[category];

        // Add custom lessons to the existing sub-lessons div
        lessons.forEach(lesson => {
            // Check if lesson already exists (avoid duplicates)
            if (document.getElementById(`${lesson.id}-btn`)) return;

            const subLesson = document.createElement('div');
            subLesson.className = 'sub-lesson';
            subLesson.innerHTML = `
                <span class="lesson-title">${lesson.title}</span>
                <span class="completion-status" id="${lesson.id}-status"></span>
                <button class="btn small" id="${lesson.id}-btn" onclick="startLesson('${lesson.id}')">Start Lesson</button>
            `;
            subLessonsDiv.appendChild(subLesson);

            // Set initial completion status
            const statusEl = document.getElementById(`${lesson.id}-status`);
            const btnEl = document.getElementById(`${lesson.id}-btn`);
            if (completedLessons.includes(lesson.id)) {
                if (statusEl) statusEl.textContent = '✓ Completed';
                if (btnEl) btnEl.classList.add('completed');
            }
        });

        // Update course progress to include custom lessons
        const progressEl = courseCard.querySelector('.course-progress');
        if (progressEl) {
            const allCourseLessons = Array.from(courseCard.querySelectorAll('.sub-lesson')).map(el => {
                const btn = el.querySelector('button');
                return btn ? btn.id.replace('-btn', '') : null;
            }).filter(Boolean);

            const completed = allCourseLessons.filter(lessonId => completedLessons.includes(lessonId)).length;
            const total = allCourseLessons.length;
            progressEl.textContent = `${completed} / ${total} completed`;
        }
    });
}

window.addEventListener('pageshow', () => {
    updateLessonProgress();
    updateQuizProgress();
    loadCustomLessons();
});

// Listen for lesson updates from admin panel
window.addEventListener('lessonsUpdated', () => {
    loadCustomLessons();
    updateLessonProgress();
});
