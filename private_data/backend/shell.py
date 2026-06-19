import os
import pty
import pwd
import fcntl
import termios
import struct

sessions = {}

def start_shell(username):

    # -------------------------
    # Get system user
    # -------------------------
    try:
        user = pwd.getpwnam(username)
    except KeyError:
        raise Exception("User does not exist")

    uid = user.pw_uid
    gid = user.pw_gid
    home = user.pw_dir
    shell = user.pw_shell or "/bin/bash"

    # -------------------------
    # Create PTY
    # -------------------------
    master, slave = pty.openpty()

    # non-blocking master
    flags = fcntl.fcntl(master, fcntl.F_GETFL)
    fcntl.fcntl(master, fcntl.F_SETFL, flags | os.O_NONBLOCK)

    pid = os.fork()

    if pid == 0:
        # -------------------------
        # CHILD PROCESS
        # -------------------------
        os.setsid()

        # make slave controlling terminal
        fcntl.ioctl(slave, termios.TIOCSCTTY, 0)

        # default terminal size
        winsize = struct.pack("HHHH", 40, 140, 0, 0)

        fcntl.ioctl(
            slave,
            termios.TIOCSWINSZ,
            winsize
        )

        # attach slave as controlling terminal
        os.dup2(slave, 0)
        os.dup2(slave, 1)
        os.dup2(slave, 2)

        if slave > 2:
            os.close(slave)

        # switch user BEFORE exec
        os.setgid(gid)
        os.setuid(uid)

        # environment
        os.environ["HOME"] = home
        os.environ["USER"] = username
        os.environ["LOGNAME"] = username
        os.environ["SHELL"] = shell
        os.environ["TERM"] = "xterm-256color"
        os.environ["COLORTERM"] = "truecolor"

        os.chdir(home)

        # IMPORTANT: use login shell
        os.execv(shell, [shell, "-l"])

    else:
        # -------------------------
        # PARENT PROCESS
        # -------------------------
        sessions[username] = (master, pid)
        return master, pid
