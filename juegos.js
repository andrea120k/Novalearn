
/* ==========================================
   NOVALEARN - SISTEMA DE LOS SEIS JUEGOS
   ========================================== */

"use strict";

const gameCards = document.querySelectorAll(".game-card");
const gamesMenu = document.querySelector("#games-menu");
const gamePlay = document.querySelector("#game-play");
const gameContent = document.querySelector("#game-content");
const backButton = document.querySelector("#back-to-games");
const totalPointsDisplay = document.querySelector("#total-points");
const currentPointsDisplay = document.querySelector("#current-points");

let totalPoints = 0;
let roundPoints = 0;
let currentGame = "";
let questionIndex = 0;
let attempts = 0;
let gameData = [];
let answered = false;
let memoryFirst = null;
let memoryLocked = false;
let memoryMatches = 0;
let foundWords = [];
let selectedLetters = [];

const POINTS_PER_ANSWER = 10;

const games = {
    memory: {
        title: "Memory Match",
        description: "Encuentra las parejas correctas."
    },
    order: {
        title: "Order the Sentence",
        description: "Ordena las palabras para formar una oración."
    },
    search: {
        title: "Word Search",
        description: "Encuentra las palabras escondidas."
    },
    quiz: {
        title: "English Quiz",
        description: "Elige la respuesta correcta."
    },
    complete: {
        title: "Missing Letter",
        description: "Completa la palabra en inglés."
    },
    guess: {
        title: "Guess the Word",
        description: "Lee la pista y adivina la palabra."
    }
};

/* ==========================================
   DATOS DE LOS JUEGOS
   ========================================== */

const memoryPairs = [
    { word: "APPLE", emoji: "🍎" },
    { word: "HOUSE", emoji: "🏠" },
    { word: "CAT", emoji: "🐱" },
    { word: "BOOK", emoji: "📚" },
    { word: "SUN", emoji: "☀️" },
    { word: "DOG", emoji: "🐶" }
];

const sentenceQuestions = [
    {
        words: ["every", "I", "morning", "eat", "breakfast"],
        answer: "I eat breakfast every morning."
    },
    {
        words: ["playing", "are", "the", "children", "outside"],
        answer: "The children are playing outside."
    },
    {
        words: ["usually", "my", "homework", "I", "after", "school", "do"],
        answer: "I usually do my homework after school."
    },
    {
        words: ["beautiful", "a", "has", "garden", "she"],
        answer: "She has a beautiful garden."
    },
    {
        words: ["because", "English", "I", "learning", "enjoy", "is", "fun"],
        answer: "I enjoy learning English because it is fun."
    }
];

const quizQuestions = [
    {
        question: "What is the opposite of 'expensive'?",
        options: ["Cheap", "Tall", "Hungry", "Slow"],
        answer: "Cheap",
        explanation: "'Cheap' significa barato."
    },
    {
        question: "Choose the correct sentence.",
        options: [
            "She go to school.",
            "She goes to school.",
            "She going school.",
            "She gone to school."
        ],
        answer: "She goes to school.",
        explanation: "Con 'she', en presente simple normalmente agregamos -s al verbo."
    },
    {
        question: "What does 'carefully' mean?",
        options: ["Rápidamente", "Cuidadosamente", "Ayer", "Nunca"],
        answer: "Cuidadosamente",
        explanation: "'Carefully' significa cuidadosamente."
    },
    {
        question: "Complete: They ___ watching a movie.",
        options: ["is", "am", "are", "be"],
        answer: "are",
        explanation: "Usamos 'are' con 'they'."
    },
    {
        question: "What is the past tense of 'buy'?",
        options: ["Buyed", "Bought", "Buying", "Buys"],
        answer: "Bought",
        explanation: "'Buy' es irregular: su pasado es 'bought'."
    },
    {
        question: "What does 'I am looking forward to it' express?",
        options: [
            "Tengo miedo",
            "Lo estoy esperando con ilusión",
            "No lo recuerdo",
            "Estoy cansado"
        ],
        answer: "Lo estoy esperando con ilusión",
        explanation: "La expresión comunica ilusión por algo que ocurrirá."
    }
];

