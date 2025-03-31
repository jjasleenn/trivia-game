/**
 * Initializes the Trivia Game when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    
    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const newPlayerButton = document.getElementById("new-player");
    const usernameInput = document.getElementById("username");
    const scoreTableBody = document.querySelector("#score-table tbody");

    // Initialize the game
	checkUsername(); 
    fetchQuestions();
    displayScores();
     
    /**
	 * Fetches trivia questions from the API and displays them.
	 */
    function fetchQuestions() {
        showLoading(true);  // Show loading state

        fetch("https://opentdb.com/api.php?amount=10&type=multiple")
            .then((response) => response.json())
            .then((data) => {
                displayQuestions(data.results);
                showLoading(false);   // Hide loading state

            })
            .catch((error) => {
                console.error("Error fetching questions:", error);
                showLoading(false); // Hide loading state on error
            });
    }
    
    /**
	 * Toggles the display of the loading state and question container.
	 *
	 * @param {boolean} isLoading - Indicates whether the loading state should be shown.
	 */
    
    function showLoading(isLoading) {
        document.getElementById("loading-container").classList.toggle("hidden", !isLoading);
        questionContainer.classList.toggle("hidden", isLoading);
    }
     
    /**
	 * Displays fetched trivia questions.
	 * @param {Object[]} questions - Array of trivia questions.
	 */
    function displayQuestions(questions) {
        questionContainer.innerHTML = ""; // Clear existing questions
        questions.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(question.correct_answer, question.incorrect_answers, index)}
            `;
            questionContainer.appendChild(questionDiv);
        });
    }

    /**
	 * Creates HTML for answer options.
	 * @param {string} correctAnswer - The correct answer for the question.
	 * @param {string[]} incorrectAnswers - Array of incorrect answers.
	 * @param {number} questionIndex - The index of the current question.
	 * @returns {string} HTML string of answer options.
	 */
    function createAnswerOptions(correctAnswer, incorrectAnswers, index) {
        const allAnswers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
        return allAnswers
            .map(
                (answer) => `
                <label>
                    <input type="radio" name="answer${index}" value="${answer}" ${
                        answer === correctAnswer ? 'data-correct="true"' : ""
                    }>
                    ${answer}
                </label>
            `
            )
            .join(" ");
    }

    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    function getCookie(name) {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            const [key, value] = cookie.trim().split("=");
            if (key === name) return value;
        }
        return "";
    }

    function checkUsername() {
        const storedUsername = getCookie("username");
        if (storedUsername) {
            usernameInput.value = storedUsername;
            usernameInput.disabled = true;
            newPlayerButton.classList.remove("hidden");
        }
    }

    function saveScore(username, score) {
        const scores = JSON.parse(localStorage.getItem("scores")) || [];
        scores.push({ username, score });
        localStorage.setItem("scores", JSON.stringify(scores));
        displayScores();
    }
    
    function displayScores() {
        scoreTableBody.innerHTML = "";
        const scores = JSON.parse(localStorage.getItem("scores")) || [];
        scores.forEach(({ username, score }) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${username}</td><td>${score}</td>`;
            scoreTableBody.appendChild(row);
        });
    }

    function calculateScore() {
        let score = 0;
        document.querySelectorAll("input[type=radio]:checked").forEach((input) => {
            if (input.hasAttribute("data-correct")) score++;
        });
        return score;
    }

    // Event listeners for form submission and new player button
    /**
	 * Handles the trivia form submission.
	 * @param {Event} event - The submit event.
	 */
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        //... form submission logic including setting cookies and calculating score
        const username = usernameInput.value.trim();
        if (!username) {
            alert("Please enter your name.");
            return;
        }
        setCookie("username", username, 7);
        usernameInput.disabled = true;
        newPlayerButton.classList.remove("hidden");
        const score = calculateScore();
        saveScore(username, score);
        alert(`Game over! Your score: ${score}`);
        fetchQuestions();
    });
  
    newPlayerButton.addEventListener("click", function () {
    document.cookie = "username=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    usernameInput.value = "";
    usernameInput.disabled = false;
    newPlayerButton.classList.add("hidden");
 
    });
});
