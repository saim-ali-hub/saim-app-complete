INCASE OF PERSONAL VM
if [ ! -f "$VALIDATION_SCRIPT" ]; then
    echo "Validation script missing"
    exit 1
fi

source "$VALIDATION_SCRIPT"

case "$lab" in

    lab1)
        validate_lab1_navigation
        ;;

    lab2)
        validate_lab2_fs_mgt
        ;;

    *)
        echo "Invalid lab"
        exit 1
        ;;
esac

IN CASE Vcenter:
#!/bin/bash
STUDENT_NAME="$1"
MACHINE_IPV4="$2"
LAB_NUMBER="$3"
if [ -z "$STUDENT_NAME" ] || [ -z "$MACHINE_IPV4" ]|| [ -z "$LAB_NUMBER" ]; then
echo "Usage: $0 <user> <ip> <lab>"
exit 1
fi
# SSH KEY CHECK
if [ ! -f "$HOME/.ssh/id_rsa.pub" ]; then
  ssh-keygen -t rsa -b 2048 -f "$HOME/.ssh/id_rsa" -N "" >/dev/null 2>&1
fi
# Install key to student's machine
if ! ssh-copy-id -i "$HOME/.ssh/id_rsa.pub" "$STUDENT_NAME@$MACHINE_IPV4" >/dev/null 2>&1; then
  echo "Error: Could not copy SSH key to $STUDENT_NAME@$MACHINE_IPV4. Is SSH running and password correct?"
  exit 1
fi
# CONNECTIVITY CHECK
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "$STUDENT_NAME@$MACHINE_IPV4" "echo ok" >/dev/null 2>&1; then
  echo "Error: Cannot reach your lab machine ($MACHINE_IPV4)."
  exit 1
fi
# Copy to a randomized /tmp path and delete it after execution.
REMOTE_LIB="/tmp/lab-validator.$RANDOM.$$"
scp -q /var/www/private_data/lab/validator-2026.sh "$STUDENT_NAME@$MACHINE_IPV4:$REMOTE_LIB"
# --- Run the validation on remote machine and then clean up the library ---
echo "Sit tight validation of your Linux_CLI_test-2025 is in process. Goodluck....."
ssh -o StrictHostKeyChecking=no "$STUDENT_NAME@$MACHINE_IPV4" bash -s -- "$STUDENT_NAME" "$LAB_NUMBER" "$REMOTE_LIB" << REMOTE_RUN 
#!/bin/bash
USER="$1"
LAB="$2"
REMOTE_LIB="$3"
export STUDENT_NAME="$USER"
export LAB_NUMBER="$LAB"
# --- Ensure required directories exist ---
mkdir -p /tmp/.syslog
chmod 755 /tmp/.syslog
# Load validation functions
source "$REMOTE_LIB"

# Run selected lab (do NOT exit early if one fails)
set +e
# Run selected lab
case "$LAB" in

    lab1)
        validate_lab1_navigation
        ;;

    lab2)
        validate_lab2_fs_mgt
        ;;

    *)
        echo "Invalid lab"
        exit 1
        ;;
esac

# Remove private validation lib
rm -f "$REMOTE_LIB" || true
REMOTE_RUN
# --- After remote validation run finishes ---
DATE=$(date +%F)
TMP_RESULT="/var/www/private_data/lab/${LAB_NUMBER}_$$.txt"
MASTER_RESULT="/var/www/private_data/lab/results/${LAB_NUMBER}_result.txt"
# Step 2: SCP error handling
if scp -q \
"$STUDENT_NAME@$MACHINE_IPV4:/tmp/.syslog/${LAB_NUMBER}_result.txt" \
"$TMP_RESULT"
then
chmod 666 "$TMP_RESULT"
else
    	       echo "Failed to retrieve result file"
    	       exit 1
fi	
   # Step 2: Append to Master Result (create if not exists)
     if [ ! -f "$MASTER_RESULT" ]; then
         head -n 4 "$TMP_RESULT" > "$MASTER_RESULT"
     fi
     tail -n +5 "$TMP_RESULT" >> "$MASTER_RESULT"
   # Step 3: Cleanup file on management machine
     rm -rf "$TMP_RESULT"
   # Step 4: Cleanup result file from Remote Machine
     ssh -o StrictHostKeyChecking=no "$STUDENT_NAME@$MACHINE_IPV4" "rm -rf /tmp/.syslog/${LAB_NUMBER}_result.txt" >/dev/null 2>&1