const missingQuestions = [
    {
        word: "SCHOOL",
        clue: "Lugar donde estudias.",
        missing: 2
    },
    {
        word: "FRIEND",
        clue: "Persona con quien compartes y juegas.",
        missing: 3
    },
    {
        word: "GARDEN",
        clue: "Lugar donde crecen flores y plantas.",
        missing: 2
    },
    {
        word: "TEACHER",
        clue: "Persona que enseña en clase.",
        missing: 4
    },
    {
        word: "RAINBOW",
        clue: "Arco de colores que puede aparecer después de la lluvia.",
        missing: 3
    },
    {
        word: "LIBRARY",
        clue: "Lugar donde puedes encontrar muchos libros.",
        missing: 2
    }
];

const guessQuestions = [
    {
        word: "ELEPHANT",
        clue: "I am a very large animal. I have a long trunk.",
        translation: "Soy un animal muy grande y tengo una trompa larga."
    },
    {
        word: "UMBRELLA",
        clue: "You use me when it rains to stay dry.",
        translation: "Me usas cuando llueve para no mojarte."
    },
    {
        word: "BUTTERFLY",
        clue: "I am an insect with colorful wings.",
        translation: "Soy un insecto con alas de colores."
    },
    {
        word: "REFRIGERATOR",
        clue: "You keep food cold inside me.",
        translation: "Guardas la comida fría dentro de mí."
    },
    {
        word: "LIBRARIAN",
        clue: "I help people find books in a library.",
        translation: "Ayudo a las personas a encontrar libros en una biblioteca."
    },
    {
        word: "SUNFLOWER",
        clue: "I am a tall yellow flower that follows the sunlight.",
        translation: "Soy una flor amarilla alta que sigue la luz del sol."
    }
];

/* ==========================================
   FUNCIONES GENERALES
   ========================================== */

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function updatePoints() {
    totalPointsDisplay.textContent = totalPoints;
    currentPointsDisplay.textContent = roundPoints;
}

function addPoints(points = POINTS_PER_ANSWER) {
    totalPoints += points;
    roundPoints += points;
    updatePoints();
}

function showFeedback(message, type = "") {
    const feedback = gameContent.querySelector(".game-feedback");

    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = "game-feedback";

    if (type) {
        feedback.classList.add(type);
    }
}

function setGameContent(html) {
    gameContent.innerHTML = html;
}

function openGame(gameName) {
    if (!games[gameName]) return;

    currentGame = gameName;
    roundPoints = 0;
    questionIndex = 0;
    attempts = 0;
    answered = false;
    memoryFirst = null;
    memoryLocked = false;
    memoryMatches = 0;
    foundWords = [];
    selectedLetters = [];

    updatePoints();

    gamesMenu.hidden = true;
    gamePlay.hidden = false;

    gamePlay.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    switch (gameName) {
        case "memory":
            startMemoryGame();
            break;
        case "order":
            startOrderGame();
            break;
        case "search":
            startWordSearch();
            break;
        case "quiz":
            startQuiz();
            break;
        case "complete":
            startMissingLetterGame();
            break;
        case "guess":
            startGuessGame();
            break;
    }
}

