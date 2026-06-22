/* =========================
   GLOBAL STATE (ONLY ONCE)
========================= */
window.AppState = window.AppState || {
    currentData: null,
    quizState: { answers: {}, done: {} },
    labState: { status: {} },

    quizListCache: null
};

/* =========================
SHOW WORK AREA
========================= */
function showWorkArea() {

      const welcome =
            document.querySelector(".welcome-title");

      const workArea =
            document.querySelector(".work-area");

      if (welcome) {
           welcome.style.display = "none";
      }

      if (workArea) {
           workArea.style.display = "flex";
      }
}

/* =========================
   SECTION LOADER
========================= */

function loadSection(type) {

    if (type === "quiz") {

        if (typeof loadQuizSection === "function") {
            loadQuizSection();
        }

        return;
    }

    if (type === "lab") {

        if (
            typeof window.loadLabSection ===
            "function"
        ) {

            window.loadLabSection();

        } else {

            console.error(
                "loadLabSection not available."
            );
        }

        return;
    }

    if (type === "test") {

        if (
            typeof loadTestSection ===
            "function"
        ) {

            loadTestSection();
        }

        return;
    }

    if (type === "evaluation") {

        if (
            typeof loadEvaluationSection ===
            "function"
        ) {

            loadEvaluationSection();
        }

        return;
    }
    if (type === "recording") {

        if (
            typeof loadRecordingSection ===
            "function"
        ) {

            loadRecordingSection();
        }

         return;
    }
    if (type === "leaderboard") {

        if (
            typeof loadLeaderboardSection ===
            "function"
        ) {

            loadLeaderboardSection();
        }

         return;
    }

    console.error(
        "Unknown section:",
        type
    );
}

window.loadSection = loadSection;

/* =========================
   MASTER OPEN ITEM ROUTER
   (ONLY ONE IN ENTIRE PROJECT)
========================= */

function openItem(section, file) {

    fetch(
        `get_item.php?section=${section}&file=${file}`
    )
    .then(res => {

        if (!res.ok) {

            throw new Error(
                "HTTP Error: " + res.status
            );
        }

        return res.json();
    })
    .then(data => {

        console.log(
            "LOADED:",
            section,
            file
        );

        showWorkArea();


            if (section === "lab") {
                AppState.currentLabData = data;
            }

            if (section === "quiz") {
                AppState.currentQuizData = data;
            }

            if (section === "test") {
                AppState.currentTestData = data;
            }

            if (section === "evaluation") {
                AppState.currentProjectData = data;
            }

            if (section === "quiz") {

                AppState.currentQuizFile = file;

                // init quiz state safely
                AppState.quizStateMap = AppState.quizStateMap || {};

                if (!AppState.quizStateMap[file]) {
                   AppState.quizStateMap[file] = {
                        answers: {},
                        done: {}
                    };
                }

                setTimeout(() => renderQuestions(), 0);
            }

            if (section === "lab") {

                AppState.currentLabFile = file;

                AppState.labStateMap = AppState.labStateMap || {};

                if (!AppState.labStateMap[file]) {
                    AppState.labStateMap[file] = {
                        data: data,
                        status: {}
                    };
                } else {
                    AppState.labStateMap[file].data = data;
                }

                AppState.currentLabState = AppState.labStateMap[file];

                document.querySelector(".welcome-title").style.display = "none";
                document.querySelector(".work-area").style.display = "flex";

                setTimeout(() => renderLabQuestions(), 0);
             }


            if (section === "test") {

               AppState.currentTestFile = file;

                AppState.testState = AppState.testState || { status: {} };

                setTimeout(() => renderTestQuestions(), 0);
            }

            if (section === "evaluation") {

                AppState.currentEvaluationFile = file;

                AppState.evaluationStateMap = AppState.evaluationStateMap || {};

                AppState.currentEvaluationState = {
                    data: data,
                    status: {}
                };

               document.querySelector(".welcome-title").style.display = "none";
               document.querySelector(".work-area").style.display = "flex";

               setTimeout(() => renderEvaluationQuestions(), 0);
            }
        })
        .catch(err => {
            console.error("openItem error:", err);
        });
}

window.openItem = openItem;
window.loadSection = window.loadSection || function () {
    console.error("loadSection missing");
};

fetch("user.php")
.then(async r => {
    const text = await r.text();

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("user.php invalid response:", text);
        return { user: null };
    }
})
.then(data => {
    AppState.currentUser = data.user;

    const el = document.getElementById("currentUser");
    if (el) el.innerText = data.user || "Guest";
});
