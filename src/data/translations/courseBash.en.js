// English translation overlay for course-bash (Bash desde Cero). All 8
// modules fully translated (title, description, exercises, resources, quiz).
// See localizeCourse() in ../courseTranslations.js — any field left out here
// falls back to the Spanish base.
export default {
  title: 'Bash from Zero',
  description: 'Master the Linux/Mac terminal step by step, with real practice in every lesson. From basic commands to automated scripts.',
  aiInstructions: "You are Oliver, the platform's Bash tutor. Your role is to teach terminal commands clearly and practically. When the student types a command, explain what each part does (flags, arguments). If there's an error, help diagnose it. Use backtick code blocks to show commands. Encourage the student to practice in the course's interactive Terminal. You can use real-world analogies to explain concepts (e.g. 'ls is like looking at the files on your desktop').",
  modules: [
    {
      id: 1,
      title: 'What is the terminal and why use it?',
      description: "The terminal (also called console, shell or command line) is a text window where you give your computer direct instructions by typing commands. It's much more powerful than graphical menus: you can do in seconds tasks that would take minutes in a GUI. The most common shell on Linux and Mac is **Bash** (Bourne Again Shell). When you open a terminal, you see the **prompt** — usually ending in `$` — which tells you the system is ready to receive a command. The first command you should know is `pwd` (print working directory): it tells you which folder you're in right now.",
      exercises: [
        { id: 'bash-1-1', prompt: 'Open the course practice Terminal. Type `pwd` and press Enter. What directory does it show you? Paste the result here.' },
        { id: 'bash-1-2', prompt: "Type the command `echo 'Hello Bash!'` in the terminal. What does it print on screen? What is `echo` used for?" },
      ],
      resources: [
        { label: '🖥️ Practice Terminal — open here' },
        { label: 'Bash — Official Manual' },
      ],
      quiz: { question: 'What does the `pwd` command do?', options: ['Clears the screen contents', 'Shows the current working directory', 'Lists the system files', 'Creates a new folder'] },
    },
    {
      id: 2,
      title: 'Navigating the file system: ls and cd',
      description: "Linux's file system is shaped like a tree. Everything starts from the root `/`. Your home folder is at `/home/your-user/`. The two most-used commands are:\n\n**`ls`** (list): lists files and folders in the current directory.\n- `ls -l` shows details (permissions, size, date)\n- `ls -a` shows hidden files (starting with `.`)\n- `ls -la` combines both options\n\n**`cd`** (change directory): changes folder.\n- `cd documents` enters the 'documents' folder\n- `cd ..` goes up one level\n- `cd ~` goes straight to your home folder\n- `cd /` goes to the system root\n- `cd -` returns to the previous directory\n\nCombining `pwd`, `ls` and `cd` you can navigate the entire file system.",
      exercises: [
        { id: 'bash-2-1', prompt: 'In the terminal, run `ls -la` in your current directory. How many files and folders do you see? What do the `.` and `..` entries mean?' },
        { id: 'bash-2-2', prompt: 'Navigate to the `exercises` folder using `cd exercises`. Then run `ls`. What files does it contain? Then go back to the previous directory with `cd ..`.' },
      ],
      resources: [
        { label: '🖥️ Practice Terminal — open here' },
        { label: 'Linux commands cheat sheet' },
      ],
      quiz: { question: 'How do you go up one level in the directory hierarchy?', options: ['cd up', 'cd ..', 'cd /', 'back'] },
    },
    {
      id: 3,
      title: 'Creating and deleting files and folders',
      description: "To manage files from the terminal we use these commands:\n\n**Create:**\n- `mkdir my-folder` — creates a folder\n- `mkdir -p a/b/c` — creates nested folders at once\n- `touch file.txt` — creates an empty file (or updates its timestamp)\n\n**Delete (careful, there's no trash bin!):**\n- `rm file.txt` — deletes a file\n- `rm -r folder/` — deletes a folder and all its contents\n- `rm -rf folder/` — same but without asking for confirmation (very dangerous!)\n- `rmdir folder/` — deletes a folder only if it's empty\n\n**Copy and move:**\n- `cp source.txt destination.txt` — copies a file\n- `cp -r folder/ new-folder/` — copies an entire folder\n- `mv source.txt destination.txt` — moves or renames a file\n\n⚠️ **Golden rule**: never use `rm -rf` on directories you don't know. There's no undo in the terminal.",
      exercises: [
        { id: 'bash-3-1', prompt: 'Create a folder called `my-project` with `mkdir my-project`. Enter it with `cd my-project`. Create three files: `index.html`, `style.css` and `script.js` using `touch`. Verify with `ls`.' },
        { id: 'bash-3-2', prompt: "Copy the file `notes.txt` from your home to the `my-project` folder using `cp ~/notes.txt .` (the dot means 'here'). Then rename the copy to `my-notes.txt` with `mv notes.txt my-notes.txt`." },
      ],
      resources: [{ label: '🖥️ Practice Terminal — open here' }],
      quiz: { question: 'What does `mkdir -p a/b/c` do?', options: ["Creates only folder 'a'", "Moves folder 'a' to 'b/c'", 'Creates all the nested folders a/b/c even if they do not exist', 'Lists folders a, b and c'] },
    },
    {
      id: 4,
      title: 'Reading and writing files: cat, echo and redirection',
      description: "These commands let you read and write content in files:\n\n**Viewing content:**\n- `cat file.txt` — shows the entire content\n- `head -5 file.txt` — shows the first 5 lines\n- `tail -5 file.txt` — shows the last 5 lines\n- `less file.txt` — interactive pager (q to quit)\n\n**Writing with echo and redirection:**\n- `echo 'Hello'` — prints text to screen\n- `echo 'Hello' > output.txt` — writes to a file (**overwrites** if it exists)\n- `echo 'Another line' >> output.txt` — **appends** to the end of the file\n- `>` and `>>` are **output redirection** operators\n\n**Redirecting input:**\n- `cat < file.txt` — reads the file as input\n\n**Pipes `|`:**\n- `cat file.txt | head -3` — chains commands: one's output is the next one's input\n- They are one of Bash's most powerful features",
      exercises: [
        { id: 'bash-4-1', prompt: "Use `echo 'Line 1' > test.txt` to create a file. Then append two more lines with `>>`. Finally read the file with `cat test.txt`. How many lines does it have?" },
        { id: 'bash-4-2', prompt: 'Show the first 2 lines of `data.txt` using a pipe: `cat data.txt | head -2`. Then count how many lines the file has with `cat data.txt | wc -l`.' },
      ],
      resources: [
        { label: '🖥️ Practice Terminal — open here' },
        { label: 'Bash redirection — explainer' },
      ],
      quiz: { question: 'What is the difference between `>` and `>>`?', options: ['There is no difference', '`>` overwrites the file; `>>` appends at the end', '`>` appends at the end; `>>` overwrites', '`>` creates folders; `>>` creates files'] },
    },
    {
      id: 5,
      title: 'Searching with grep and find',
      description: "Two of the most useful commands for finding things:\n\n**`grep`** — searches for text inside files:\n- `grep 'apple' fruits.txt` — searches for the word 'apple'\n- `grep -i 'apple' fruits.txt` — case-insensitive search\n- `grep -r 'TODO' ./project/` — searches in every file of a folder\n- `grep -n 'error' app.log` — shows the line number\n- `grep -c 'ok' file.txt` — counts how many matches there are\n- `grep -v 'banana' fruits.txt` — shows lines that do NOT contain the word\n\n**`find`** — searches for files by name, type, date or size:\n- `find . -name '*.txt'` — all .txt files in the current directory\n- `find /home -name 'notes.txt'` — searches for the file across all of /home\n- `find . -type d` — directories only\n- `find . -type f -size +1M` — files larger than 1MB\n- `find . -newer file.txt` — files newer than file.txt\n\nCombined with pipes: `find . -name '*.log' | xargs grep 'error'`",
      exercises: [
        { id: 'bash-5-1', prompt: "In the terminal, use `grep 'apple' data.txt` to search how many times 'apple' appears. Then use `grep -c 'apple' data.txt` to have grep give you the count directly." },
        { id: 'bash-5-2', prompt: "Use `find . -name '*.txt'` to list every .txt file in your current directory and subfolders. How many does it find? What paths are they in?" },
      ],
      resources: [
        { label: '🖥️ Practice Terminal — open here' },
        { label: 'grep — man page' },
      ],
      quiz: { question: "What does `grep -v 'error' app.log` do?", options: ["Shows only lines containing 'error'", "Counts how many lines have 'error'", "Shows the lines that do NOT contain 'error'", "Deletes lines with 'error' from the file"] },
    },
    {
      id: 6,
      title: 'File permissions: chmod and chown',
      description: "Every file on Linux has an owner and permissions for three groups: **user** (u), **group** (g) and **others** (o). The permissions are: **r** (read=4), **w** (write=2), **x** (execute=1).\n\nWhen you run `ls -l` you see something like: `-rwxr-xr--`\n- First character: type (`-` file, `d` directory)\n- Next 3: owner permissions (rwx)\n- Next 3: group permissions (r-x)\n- Last 3: other permissions (r--)\n\n**`chmod`** — changes permissions:\n- `chmod 755 script.sh` — numeric mode: owner=7(rwx), group=5(r-x), others=5(r-x)\n- `chmod +x script.sh` — adds execute permission for everyone\n- `chmod u+w file.txt` — adds write permission only for the owner\n- `chmod go-w file.txt` — removes write permission from group and others\n\n**`chown`** — changes owner:\n- `chown user file.txt`\n- `chown user:group file.txt`\n\n**To run a script:**\n```bash\nchmod +x hello.sh\n./hello.sh\n```",
      exercises: [
        { id: 'bash-6-1', prompt: 'Make the script `hello.sh` executable with `chmod +x hello.sh`. Then check its permissions with `ls -la hello.sh`. What changed in the permissions?' },
        { id: 'bash-6-2', prompt: 'Run the script with `./hello.sh`. What does it print? Then open the file with `cat hello.sh` to understand what it does.' },
      ],
      resources: [
        { label: '🖥️ Practice Terminal — open here' },
        { label: 'Linux permissions — visual guide' },
      ],
      quiz: { question: 'What does the `755` permission mean in chmod?', options: ['Only the owner can read the file', 'Owner: everything; group and others: read and execute', 'No one can modify the file', 'The file is hidden'] },
    },
    {
      id: 7,
      title: 'Your first Bash script',
      description: 'A Bash script is a text file with a series of commands that run in order. It always starts with the **shebang**: `#!/bin/bash`\n\n**Variables:**\n```bash\nname=\'Oliver\'\necho "Hello, $name"\n```\n\n**Conditionals:**\n```bash\nif [ $age -ge 18 ]; then\n  echo \'Adult\'\nelse\n  echo \'Minor\'\nfi\n```\n\n**Loops:**\n```bash\nfor fruit in apple banana pear; do\n  echo "Fruit: $fruit"\ndone\n\nwhile [ $counter -lt 5 ]; do\n  echo $counter\n  counter=$((counter + 1))\ndone\n```\n\n**Script arguments:**\n```bash\n# ./my-script.sh Hello World\necho "First argument: $1"\necho "Second argument: $2"\necho "All args: $@"\n```\n\n**Functions:**\n```bash\nfunction greet() {\n  echo "Hello, $1!"\n}\ngreet \'Oliver\'\n```',
      exercises: [
        { id: 'bash-7-1', prompt: 'Use the terminal to view the content of `hello.sh` with `cat hello.sh`. Then use `echo` and redirection to create a new script `counter.sh` that prints numbers 1 through 5 in a for loop. Make it executable and test it.' },
        { id: 'bash-7-2', prompt: 'Read the script `project/main.sh` with `cat project/main.sh`. Modify its content so it also prints the current date using the `date` command. How would you run it?' },
      ],
      resources: [
        { label: '🖥️ Practice Terminal — open here' },
        { label: "Bash Scripting Tutorial — ryan's tutorials" },
      ],
      quiz: { question: 'What does the `#!/bin/bash` line at the top of a script do?', options: ['It is a decorative comment', 'It marks the file as executable', 'It tells the system which interpreter to use to run the script', "It imports Bash's libraries"] },
    },
    {
      id: 8,
      title: 'Useful commands and productivity tricks',
      description: "With these commands and shortcuts you'll be much more productive in the terminal:\n\n**History and autocomplete:**\n- `↑` / `↓` — navigate through previous commands\n- `Tab` — autocompletes file and command names\n- `history` — shows the command history\n- `Ctrl+R` — searches the history\n- `!!` — repeats the last command\n- `!grep` — repeats the last command that started with 'grep'\n\n**Keyboard shortcuts:**\n- `Ctrl+C` — cancels the current command\n- `Ctrl+Z` — pauses the process (resume with `fg`)\n- `Ctrl+D` — closes the terminal / EOF\n- `Ctrl+L` — clears the screen (same as `clear`)\n- `Ctrl+A` / `Ctrl+E` — go to the start / end of the line\n\n**Other useful commands:**\n- `wc -l file.txt` — counts lines\n- `sort file.txt` — sorts lines alphabetically\n- `uniq` — removes duplicate lines (use it after sort)\n- `cut -d',' -f1 data.csv` — extracts columns\n- `sed 's/old/new/g' file.txt` — find and replace\n- `date` — shows the date and time\n- `whoami` — shows your current user\n- `which command` — shows where a command is installed",
      exercises: [
        { id: 'bash-8-1', prompt: 'Try the most useful processing pipe: `cat data.txt | sort | uniq`. What does each part do? How many unique lines are there in data.txt?' },
        { id: 'bash-8-2', prompt: "Create a pipeline that: lists every .txt file, counts how many there are, and saves the result to a file. Example: `find . -name '*.txt' | wc -l > count.txt`. Verify with `cat count.txt`." },
      ],
      resources: [
        { label: '🖥️ Practice Terminal — open here' },
        { label: 'Explainshell — understand any command' },
        { label: 'tldr — simplified man pages' },
      ],
      quiz: { question: 'What does `sort file.txt | uniq` do?', options: ['Sorts and then removes duplicate lines', 'Searches for unique lines without sorting', 'Counts the lines in the file', 'Deletes the file and recreates it sorted'] },
    },
  ],
}