function returnToMenu() {
    gamePlay.hidden = true;
    gamesMenu.hidden = false;
    currentGame = "";

    gamesMenu.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function finishGame(message) {
    setGameContent(`
        <div style="text-align:center;padding:18px 0;">
            <div style="font-size:64px;margin-bottom:15px;">🏆</div>
            <h2>¡Muy buen trabajo!</h2>
            <p>${escapeHTML(message)}</p>
            <p><strong>Puntos de esta partida: ${roundPoints}</strong></p>
            <p>¡Sigue practicando inglés con NovaLearn!</p>
            <button class="game-primary-button" id="play-again" type="button">
                Jugar otra vez ↻
            </button>
            <button id="finish-back" type="button">
                Volver a los juegos
            </button>
        </div>
    `);

    document.querySelector("#play-again").addEventListener("click", () => {
        openGame(currentGame);
    });

    document.querySelector("#finish-back").addEventListener("click", returnToMenu);
}

/* ==========================================
   JUEGO 1: MEMORY MATCH
   ========================================== */

function startMemoryGame() {
    const cards = shuffle([
        ...memoryPairs.map(pair => ({
            key: pair.word,
            face: pair.word,
            kind: "word"
        })),
        ...memoryPairs.map(pair => ({
            key: pair.word,
            face: pair.emoji,
            kind: "emoji"
        }))
    ]);

    memoryMatches = 0;
    memoryFirst = null;
    memoryLocked = false;

    setGameContent(`
        <h2>🧠 Memory Match</h2>
        <p>Encuentra la palabra en inglés y su imagen correspondiente. ¡Hay seis parejas!</p>
        <p class="game-feedback" aria-live="polite">Selecciona dos tarjetas para empezar.</p>
        <div id="memory-board" style="
            display:grid;
            grid-template-columns:repeat(4,minmax(0,1fr));
            gap:10px;
            margin-top:22px;">
            ${cards.map((card, index) => `
                <button type="button"
                    class="memory-card"
                    data-index="${index}"
                    data-key="${escapeHTML(card.key)}"
                    data-face="${escapeHTML(card.face)}"
                    data-kind="${card.kind}"
                    aria-label="Tarjeta ${index + 1}"
                    style="
                        min-height:95px;
                        margin:0;
                        padding:8px;
                        background:#fff1f2;
                        border:2px solid #ffd4d8;
                        border-radius:16px;
                        font-size:${card.kind === "emoji" ? "30px" : "15px"};
                        overflow-wrap:anywhere;">
                    ?
                </button>
            `).join("")}
        </div>
    `);

    gameContent.querySelectorAll(".memory-card").forEach(card => {
        card.addEventListener("click", () => flipMemoryCard(card));
    });
}

function flipMemoryCard(card) {
    if (
        memoryLocked ||
        card.disabled ||
        card.dataset.revealed === "true"
    ) return;

    card.textContent = card.dataset.face;
    card.dataset.revealed = "true";
    card.style.background = "#f1f5ff";
    card.style.borderColor = "#3978f6";

    if (!memoryFirst) {
        memoryFirst = card;
        return;
    }

    const first = memoryFirst;
    memoryFirst = null;

    if (
        first.dataset.key === card.dataset.key &&
        first.dataset.kind !== card.dataset.kind
    ) {
        first.disabled = true;
        card.disabled = true;
        first.style.background = "#e6fff3";
        card.style.background = "#e6fff3";
        first.style.borderColor = "#35bd86";
        card.style.borderColor = "#35bd86";

        memoryMatches++;
        addPoints();

        showFeedback("¡Pareja correcta! +10 puntos 🎉", "success");

        if (memoryMatches === memoryPairs.length) {
            setTimeout(() => {
                finishGame("¡Encontraste todas las parejas!");
            }, 450);
        }
    } else {
        memoryLocked = true;
        showFeedback("No coinciden. ¡Inténtalo de nuevo!");

        setTimeout(() => {
            [first, card].forEach(item => {
                if (item.dataset.revealed === "true" && !item.disabled) {
                    item.textContent = "?";
                    item.dataset.revealed = "false";
                    item.style.background = "#fff1f2";
                    item.style.borderColor = "#ffd4d8";
                }
            });

            memoryLocked = false;
        }, 850);
    }
}

/* ==========================================
   JUEGO 2: ORDER THE SENTENCE
   ========================================== */

function startOrderGame() {
    questionIndex = 0;
    showOrderQuestion();
}

function showOrderQuestion() {
    if (questionIndex >= sentenceQuestions.length) {
        finishGame("¡Terminaste todas las oraciones!");
        return;
    }

    const question = sentenceQuestions[questionIndex];
    const shuffledWords = shuffle(question.words);
    let chosenWords = [];

    setGameContent(`
        <h2>🔤 Order the Sentence</h2>
        <p>Pregunta ${questionIndex + 1} de ${sentenceQuestions.length}</p>
        <p>Organiza las palabras para formar una oración correcta en inglés.</p>
        <div id="chosen-words" style="
            min-height:65px;
            display:flex;
            align-items:center;
            justify-content:center;
            flex-wrap:wrap;
            gap:6px;
            margin:22px 0;
            padding:12px;
            border:2px dashed #c8d7ff;
            border-radius:16px;
            background:#f6f8ff;">
            <span style="color:#777;">Tus palabras aparecerán aquí</span>
        </div>
        <div id="word-options" style="
            display:flex;
            flex-wrap:wrap;
            justify-content:center;
            gap:6px;">
            ${shuffledWords.map((word, index) => `
                <button type="button" data-word-index="${index}"
                    style="margin:0;">${escapeHTML(word)}</button>
            `).join("")}
        </div>
        <div style="margin-top:22px;">
            <button type="button" class="game-primary-button" id="check-order">
                Comprobar respuesta
            </button>
            <button type="button" id="reset-order">Reiniciar</button>
        </div>
        <p class="game-feedback" aria-live="polite"></p>
    `);

    const chosenArea = document.querySelector("#chosen-words");
    const optionButtons = [...document.querySelectorAll("[data-word-index]")];

    function renderChosen() {
        chosenArea.innerHTML = chosenWords.length
            ? chosenWords.map((item, index) => `
                <button type="button" data-remove-index="${index}"
                    style="margin:0;background:#e9efff;border-color:#b9d0ff;">
                    ${escapeHTML(item.word)} ×
                </button>
            `).join("")
            : '<span style="color:#777;">Tus palabras aparecerán aquí</span>';

        chosenArea.querySelectorAll("[data-remove-index]").forEach(button => {
            button.addEventListener("click", () => {
                const removed = chosenWords.splice(
                    Number(button.dataset.removeIndex), 1
                )[0];

                const originalButton = optionButtons.find(
                    item => Number(item.dataset.wordIndex) === removed.index
                );

                if (originalButton) originalButton.disabled = false;

                renderChosen();
            });
        });
    }

    optionButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (button.disabled) return;

            const index = Number(button.dataset.wordIndex);

            chosenWords.push({
                word: shuffledWords[index],
                index
            });

            button.disabled = true;
            renderChosen();
            showFeedback("");
        });
    });

    document.querySelector("#reset-order").addEventListener("click", () => {
        chosenWords = [];
        optionButtons.forEach(button => button.disabled = false);
        renderChosen();
        showFeedback("Puedes volver a intentarlo.");
    });

    document.querySelector("#check-order").addEventListener("click", () => {
        const attempt = chosenWords.map(item => item.word).join(" ");
        const normalize = text => text
            .toLowerCase()
            .replace(/[.!?]/g, "")
            .trim()
            .replace(/\s+/g, " ");

        if (normalize(attempt) === normalize(question.answer)) {
            addPoints();
            showFeedback("¡Correcto! +10 puntos 🎉", "success");

            setTimeout(() => {
                questionIndex++;
                showOrderQuestion();
            }, 900);
        } else {
            showFeedback("Todavía no. Revisa el orden y vuelve a intentarlo.", "error");
        }
    });
}

