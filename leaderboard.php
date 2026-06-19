<?php

$type = $_GET['type'] ?? 'quiz';
$item = $_GET['item'] ?? 'quiz1';

$item = basename($item);

/* --------------------------
   FILE PATH
---------------------------*/
if ($type === 'quiz') {
    $resultFile = "/var/www/private_data/quiz/results/{$item}_result.txt";
}
elseif ($type === 'lab') {
    $resultFile = "/var/www/private_data/lab/results/{$item}_result.txt";
}
else {
    die("Invalid type");
}

if (!file_exists($resultFile)) {
    die("<h2>Result file not found</h2>");
}

$users = [];

/* --------------------------
   READ FILE
---------------------------*/
$lines = file(
    $resultFile,
    FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES
);

foreach ($lines as $line) {

    $line = trim($line);

    /* Skip headers */
    if (
        $line === '' ||
        strpos($line, 'Result') === 0 ||
        strpos($line, 'Sr') === 0 ||
        strpos($line, '====') === 0 ||
        strpos($line, '----') === 0 ||
        strpos($line, '---') === 0
    ) {
        continue;
    }

    /* Parse row */
    if (preg_match(
        '/^\d+\s+(.*?)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\d+)\s+(\d+)\s+(\d+)%$/',
        $line,
        $m
    )) {

        $name       = trim($m[1]);
        $date       = $m[2];
        $total      = (int)$m[3];
        $passed     = (int)$m[4];
        $percentage = (int)$m[5];

        $key = strtolower(trim(preg_replace('/\s+/', ' ', $name)));

        /* --------------------------
           CLEAN FILTER (IMPORTANT)
        ---------------------------*/
        if (
            $key === '' ||
            $key === 'null' ||
            !preg_match('/[a-zA-Z]/', $key)
        ) {
            continue;
        }

        /* Keep best attempt only */
        if (
            !isset($users[$key]) ||
            $percentage > $users[$key]['percentage']
        ) {
            $users[$key] = [
                'name' => $name,
                'date' => $date,
                'total' => $total,
                'passed' => $passed,
                'percentage' => $percentage
            ];
        }
    }
}

$rows = array_values($users);

/* --------------------------
   SORTING
---------------------------*/
usort($rows, function ($a, $b) {

    if ($a['percentage'] == $b['percentage']) {

        if ($a['passed'] == $b['passed']) {
            return strcasecmp($a['name'], $b['name']);
        }

        return $b['passed'] <=> $a['passed'];
    }

    return $b['percentage'] <=> $a['percentage'];
});

?>

<!DOCTYPE html>
<html>

<head>

<title>Leaderboard</title>

<style>

body {
    font-family: Arial, sans-serif;
    background: #f4f7fc;
    margin: 0;
    padding: 20px;
}

h2 {
    text-align: center;
    color: #0066cc;
}

table {
    width: 95%;
    margin: auto;
    border-collapse: collapse;
    background: white;
    box-shadow: 0px 0px 15px rgba(0,0,0,0.1);
}

th {
    background: #0066cc;
    color: white;
    padding: 12px;
}

td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    text-align: center;
}

td:nth-child(2) {
    text-align: left;
    padding-left: 15px;
}

tr:nth-child(even) {
    background: #f8fbff;
}

tr:hover {
    background: #e6f0ff;
}

/* Search box */
.search-box {
    display:flex;
    justify-content:flex-end;
    width:95%;
    margin:0 auto 15px auto;
}

.search-box input {
    width:300px;
    padding:10px 15px;
    border:1px solid #ccc;
    border-radius:6px;
    font-size:14px;
}

.back-btn {
    margin-top: 20px;
    padding: 10px 20px;
    background: #999;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

</style>

</head>

<body>

<h2>
Leaderboard -
<?php echo strtoupper(htmlspecialchars($item)); ?>
</h2>

<!-- 🔍 SEARCH FILTER -->
<div class="search-box">
    <input
        type="text"
        id="resultSearch"
        placeholder="🔍 Search student..."
        onkeyup="filterResults()"
    >
</div>

<table id="leaderboardTable">

<thead>
<tr>
    <th>Sr</th>
    <th>Name</th>
    <th>Date & Time</th>
    <th>Total</th>
    <th>Passed</th>
    <th>Percentage</th>
</tr>
</thead>

<tbody>

<?php

$sr = 1;

if (count($rows) == 0) {
    echo "<tr><td colspan='6'>No valid results found</td></tr>";
}

foreach ($rows as $row) {

    echo "<tr>";
    echo "<td>{$sr}</td>";
    echo "<td>" . htmlspecialchars($row['name']) . "</td>";
    echo "<td>" . htmlspecialchars($row['date']) . "</td>";
    echo "<td>{$row['total']}</td>";
    echo "<td>{$row['passed']}</td>";
    echo "<td>{$row['percentage']}%</td>";
    echo "</tr>";

    $sr++;
}

?>

</tbody>
</table>

<script>
function filterResults() {

    const search =
        document.getElementById("resultSearch")
        .value
        .toLowerCase();

    const rows =
        document.querySelectorAll("#leaderboardTable tbody tr");

    rows.forEach(row => {

        const text = row.innerText.toLowerCase();

        row.style.display =
            text.includes(search) ? "" : "none";
    });
}
</script>

</body>
</html>
