/* =========================
   LEADER BOARD
========================= */
function showLeaderBoard() {

    showWorkArea();

    document.getElementById("itemList").innerHTML = `

    <li>
        <button onclick="loadResultList('quiz')">
            Quiz Results
        </button>
    </li>

    <li>
        <button onclick="loadResultList('lab')">
            Lab Results
        </button>
    </li>

    `;
}

function loadResultList(type) {

    fetch(`get_results.php?type=${type}`)
    .then(r => r.json())
    .then(data => {

        let html = `
            <h2>${type.toUpperCase()} RESULTS</h2>
            <ul style="list-style:none;padding:0;margin-top:20px;">
        `;

        data.forEach(item => {

            let file =
                item.file.replace(".json","");

            html += `
                <li style="margin-bottom:10px;">
                    <button
                        style="width:100%;padding:12px;background:#0066cc;color:white;border:none;border-radius:8px;
                            cursor:pointer;text-align:left;font-size:14px;
                        "
                        onclick="
                            loadLeaderboardResult(
                                '${type}',
                                '${file}'
                            )
                        ">
                        ${item.name}
                    </button>
                </li>
            `;
        });

        html += "</ul>";

        document.getElementById("contentArea").innerHTML =
            html;
    });
}

function loadLeaderboardResult(type, file) {

    fetch(`leaderboard.php?type=${type}&item=${file}`)
    .then(r => r.text())
    .then(html => {

        document.getElementById("contentArea").innerHTML = html;

        const runUpdate = (data) => {

            const quiz = data.find(q => q.file === file + ".json");

            if (quiz) {

                const quizNumber = quiz.file.match(/\d+/)[0];
                const topic = quiz.name.split(' - ')[1] || quiz.name;

                document.getElementById("pageTitle").innerText =
                    `Leaderboard - QUIZ ${quizNumber} - ${topic}`;
            }
        };

        // ✅ ONLY USE AppState (NO quizListCache anywhere)
        if (window.AppState.quizListCache) {
            runUpdate(window.AppState.quizListCache);
        } else {

            loadQuizList().then(data => {

                window.AppState.quizListCache = data;
                runUpdate(data);
            });
        }

    })
    .catch(err => console.error("leaderboard error:", err));
}

document.addEventListener("input", function (e) {

    if (e.target && e.target.id === "resultSearch") {

        const search = e.target.value.toLowerCase();

        const table = document.getElementById("leaderboardTable");

        if (!table) return;

        const rows = table.querySelectorAll("tbody tr");

        rows.forEach(row => {

            const nameCell = row.cells[1];

            if (!nameCell) return;

            const name = nameCell.innerText.toLowerCase();

            row.style.display =
                name.includes(search)
                ? ""
                : "none";
        });

        const thead = table.querySelector("thead");
        if (thead) {
            thead.style.display = "";
        }
    }
});

/* =========================
   GO BACK
========================= */

function goBack() {

    document.getElementById("contentArea").innerHTML = `
        <h2>Welcome to LINOOPTEK INNOVATION</h2>

        <p>Select QUIZ, LAB, TEST or PROJECT.</p>
    `;
}


/* =========================
   EXPORT
========================= */
window.showLeaderBoard = showLeaderBoard;
window.goBack = goBack;