/* ==========================================
   JUEGO 3: WORD SEARCH
   ========================================== */

function startWordSearch() {
    const words = ["CAT", "SUN", "BOOK", "FISH", "TREE"];
    const size = 10;
    const grid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () =>
            String.fromCharCode(65 + Math.floor(Math.random() * 26))
        )
    );

    const placements = [];

    words.forEach((word, wordIndex) => {
        let placed = false;

        for (let tries = 0; tries < 100 && !placed; tries++) {
            const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);

            const fits = direction === "horizontal"
                ? col + word.length <= size
                : row + word.length <= size;

            if (!fits) continue;

            const coords = Array.from({ length: word.length }, (_, i) => ({
                row: row + (direction === "vertical" ? i : 0),
                col: col + (direction === "horizontal" ? i : 0)
            }));

            const overlaps = coords.some((coord, i) =>
                grid[coord.row][coord.col] !==
                    String.fromCharCode(65 + Math.floor(Math.random() * 26)) &&
                placements.some(place =>
                    place.coords.some(existing =>
                        existing.row === coord.row &&
                        existing.col === coord.col
                    )
                ) &&
                !coords.some(other =>
                    other.row === coord.row && other.col === coord.col
                )
            );

            if (overlaps) continue;

            coords.forEach((coord, i) => {
                grid[coord.row][coord.col] = word[i];
            });

            placements.push({ word, coords });
            placed = true;
        }

        if (!placed) {
            const row = wordIndex;
            word.split("").forEach((letter, col) => {
                grid[row][col] = letter;
            });
            placements.push({
                word,
                coords: word.split("").map((_, col) => ({ row, col }))
            });
        }
    });

    foundWords = [];

    setGameContent(`
        <h2>🔎 Word Search</h2>
        <p>Encuentra las cinco palabras en inglés. Haz clic en las letras de cada palabra en el orden correcto.</p>
        <div style="
            display:grid;
            grid-template-columns:repeat(10,minmax(0,1fr));
            gap:3px;
            width:min(100%,500px);
            margin:22px auto;">
            ${grid.flatMap((row, r) =>
                row.map((letter, c) => `
                    <button type="button"
                        class="search-letter"
                        data-row="${r}"
                        data-col="${c}"
                        style="
                            min-width:0;
                            aspect-ratio:1;
                            margin:0;
                            padding:0;
                            border-radius:5px;
                            font-size:clamp(10px,2.3vw,16px);
                            background:#f1f5ff;">
                        ${letter}
                    </button>
                `)
            ).join("")}
        </div>
        <p><strong>Palabras por encontrar:</strong></p>
        <div id="search-word-list" style="
            display:flex;
            flex-wrap:wrap;
            justify-content:center;
            gap:9px;">
            ${words.map(word => `
                <span id="word-${word}" style="
                    padding:8px 13px;
                    border-radius:30px;
                    background:#fff1f2;
                    color:#c91f32;
                    font-size:13px;
                    font-weight:900;">
                    ${word}
                </span>
            `).join("")}
        </div>
        <p class="game-feedback" aria-live="polite">Palabras encontradas: 0 de ${words.length}</p>
    `);

    let selected = [];

    const buttons = [...gameContent.querySelectorAll(".search-letter")];

    function getSelectedWord() {
        return selected.map(cell => cell.textContent.trim()).join("");
    }

    function resetSelection() {
        selected.forEach(cell => {
            if (!cell.dataset.found) {
                cell.style.background = "#f1f5ff";
                cell.style.borderColor = "#eae7ef";
            }
        });
        selected = [];
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            if (button.dataset.found) return;

            if (selected.includes(button)) {
                resetSelection();
                showFeedback("Selección reiniciada.");
                return;
            }

            selected.push(button);
            button.style.background = "#ffe28b";
            button.style.borderColor = "#e3b52c";

            const current = getSelectedWord();
            const reverse = current.split("").reverse().join("");

            const match = placements.find(place =>
                !foundWords.includes(place.word) &&
                (place.word === current || place.word === reverse)
            );

            const possible = placements.some(place =>
                !foundWords.includes(place.word) &&
                (place.word.startsWith(current) ||
                 place.word.startsWith(reverse))
            );

            if (match) {
                foundWords.push(match.word);

                selected.forEach(cell => {
                    cell.dataset.found = "true";
                    cell.style.background = "#e6fff3";
                    cell.style.borderColor = "#35bd86";
                });

                document.querySelector(`#word-${match.word}`).style.background = "#e6fff3";
                document.querySelector(`#word-${match.word}`).style.color = "#167b52";

                addPoints();
                showFeedback(`¡Encontraste ${match.word}! +10 puntos 🎉`, "success");
                selected = [];

                if (foundWords.length === words.length) {
                    setTimeout(() => finishGame("¡Encontraste todas las palabras escondidas!"), 600);
                }
            } else if (!possible || selected.length >= 12) {
                showFeedback("Esa secuencia no forma una palabra de la lista.");
                resetSelection();
            }
        });
    });
}

