validate_lab1_navigation() {
    echo "<h2 style='color:#white;'>Checking Lab1 - Linux Basic Commands & Navigation...</h2>"

    HOME_DIR="/home/$STUDENT_NAME"
    SERVER_INFO="$HOME_DIR/server_info"
    TOTAL_TASKS=17
    PASSED=0
    LAB_NAME="Lab1 - Linux Basic Commands & Navigation"
    DATE=$(date +%F)

    # Helpers
    pass() {
        echo "<div style='color:green;font-weight:bold;'>$1 - PASS</div>"
        ((PASSED++))
    }

    fail() {
        echo "<div style='color:red;font-weight:bold;'>$1 - FAIL</div>"
    }

    # Section 1: Server Info Appended to server_info
    [ -f "$SERVER_INFO" ] || touch "$SERVER_INFO"
    if grep -q "$HOME_DIR" "$SERVER_INFO"; then
       pass "Task 1: Present working directory appended"
    else
       fail "Task 1: pwd output missing"
    fi
    uname -r | if grep -q -Ff "$SERVER_INFO"; then
       pass "Task 2: Kernel version logged"
    else
       fail "Task 2: Kernel version missing"
    fi
    # Task 3: Validate ls -l output (look for a known filename like "office")
    if grep -q "$HOME_DIR" "$SERVER_INFO"; then
       pass "Task 3: ls -l output logged"
    else
       fail "Task 3: ls -l info missing"
    fi

    # Task 4: Validate ls -al output (look for hidden file like ".bashrc")
    if grep -q "\.bashrc" "$SERVER_INFO"; then
       pass "Task 4: ls -al output logged"
    else
       fail "Task 4: ls -al info missing"
    fi

    [ -d "$HOME_DIR/Linux" ] && pass "Task 5: Linux directory created" || fail "Task 5: Linux directory missing"
    if grep -q "$HOME_DIR/Linux" "$SERVER_INFO"; then
       pass "Task 6: Verified inside Linux directory"
    else
       fail "Task 6: Linux pwd output missing"
    fi

    [ -d "$HOME_DIR/Linux/Redhat" ] && [ -d "$HOME_DIR/Linux/oel" ] && [ -d "$HOME_DIR/Linux/debian" ] \
        && pass "Task 7: Subdirectories Redhat, oel, debian created" || fail "Task 7: One or more subdirectories missing"

    grep -q "$HOME_DIR" "$SERVER_INFO" && pass "Task 8: cd .. and pwd output captured" || fail "Task 8: Final pwd output missing"


    # Section 2: File Ops
    [ -f "$HOME_DIR/file1.txt" ] || [ -f "$HOME_DIR/documents/file1.txt" ] \
        && pass "Task 9a: file1.txt created or moved correctly" || fail "Task 9a: file1.txt missing"
    [ -f "$HOME_DIR/pic.jpg" ] || [ -f "$HOME_DIR/images/pic.jpg" ] \
        && pass "Task 9b: pic.jpg created or moved correctly" || fail "Task 9b: pic.jpg missing"
    [ -f "$HOME_DIR/clip.avi" ] || [ -f "$HOME_DIR/media/clip.avi" ] \
        && pass "Task 9c: clip.avi created or moved correctly" || fail "Task 9c: clip.avi missing"

    [ -d "$HOME_DIR/documents" ] && [ -f "$HOME_DIR/documents/file1.txt" ] \
        && pass "Task 10a: file1.txt moved to documents" || fail "Task 10a: file1.txt not in documents"
    [ -d "$HOME_DIR/images" ] && [ -f "$HOME_DIR/images/pic.jpg" ] \
        && pass "Task 10b: pic.jpg moved to images" || fail "Task 10b: pic.jpg not in images"
    [ -d "$HOME_DIR/media" ] && [ -f "$HOME_DIR/media/clip.avi" ] \
        && pass "Task 10c: clip.avi moved to media" || fail "Task 10c: clip.avi not in media"

    [ -d "$HOME_DIR/office/hobby/personal" ] && pass "Task 11: Nested directories created with mkdir -p" || fail "Task 11: Nested structure missing"

    [ -f "$HOME_DIR/office/file1.txt" ] && pass "Task 12: file1.txt copied to office" || fail "Task 12: file1.txt not copied"

    [ -f "$HOME_DIR/office/hobby/pic.jpg" ] && pass "Task 13: pic.jpg copied to hobby" || fail "Task 13: pic.jpg not copied"

    [ -f "$HOME_DIR/office/hobby/personal/office_tree" ] && grep -q "personal" "$HOME_DIR/office/hobby/personal/office_tree" \
        && pass "Task 14: tree output saved correctly" || fail "Task 14: tree output missing or incorrect"

    # Summary
    PERCENT=$((PASSED * 100 / TOTAL_TASKS))

        echo "<h2 style='font-weight:bold;color:white;'> ========== LAB RESULT SUMMARY ========== </h2>"
        echo "<div style='font-weight:bold;'>"

        echo "NAME = $STUDENT_NAME<br>"
        echo "TOTAL TASKS = $TOTAL_TASKS<br>"
        echo "PASSED = $PASSED<br>"
        echo "PERCENTAGE = $PERCENT%<br>"
        echo "</div>"
        echo "<h3>==================================</h3>"

    ## Result Table Logging
    RESULT_FILE="/var/www/private_data/lab/results/${lab}_result.txt"

    if [ ! -f "$RESULT_FILE" ]; then
    {
        echo "Result - $LAB_NAME"
        echo "========================================================================================"
        printf "%-5d %-25s %-22s %-6s %-6s %-10s\n" "Sr.#" "Name" "Date" "Total" "Passed" "Percentage"
        echo "----------------------------------------------------------------------------------------"
     } > "$RESULT_FILE"
     fi
     COUNT=$(grep -c "^" "$RESULT_FILE")
     SR_NO=$((COUNT - 3))
     printf "%-5d %-25s %-22s %-6s %-6s %-10s\n" \
     "$SR_NO" "$STUDENT_NAME" "$DATE" "$TOTAL_TASKS" "$PASSED" "$PERCENT%" >> "$RESULT_FILE"

}
#============================================================================

