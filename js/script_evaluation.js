/* =========================
   EVALUATION MODULE (READ ONLY)
========================= */
/* LOAD LIST */
function loadEvaluationSection() {

    const itemList = document.getElementById("itemList");

    if (!itemList) return;

    itemList.innerHTML = "<li>Loading evaluations...</li>";

    fetch("get_evaluations.php?type=evaluation")
        .then(res => res.json())
        .then(data => {

            if (!Array.isArray(data)) {
                itemList.innerHTML = "<li>Invalid data</li>";
                return;
            }

            itemList.innerHTML = "";

            data.forEach(item => {

                const li = document.createElement("li");

                const btn = document.createElement("button");
                btn.textContent = item.name;

                btn.onclick = () => {
                    openItem("evaluation", item.file);
                };

                li.appendChild(btn);
                itemList.appendChild(li);
            });
        })
        .catch(err => {
            console.error("Evaluation load error:", err);
            itemList.innerHTML = "<li style='color:red;'>Error loading evaluations</li>";
        });
}

/* RENDER QUESTIONS (READ ONLY) */
function renderEvaluationQuestions() {

    const data = AppState.currentEvaluationState?.data;

    if (!data) {
        console.error("Evaluation data missing");
        return;
    }

    let html = `
        <div class="question-box">
            <h2 style="color:#1a237e;">
                ${data.title || "Evaluation"}
            </h2>

            <h3 style="color:#555;">
                ${data.description || ""}
            </h3>

            <hr>
    `;

    (data.questions || []).forEach((q, index) => {

        html += `
            <div style="
                margin-bottom:12px;
                padding:12px;
                background:#1e293b;
                color:white;
                border-radius:8px;
            ">

                <b>Q${index + 1}.</b> ${q}

            </div>
        `;
    });

    html += `
        <button onclick="goBack()"
            style="
                margin-top:20px;
                padding:10px 16px;
                background:#16a34a;
                color:white;
                border:none;
                border-radius:6px;
                cursor:pointer;
            ">
            BACK
        </button>
        </div>
    `;

    document.getElementById("contentArea").innerHTML = html;
}


/* GO BACK */
function goBack() {

    document.getElementById("contentArea").innerHTML = `
        <h2>Welcome</h2>
        <p>Select a module from menu.</p>
    `;
}


/* EXPORT */
window.loadEvaluationSection = loadEvaluationSection;
window.renderEvaluationQuestions = renderEvaluationQuestions;
window.goBack = goBack;