/* ==========================================
   JUEGO 4: ENGLISH QUIZ
   ========================================== */

function startQuiz() {
    questionIndex = 0;
    showQuizQuestion();
}

function showQuizQuestion() {
    if (questionIndex >= quizQuestions.length) {
        finishGame("¡Terminaste el cuestionario de inglés!");
        return;
    }

    const question = quizQuestions[questionIndex];

    setGameContent(`
        <h2>📝 English Quiz</h2>
        <p>Pregunta ${questionIndex + 1} de ${quizQuestions.length}</p>
        <h3 style="font-size:20px;line-height:1.6;margin:25px 0;">
            ${escapeHTML(question.question)}
        </h3>
        <div id="quiz-options" style="
            display:grid;
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:10px;">
            ${shuffle(question.options).map(option => `
                <button type="button" data-answer="${escapeHTML(option)}"
                    style="margin:0;min-height:60px;">
                    ${escapeHTML(option)}
                </button>
            `).join("")}
        </div>
        <p class="game-feedback" aria-live="polite"></p>
    `);

    gameContent.querySelectorAll("[data-answer]").forEach(button => {
        button.addEventListener("click", () => {
            if (answered) return;
            answered = true;

            const correct = button.dataset.answer === question.answer;

            gameContent.querySelectorAll("[data-answer]").forEach(option => {
                option.disabled = true;

                if (option.dataset.answer === question.answer) {
                    option.classList.add("correct");
                }
            });

            if (correct) {
                addPoints();
                showFeedback(`¡Respuesta correcta! ${question.explanation} +10 puntos`, "success");
            } else {
                button.classList.add("incorrect");
                showFeedback(`La respuesta correcta era: ${question.answer}. ${question.explanation}`, "error");
            }

            setTimeout(() => {
                answered = false;
                questionIndex++;
                showQuizQuestion();
            }, 1800);
        });
    });
}

/* ==========================================
   JUEGO 5: MISSING LETTER
   ========================================== */

function startMissingLetterGame() {
    questionIndex = 0;
    showMissingQuestion();
}

