function loadRecordingSection() {

    fetch("/get_item.php?section=recording&file=list.json")
        .then(res => res.json())
        .then(data => {

            let itemList = document.getElementById("itemList");
            itemList.innerHTML = "";

            data.forEach(recording => {

                let li = document.createElement("li");

                let btn = document.createElement("button");
                btn.textContent = recording.title;

                btn.addEventListener("click", function () {
                    openRecording(recording.url);
                });

                li.appendChild(btn);
                itemList.appendChild(li);
            });

        })
        .catch(err => {
            console.error("Recording load error:", err);
        });
}

function openRecording(url) {
    window.open(url, "_blank", "noopener,noreferrer");
}

window.loadRecordingSection = loadRecordingSection;
window.openRecording = openRecording;
