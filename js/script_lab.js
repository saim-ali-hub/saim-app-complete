/* =========================
   LAB MODULE (FINAL VERSION)
   SAFE GLOBAL STATE VERSION
========================= */

/* =========================
   LOAD LAB SECTION
========================= */
function loadLabSection() {
    const itemList = document.getElementById("itemList");

    if (!itemList) {
        console.error("itemList not found ");
        return;
    }

    itemList.innerHTML = "<li>Loading labs...</li>";

    fetch("get_item.php?section=lab&file=list.json")
        .then(res => res.json())      
        .then(data => {

            if (!Array.isArray(data)) {
                itemList.innerHTML = "<li>Invalid lab data</li>";
                return;
            }

            itemList.innerHTML = "";

            data.forEach(item => {

                if (!item.file || !item.name) return;

                const li = document.createElement("li");
                const btn = document.createElement("button");
                btn.textContent = item.name;

                btn.onclick = () => {
                    openItem("lab", item.file);
                };

                li.appendChild(btn);
                itemList.appendChild(li);
            });

        })
        .catch(err => {
            console.error("Lab load error:", err);
            itemList.innerHTML = "<li style='color:red;'>Error loading labs</li>";
        });
}
/* =========================
   RENDER LAB QUESTIONS
========================= */
function renderLabQuestions() {

    const data = AppState.currentLabState?.data;
    const state = AppState.currentLabState?.status || {};

    if (!data) {
        console.error("Lab data missing");
        return;
    }

    let html = `
        <div class="question-box">

            <h2 style="color:#000080;">${data.title || "Lab"}</h2>
            <h2 style="color:#000080;">${data.description || ""}</h2>
            <h3 style="color:red;">${data.instructions || ""}</h3>
    `;

    if (Array.isArray(data.commands_covered)) {
        html += `
            <div style="margin-bottom:25px;color:blue;line-height:1.8;">
                <b style="color:#38bdf8;">Commands Covered:</b>
                ${data.commands_covered.map(escapeHtml).join(", ")}
            </div>
        `;
    }

    (data.questions || []).forEach((q, index) => {
        let status = state[index] || "";
        let borderColor =
            status === "done" ? "#22c55e" :
            status === "review" ? "#f59e0b" :
            "#38bdf8";
        let doneBg =
            status === "done" ? "#22c55e" : "#334155";
        let reviewBg =
            status === "review" ? "#f59e0b" : "#334155";

        html += `
                 <div style="padding:12px;margin-bottom:12px;border-radius:8px;background:#1e293b;color:white;border-left:4px solid ${borderColor}">

                <div style="padding:12px;margin-bottom:12px;background:#1e293b;color:white;">
                    Q${index + 1}. ${escapeHtml(q)}
                </div>
                <div>
                    <button onclick="setStatus(${index}, 'done')"
                        style="padding:6px 12px;border:none;border-radius:5px;
                            margin-right:10px;cursor:pointer;background:${doneBg};
                            color:white;">
                        Done
                     </button>
                    <button onclick="setStatus(${index}, 'review')"
                        style="padding:6px 12px;border:none;border-radius:5px;
                            cursor:pointer;background:${reviewBg};color:white;">
                        Review
                   </button>
                </div>
            </div>
        `;
    });
    html += `
<div style="margin-top:20px;">
    <label><b>Machine IP:</b></label><br>
    <input
        id="machine_ip"
        type="text"
        placeholder="192.168.1.100"
        style="width:250px;padding:8px;">
</div>
`;
    html += `
        <button onclick="validateLab()"
            style="margin-top:20px;padding:10px 18px;background:#16a34a;color:white;border:none;border-radius:6px;cursor:pointer;
            ">
            VALIDATE
        </button>
      </div>
    `;

    document.getElementById("contentArea").innerHTML = html;
}

/* =========================
   SET STATUS
========================= */

function setStatus(index, value) {
    if (!AppState.currentLabState) return;
    AppState.currentLabState.status[index] = value;
    renderLabQuestions();
}

/* =========================
   VALIDATE LAB
========================= */
function validateLab() {
    const payload = {
        lab: AppState.currentLabFile,
        status: AppState.currentLabState?.status || {}
    };

    fetch("api.php?action=lab", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
    lab: AppState.currentLabFile,
    ip: document.getElementById("machine_ip").value
})
    
})
    .then(res => res.text())
    .then(data => {
        document.getElementById("contentArea").innerHTML = `
          <div style="padding:20px;background:#0f172a;color:#ffffff;min-height:200px;border-radius:8px">

                <h2 style="color:#38bdf8;">LAB RESULT</h2>
                <pre style="white-space:pre-wrap;color:#ffffff;background:#111827;padding:10px;               
                        border-radius:6px;overflow:auto;">${data}</pre>
              <br>
              <button onclick="goBack()"
                style="padding:10px 15px;background:#16a34a;color:white;border:none;
                           border-radius:6px;cursor:pointer;">
               BACK
           </button>
        </div>
      `;
    })
}

/* =========================
HTML SAFE HELPER
========================= */
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/* =========================
   GO BACK
========================= */
function goBack() {

    document.getElementById("contentArea").innerHTML = `
        <h2>Welcome to LINOOPTEK INNOVATIONS</h2>
        <p>Select QUIZ, LAB, TEST or PROJECT.</p>
    `;
}

/* =========================
   EXPORT
========================= */

window.loadLabSection = loadLabSection;
window.renderLabQuestions = renderLabQuestions;
window.setStatus = setStatus;
window.validateLab = validateLab;
window.goBack = goBack;