validate_lab2_fs_mgt() {
    echo "<h2 style='color:#white;'>Checking Lab2 - Linux Filesystem Management...</h2>"

    HOME_DIR="/home/$STUDENT_NAME"
    BASE="$HOME_DIR/vars"
    TOTAL_TASKS=15
    PASSED=0
    LAB_NAME="Lab2 - Linux Filesystem Management"
    DATE=$(date +%F)

    # Helpers
    pass() {
        echo "<div style='color:green;font-weight:bold;'>$1 - PASS</div>"
        ((PASSED++))
    }

    fail() {
        echo "<div style='color:red;font-weight:bold;'>$1 - FAIL</div>"
    }

    # Task 1
    if [ -d "$BASE/systems/logs" ] ; then
       pass "Task 1: Nested directory vars/systems/logs created"
    else
       fail "Task 1: Directory structure missing"
    fi
    # Task 2
    [ -f "$BASE/systems/dmesg" ] && pass "Task 2: Empty file dmesg created" || fail "Task 2: dmesg file missing"

    # Task 3
    grep -Fxq "I love Linux and am excited to join the DevOps course" "$BASE/systems/logs/file1.txt" 2>/dev/null \
        && pass "Task 3: file1.txt with correct content" || fail "Task 3: file1.txt missing or incorrect content"

    # Task 4
    [ -d "$BASE/os/configs" ] && pass "Task 4: Nested directory vars/os/configs created" || fail "Task 4: Directory structure missing"

    # Task 5
    cmp -s /etc/hosts "$BASE/os/configs/hosts" && pass "Task 5: /etc/hosts copied to vars/os/configs" || fail "Task 5: hosts not copied correctly"

    # Task 6
    cmp -s "$BASE/os/configs/hosts" "$BASE/hosts" && pass "Task 6: hosts copied from configs to vars" || fail "Task 6: hosts copy to vars failed"

    # Task 7
    cat "$BASE/hosts" &>/dev/null && pass "Task 7: cat used to display hosts in vars" || fail "Task 7: hosts not found in vars"

    # Task 8
    cmp -s "$BASE/hosts" "$BASE/os/configs/new_hosts" && pass "Task 8: hosts content redirected to new_hosts" || fail "Task 8: new_hosts content mismatch"

    # Task 9
    grep -Fxq "I love Linux and am excited to join the DevOps course" "$BASE/os/new_file1.txt" 2>/dev/null \
        && pass "Task 9: file1.txt copied and renamed to new_file1.txt" || fail "Task 9: new_file1.txt missing or incorrect"

    # Task 10
    [ -f "$BASE/systems/logs/sshd_config" ] && [ -f "$BASE/systems/logs/httpd.conf" ] \
        && pass "Task 10: sshd_config and httpd.conf created" || fail "Task 10: One or both config files missing"

    # Task 11
    grep -Fxq "I am enjoying DeveOps sessions and lab work" "$BASE/systems/new_file.txt" 2>/dev/null \
        && pass "Task 11: new_file.txt file has expected content" || fail "Task 11: new_file.txt content mismatch"
    # Task 12
    rmdir "$BASE/os/configs" 2>/dev/null && fail "Task 12: Directory deleted unexpectedly" || pass "Task 12: rmdir failed as expected due to contents"

    # Task 13
    [ -f "$BASE/systems/switch_output.txt" ] && tail -n 5 /etc/nsswitch.conf | cmp -s - <(tail -n 5 "$BASE/systems/switch_output.txt") \
        && pass "Task 13: tail output appended to switch_output.txt" || fail "Task 13: switch_output.txt content mismatch"

    # Task 14
    [ "$(head -n 5 /etc/resolv.conf)" = "$(cat "$BASE/systems/dns_output.txt" 2>/dev/null)" ] \
        && pass "Task 14: head output overwritten in dns_output.txt" || fail "Task 14: dns_output.txt content mismatch"

    # Task 15
    if [ -f "$BASE/systems/logs/output_file" ]; then
        grep -q "ASCII text" "$BASE/systems/logs/output_file" && grep -q "ELF" "$BASE/systems/logs/output_file" \
        && pass "Task 15: file command output stored correctly" || fail "Task 15: output_file content invalid"
    else
        fail "Task 15: output_file not found"
    fi

    # Summary
    PERCENT=$((PASSED * 100 / TOTAL_TASKS))

    echo "<h2 style='font-weight:bold;color:white;'> ========== LAB RESULT SUMMARY ========== </h2>"
        echo "<div style='font-weight:bold;'>"

        echo "NAME = $STUDENT_NAME<br>"
        echo "TOTAL TASKS = $TOTAL_TASKS<br>"
        echo "PASSED = $PASSED<br>"
        echo "PERCENTAGE = $PERCENT%<br>"
        echo "</div>"
        echo "<h3>==================================</h3>"

    ## Result Table Logging
    RESULT_FILE="/var/www/private_data/lab/results/${lab}_result.txt"

    if [ ! -f "$RESULT_FILE" ]; then
    {
        echo "Result - $LAB_NAME"
        echo "======================================================================================="
        printf "%-5d %-25s %-22s %-6s %-6s %-10s\n" "Sr.#" "Name" "Date" "Total" "Passed" "Percentage"
        echo "---------------------------------------------------------------------------------------"
     } > "$RESULT_FILE"
     fi
     COUNT=$(grep -c "^" "$RESULT_FILE")
     SR_NO=$((COUNT - 3))
     printf "%-5d %-25s %-22s %-6s %-6s %-10s\n" \
     "$SR_NO" "$STUDENT_NAME" "$DATE" "$TOTAL_TASKS" "$PASSED" "$PERCENT%" >> "$RESULT_FILE"

}
