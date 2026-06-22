/* =========================
   LOAD SECTION
========================= */

function loadQuizSection() {
    fetch(`get_item.php?section=quiz&file=list.json`)
        .then(res => res.json())
        .then(data => {

            let itemList = document.getElementById("itemList");
            itemList.innerHTML = "";

            data.forEach(item => {
                let li = document.createElement("li");
                li.innerHTML = `
                    <button onclick="openItem('quiz','${item.file}')">
                        ${item.name}
                    </button>
                `;
                itemList.appendChild(li);
            });

        });
}

/* =========================
   RENDER QUESTION LIST
========================= */

function renderQuestions() {

    const data = AppState.currentQuizData;
    const file = AppState.currentQuizFile;

    if (!data || !Array.isArray(data.questions)) {
        console.error("Invalid quiz data:", data);
        return;
    }

    if (!file) {
        console.error("current Quiz File not set");
        return;
    }

    if (!AppState.quizStateMap || !AppState.quizStateMap[file]) {
        console.warn("Quiz state auto-fixed for file:", file);

        AppState.quizStateMap = AppState.quizStateMap || {};
        AppState.quizStateMap[file] = { answers: {}, done: {} };
    }

    const state = AppState.quizStateMap[file];

    let html = `
        <div class="question-box">

            <h2 style="color:#000080; margin-bottom:25px;">
                ${data.title}
            </h2>
    `;

    data.questions.forEach((q, index) => {

        let done = state.done[index];

        html += `
            <div onclick="openQuizQuestion(${index})"
                style="
                    margin-bottom:12px;
                    padding:12px;
                    border-radius:8px;
                    cursor:pointer;
                    color:${done ? '#1d4ed8' : '#f8fafc'};
                    border-left:4px solid ${done ? '#22c55e' : '#38bdf8'};
                    background:${done ? '#bbf7d0' : '#1e293b'};
                ">
                Q${index + 1}. ${q.question}
            </div>
        `;
    });

    let allDone = data.questions.every((_, i) => state.done[i]);

    html += `
        <button onclick="${allDone ? 'validateQuiz()' : 'goBack()'}"
            style="
                margin-top:15px;
                padding:10px 15px;
                background:${allDone ? '#16a34a' : '#334155'};
                color:white;
                border:none;
                border-radius:6px;
                cursor:pointer;
            ">
            ${allDone ? 'VALIDATE' : 'MOVE BACK'}
        </button>
    </div>
    `;
    document.getElementById("contentArea").innerHTML = html;
}

/* =========================
   OPEN QUIZ BOX
========================= */

function openQuizQuestion(index) {

    const data = window.AppState.currentQuizData;

    if (!data || !data.questions) return;

    let q = data.questions[index];

    let html = `
        <div style="
            position:fixed;
            top:0;left:0;
            width:100%;
            height:100%;
            background:rgba(0,0,0,0.85);
            display:flex;
            justify-content:center;
            align-items:center;
            z-index:9999;
        ">
        <div style="
            background:#0f172a;
            padding:25px;
            width:500px;
            border-radius:10px;
            color:white;
        ">
            <h3 style="margin-bottom:15px;">${q.question}</h3>
            <div id="optionsBox">
    `;

    q.options.forEach(opt => {
    const safeOpt = opt.replace(/'/g, "\\'");
    const safeAns = q.answer.replace(/'/g, "\\'");

    html += `
        <div
            onclick="selectAnswer(this, '${safeOpt}', '${safeAns}', ${index})"
            style="
                background:#334155;
                padding:10px;
                margin:8px 0;
                border-radius:6px;
                cursor:pointer;
            ">
            ${opt}
        </div>
    `;
});

    html += `
            </div>

            <br>

            <button onclick="closeBox()"
                style="
                    padding:8px 15px;
                    background:#22c55e;
                    border:none;
                    color:white;
                    border-radius:5px;
                    cursor:pointer;
                ">
                CLOSE
            </button>

        </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
}

/* =========================
   SELECT ANSWER
========================= */

function selectAnswer(element, selected, correctAnswer, index) {

    const state = AppState.quizStateMap[AppState.currentQuizFile];

    state.answers["q" + index] = selected;
    state.done[index] = true;

    let all = document.querySelectorAll("#optionsBox div");
    all.forEach(el => el.style.pointerEvents = "none");

    if (selected === correctAnswer) {
        element.style.background = "#16a34a";
    } else {
        element.style.background = "#dc2626";
        all.forEach(el => {
            if (el.innerText.trim() === correctAnswer) {
                el.style.background = "#16a34a";
            }
        });
    }

    setTimeout(() => {
        closeBox();
        renderQuestions();
    }, 800);
}
/* ============================
   VALIDATE QUIZ (BACKEND CALL)
============================ */

function validateQuiz() {

    let state = AppState.quizStateMap[AppState.currentQuizFile];

    if (!AppState.currentUser) {
        alert("User session not ready. Please refresh page.");
        return;
    }

    fetch("/api.php?action=quiz", {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            quiz_file: AppState.currentQuizFile,
            user: AppState.currentUser,
            answers: state.answers
        })
    })
    .then(res => res.text())
    .then(text => {
        let data;

        try {
            data = JSON.parse(text);
        } catch (e) {
            data = text; // HTML fallback
        }

        document.getElementById("contentArea").innerHTML = `
            <div style="
                padding:20px;
                background:#0f172a;
                color:#ffffff;
                min-height:300px;
            ">
                <h2>RESULT</h2>
                ${data}
                <br><br>
                <button onclick="goBack()"
                    style="padding:10px 15px;background:#16a34a;color:white;border:none;border-radius:6px;">
                    BACK
                </button>
            </div>
        `;
    })
    .catch(err => {
        console.error("Validation error:", err);
        alert("Validation failed. Check console or server logs.");
    });
}

/* =========================
   CLOSE BOX
========================= */

function closeBox() {
    let box = document.querySelector("body > div[style*='position:fixed']");
    if (box) box.remove();
}


/* =========================
   GO BACK
========================= */

function goBack() {
    document.getElementById("contentArea").innerHTML = `
        <h2>Welcome to LINOOPTEK Innovations Environment</h2>
        <p>Select QUIZ, LAB, TEST or PROJECT.</p>
    `;
}

/* =========================
   EXPORT
========================= */
window.selectAnswer = selectAnswer;
window.openQuizQuestion = openQuizQuestion;
window.closeBox = closeBox;
window.validateQuiz = validateQuiz;
window.renderQuestions = renderQuestions;
window.loadQuizSection = loadQuizSection;
window.goBack = goBack;