function showMissingQuestion() {
    if (questionIndex >= missingQuestions.length) {
        finishGame("¡Completaste todas las palabras!");
        return;
    }

    const question = missingQuestions[questionIndex];
    const hiddenLetter = question.word[question.missing];

    const displayWord = question.word
        .split("")
        .map((letter, index) => index === question.missing ? "_" : letter)
        .join(" ");

    setGameContent(`
        <h2>🔠 Missing Letter</h2>
        <p>Palabra ${questionIndex + 1} de ${missingQuestions.length}</p>
        <p>${escapeHTML(question.clue)}</p>
        <div style="
            margin:25px 0;
            color:#3978f6;
            font-size:clamp(30px,7vw,48px);
            font-weight:900;
            letter-spacing:5px;
            text-align:center;">
            ${displayWord}
        </div>
        <p>¿Qué letra falta?</p>
        <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:8px;">
            ${shuffle(["A", "E", "I", "O", "U", hiddenLetter]).map(letter => `
                <button type="button" data-letter="${letter}"
                    style="min-width:48px;margin:0;font-size:18px;">
                    ${letter}
                </button>
            `).join("")}
        </div>
        <p class="game-feedback" aria-live="polite"></p>
    `);

    gameContent.querySelectorAll("[data-letter]").forEach(button => {
        button.addEventListener("click", () => {
            if (answered) return;
            answered = true;

            if (button.dataset.letter === hiddenLetter) {
                addPoints();
                showFeedback(`¡Muy bien! La palabra es ${question.word}. +10 puntos 🎉`, "success");
                button.classList.add("correct");
            } else {
                showFeedback(`La letra correcta era ${hiddenLetter}. La palabra es ${question.word}.`, "error");
                button.classList.add("incorrect");
            }

            gameContent.querySelectorAll("[data-letter]").forEach(item => {
                item.disabled = true;
            });

            setTimeout(() => {
                answered = false;
                questionIndex++;
                showMissingQuestion();
            }, 1600);
        });
    });
}

/* ==========================================
   JUEGO 6: GUESS THE WORD
   ========================================== */

function startGuessGame() {
    questionIndex = 0;
    showGuessQuestion();
}

function showGuessQuestion() {
    if (questionIndex >= guessQuestions.length) {
        finishGame("¡Adivinaste las palabras de las pistas!");
        return;
    }

    const question = guessQuestions[questionIndex];

    setGameContent(`
        <h2>💡 Guess the Word</h2>
        <p>Reto ${questionIndex + 1} de ${guessQuestions.length}</p>
        <div style="
            margin:25px 0;
            padding:22px;
            border-radius:20px;
            background:#fff5e8;
            text-align:center;">
            <div style="font-size:42px;margin-bottom:12px;">🕵️</div>
            <p style="color:#24243a;font-size:17px;font-weight:800;">
                ${escapeHTML(question.clue)}
            </p>
            <p>${escapeHTML(question.translation)}</p>
        </div>
        <form id="guess-form">
            <label for="guess-answer" style="
                display:block;
                margin-bottom:8px;
                font-weight:800;">
                Escribe la palabra en inglés:
            </label>
            <input id="guess-answer" name="answer"
                type="text"
                autocomplete="off"
                placeholder="Your answer..."
                required>
            <div>
                <button type="submit" class="game-primary-button">
                    Comprobar
                </button>
            </div>
        </form>
        <p class="game-feedback" aria-live="polite"></p>
    `);

    const form = document.querySelector("#guess-form");
    const input = document.querySelector("#guess-answer");

    input.focus();

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (answered) return;
        answered = true;

        const userAnswer = input.value.trim().toUpperCase();
        const correct = userAnswer === question.word;

        input.disabled = true;

        if (correct) {
            addPoints();
            showFeedback(`¡Excelente! La palabra era ${question.word}. +10 puntos 🎉`, "success");
        } else {
            showFeedback(`La palabra correcta era ${question.word}. ¡Sigue practicando!`, "error");
        }

        form.querySelector("button").disabled = true;

        setTimeout(() => {
            answered = false;
            questionIndex++;
            showGuessQuestion();
        }, 1800);
    });
}

/* ==========================================
   CONECTAR TARJETAS Y BOTÓN DE REGRESO
   ========================================== */

gameCards.forEach(card => {
    card.addEventListener("click", () => {
        openGame(card.dataset.game);
    });
});

backButton.addEventListener("click", returnToMenu);

updatePoints();
