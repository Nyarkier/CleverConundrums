// DOM elements
const riddleElement = document.getElementById('riddle');
const answerElement = document.getElementById('answer');
const answerContainer = document.getElementById('answer-container');
const showAnswerBtn = document.getElementById('show-answer');
const nextRiddleBtn = document.getElementById('next-riddle');
const counterElement = document.getElementById('counter');

// App state
let questions = [];
let currentQuestionIndex = 0;
const API_URL = 'https://opentdb.com/api.php?amount=10';

// Fallback questions in case API fails
const fallbackQuestions = [
    {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        correct_answer: "An echo"
    },
    {
        question: "What is always in front of you but can't be seen?",
        correct_answer: "The future"
    },
    {
        question: "What has hands but can't clap?",
        correct_answer: "A clock"
    }
];

// Fetch questions from the API
async function fetchQuestions() {
    try {
        // Show loading state
        riddleElement.textContent = "Loading trivia questions...";
        
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.response_code === 0 && data.results && data.results.length > 0) {
            // Clean HTML entities in the API response
            questions = data.results.map(q => ({
                question: decodeHtmlEntities(q.question),
                correct_answer: decodeHtmlEntities(q.correct_answer)
            }));
            
            // Load saved position or start fresh
            loadState();
            displayQuestion();
        } else {
            throw new Error("Invalid API response");
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        // Fall back to default questions if API fails
        questions = fallbackQuestions;
        loadState();
        displayQuestion();
    }
}

// Helper function to decode HTML entities that come from the API
function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Load state from localStorage if available
function loadState() {
    const savedIndex = localStorage.getItem('brainTeaserIndex');
    if (savedIndex !== null) {
        currentQuestionIndex = parseInt(savedIndex);
        // Make sure the index is valid
        if (currentQuestionIndex >= questions.length) {
            currentQuestionIndex = 0;
        }
    } else {
        // If no saved state, start with first question (API already randomizes)
        currentQuestionIndex = 0;
    }
}

// Save current state to localStorage
function saveState() {
    localStorage.setItem('brainTeaserIndex', currentQuestionIndex.toString());
}

// Display the current question
function displayQuestion() {
    if (questions.length === 0) {
        riddleElement.textContent = "No questions available. Please refresh to try again.";
        return;
    }
    
    // Hide the answer when showing a new question
    answerContainer.classList.add('hidden');
    
    // Update the counter
    counterElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    // Update the question text with animation
    riddleElement.style.opacity = 0;
    setTimeout(() => {
        riddleElement.textContent = questions[currentQuestionIndex].question;
        riddleElement.style.opacity = 1;
    }, 300);
    
    // Update the answer text (hidden)
    answerElement.textContent = questions[currentQuestionIndex].correct_answer;
    
    // Save state
    saveState();
}

// Show answer
function revealAnswer() {
    answerContainer.classList.remove('hidden');
    showAnswerBtn.blur(); // Remove focus from button after click
}

// Move to next question
function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    displayQuestion();
    nextRiddleBtn.blur(); // Remove focus from button after click
}

// Fetch new questions when current set is completed
function loadNewQuestionsIfNeeded() {
    if (currentQuestionIndex >= questions.length - 1) {
        fetchQuestions();
    } else {
        nextQuestion();
    }
}

// Event listeners
showAnswerBtn.addEventListener('click', revealAnswer);
nextRiddleBtn.addEventListener('click', loadNewQuestionsIfNeeded);

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        loadNewQuestionsIfNeeded();
    } else if (event.key === ' ' || event.key === 'Enter') {
        if (answerContainer.classList.contains('hidden')) {
            revealAnswer();
        } else {
            loadNewQuestionsIfNeeded();
        }
    }
});

// Initialize the app
function initialize() {
    fetchQuestions();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);