<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

/* READ JSON INPUT */
$data = json_decode(file_get_contents("php://input"), true);

$answers = $data['answers'] ?? [];

/* BASE PATH */
$base = "/var/www/private_data/quiz/";

/* GET QUIZ FILE NAME */
$quizFileName = basename($data['quiz_file'] ?? '');

if (!$quizFileName) {
    die("Quiz file not provided");
}

/* Validate against approved quiz list */
$listFile = "/var/www/private_data/quiz/list.json";

if (!file_exists($listFile)) {
    die("Quiz list missing");
}

$listData = json_decode(file_get_contents($listFile), true);

$allowed = [];

foreach ($listData as $item) {
    $allowed[] = $item['file'];
}

if (!in_array($quizFileName, $allowed, true)) {
    die("Invalid quiz file");
}

/* FINAL QUIZ FILE PATH */
$quizFile = $base . $quizFileName;

/* CHECK FILE EXISTS */
if (!file_exists($quizFile)) {
    die("Quiz file not found: " . $quizFile);
}

/* LOAD QUIZ */
$quiz = json_decode(file_get_contents($quizFile), true);

if (!$quiz) {
    die("Invalid quiz JSON");
}

$titleName = strtoupper(str_replace(".json", "", $quizFileName));

$total = count($quiz['questions']);
$correct = 0;
$wrongDetails = [];

/* Evaluation */
foreach ($quiz['questions'] as $index => $q) {

    $qno = $index + 1;

    $user_answer = $answers["q$index"] ?? "Not Attempted";
    $correct_answer = $q['answer'];

    if ($user_answer === $correct_answer) {
        $correct++;
    } else {
        $wrongDetails[] = [
            "qno" => $qno,
            "question" => $q['question'],
            "your_answer" => $user_answer,
            "correct_answer" => $correct_answer
        ];
    }
}

$wrong = $total - $correct;
$percentage = ($total > 0) ? round(($correct / $total) * 100, 2) : 0;


/* =========================
   HTML OUTPUT (CLEAN UI)
========================= */

$html = "

<div style='
    background:#0f172a;
    padding:25px;
    border-radius:12px;
    max-width:900px;
    margin:auto;
    font-family:Arial,Helvetica,sans-serif;
    color:#f8fafc;
'>

<!-- TITLE -->
<h2 style='
    text-align:center;
    color:#38bdf8;
    margin-bottom:25px;
    letter-spacing:1px;
'>
    ===== RESULT SUMMARY - $titleName =====
</h2>

<!-- SUMMARY BOX -->
<div style='background:#111827;padding:25px;border-radius:10px;border:1px solid #334155;margin-bottom:25px;'>

        <div style='display:flex; margin-bottom:8px;'>
            <div style='width:220px;'>USERNAME</div>
    	<div>=</div>
    	<div style='margin-left:10px;'>$STUDENT_NAME</div>
        </div>
            <div style='width:220px;'>TOTAL QUESTIONS</div>
            <div>=</div>
            <div style='margin-left:10px;'>$total</div>
        </div>
        <div style='display:flex; margin-bottom:8px;'>
            <div style='width:220px;'>CORRECT ANSWERS</div>
            <div>=</div>
            <div style='margin-left:10px;'>$correct</div>
        </div>

        <div style='display:flex; margin-bottom:8px;'>
            <div style='width:220px;'>WRONG ANSWERS</div>
            <div>=</div>
            <div style='margin-left:10px;'>$wrong</div>
        </div>

        <div style='display:flex;'>
            <div style='width:220px;'>PERCENTAGE</div>
            <div>=</div>
            <div style='margin-left:10px;'>$percentage%</div>
        </div>

    </div>

</div>

<!-- WRONG SECTION TITLE -->
<h3 style='color:#f87171;margin-bottom:15px;border-left:4px solid #ef4444;padding-left:10px;'>
    WRONG ANSWER REVIEW
</h3>

";

/* WRONG ANSWERS */
if (count($wrongDetails) == 0) {

    $html .= "

    <div style='background:#14532d;padding:18px;border-radius:10px;color:white;font-size:18px;font-weight:bold;text-align:center;'>
        🎉 Excellent! All answers are correct.
    </div>

    ";

} else {

    foreach ($wrongDetails as $r) {

        $html .= "

        <div style='background:#111827;padding:16px;margin-bottom:12px;border-left:5px solid #ef4444;            border-radius:8px;'>

            <p style='color:#f8fafc;font-size:16px;margin-bottom:8px;'>
                <b style='color:#f87171;'>Question{$r['qno']}:</b>
                htmlspecialchars($r['question'], ENT_QUOTES, 'UTF-8')
            </p>

            <p style='color:#facc15;font-weight:bold;margin:4px 0;'>
                Your Answer: htmlspecialchars($r['your_answer'], ENT_QUOTES, 'UTF-8')
            </p>

            <p style='color:#22c55e;font-weight:bold;margin:4px 0;'>
                Correct Answer: htmlspecialchars($r['correct_answer'], ENT_QUOTES, 'UTF-8')
            </p>

        </div>

        ";
    }
}

/* BACK BUTTON */
$html .= "

<div style='text-align:center;margin-top:25px;'>
    <button onclick='location.reload()'
        style='background:#22c55e;color:white;border:none;padding:12px 22px;border-radius:8px;     cursor:pointer;font-size:16px;font-weight:bold;'>
        BACK
    </button>
</div>

</div>

";

/* =========================
   RESULT TABLE LOGGING
========================= */

/* dynamic result file */
$resultName = str_replace(".json", "", $quizFileName);
$RESULT_FILE = "/var/www/private_data/quiz/results/" . $resultName . "_result.txt";

/* Student name from Apache Authentication */
$STUDENT_NAME = $_SERVER['REMOTE_USER'] ?? 'unknown';

/* Date */
$DATE = date("Y-m-d H:i:s");

/* Create file with header if not exists */
if (!file_exists($RESULT_FILE)) {

    $header  = "Result - " . strtoupper($resultName) . "\n";
    $header .= "=================================================================\n";

    $header .= sprintf(
        "%-5d %-25s %-22s %-6s %-6s %-10s\n",
        "Sr.#",
        "Username",
        "Date",
        "Total_Qs",
        "Correct",
        "Percentage"
    );

    $header .= "-----------------------------------------------------------------\n";

    file_put_contents($RESULT_FILE, $header);
}

/* Count existing entries */
$lines = file($RESULT_FILE, FILE_IGNORE_NEW_LINES);
$SR_NO = 1;
if (count($lines) > 3) {
    $last = end($lines);
    preg_match('/^\s*(\d+)/', $last, $m);
    if (!empty($m[1])) {
        $SR_NO = (int)$m[1] + 1;
    }
}

/* Result row */
$row = sprintf(
    "%-5d %-25s %-22s %-6s %-6s %-10s\n",
    $SR_NO,
    $STUDENT_NAME,
    $DATE,
    $total,
    $correct,
    $percentage . "%"
);

/* Append result */
file_put_contents($RESULT_FILE, $row, FILE_APPEND | LOCK_EX);
echo $html;

?>
