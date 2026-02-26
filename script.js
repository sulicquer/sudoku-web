class Sudoku {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.userBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.fixed = Array(9).fill().map(() => Array(9).fill(false));
    }

    // Generate full valid board
    generateSolution() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solve(this.board);
        // Copy to solution
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                this.solution[r][c] = this.board[r][c];
            }
        }
    }

    solve(board) {
        let empty = this.findEmpty(board);
        if (!empty) return true;

        let [row, col] = empty;
        let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Shuffle numbers for random puzzle
        nums.sort(() => Math.random() - 0.5);

        for (let num of nums) {
            if (this.isValid(board, row, col, num)) {
                board[row][col] = num;
                if (this.solve(board)) return true;
                board[row][col] = 0;
            }
        }
        return false;
    }

    findEmpty(board) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) return [r, c];
            }
        }
        return null;
    }

    isValid(board, row, col, num) {
        // Row check
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }
        // Col check
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }
        // Box check
        let startRow = row - row % 3;
        let startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        return true;
    }

    createPuzzle(difficulty) {
        this.generateSolution();
        let gaps;
        if (difficulty === 'easy') gaps = 30; // 51 given
        else if (difficulty === 'medium') gaps = 45; // 36 given
        else gaps = 55; // 26 given

        // Copy solution to userBoard
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                this.userBoard[r][c] = this.solution[r][c];
                this.fixed[r][c] = true;
            }
        }

        // Remove numbers
        let count = gaps;
        while (count > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if (this.userBoard[row][col] !== 0) {
                this.userBoard[row][col] = 0;
                this.fixed[row][col] = false;
                count--;
            }
        }
    }

    checkWin() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.userBoard[r][c] !== this.solution[r][c]) {
                    return false;
                }
            }
        }
        return true;
    }
}

// App Logic
document.addEventListener('DOMContentLoaded', () => {
    const boardEl = document.getElementById('sudoku-board');
    const mistakeCountEl = document.getElementById('mistake-count');
    const timerEl = document.getElementById('timer');
    const diffBtns = document.querySelectorAll('.diff-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const btnModalClose = document.getElementById('btn-modal-close');
    const btnNewGame = document.getElementById('btn-new-game');
    const numBtns = document.querySelectorAll('.num-btn');
    const btnErase = document.getElementById('btn-erase');
    const btnUndo = document.getElementById('btn-undo');
    const btnHint = document.getElementById('btn-hint');

    let game = new Sudoku();
    let selectedCell = null;
    let difficulty = 'easy';
    let mistakes = 0;
    const MAX_MISTAKES = 3;
    let timer = 0;
    let timerInterval = null;
    let history = []; // for undo

    function initGame() {
        game.createPuzzle(difficulty);
        mistakes = 0;
        mistakeCountEl.textContent = mistakes;
        selectedCell = null;
        history = [];
        resetTimer();
        renderBoard();
        startTimer();
    }

    function renderBoard() {
        boardEl.innerHTML = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                const val = game.userBoard[r][c];
                if (val !== 0) {
                    cell.textContent = val;
                }

                if (game.fixed[r][c]) {
                    cell.classList.add('fixed');
                } else if (val !== 0) {
                    cell.classList.add('user-input');
                    // Check if initial load correct
                    if (val !== game.solution[r][c]) {
                        cell.classList.add('error');
                    }
                }

                cell.addEventListener('click', () => selectCell(r, c));
                boardEl.appendChild(cell);
            }
        }
        updateHighlights();
    }

    function selectCell(r, c) {
        selectedCell = { r, c };
        updateHighlights();
    }

    function updateHighlights() {
        // Clear old highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'highlight', 'same-num');
        });

        if (!selectedCell) return;

        const { r: sr, c: sc } = selectedCell;
        const selectedVal = game.userBoard[sr][sc];

        document.querySelectorAll('.cell').forEach(cell => {
            const r = parseInt(cell.dataset.r);
            const c = parseInt(cell.dataset.c);
            const val = game.userBoard[r][c];

            // Highlight row, col, box
            if (r === sr || c === sc || (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3))) {
                cell.classList.add('highlight');
            }

            // Highlight same numbers
            if (selectedVal !== 0 && val === selectedVal) {
                cell.classList.add('same-num');
            }

            // Highlight exactly selected cell
            if (r === sr && c === sc) {
                cell.classList.add('selected');
            }
        });
    }

    function inputNumber(num) {
        if (!selectedCell) return;
        const { r, c } = selectedCell;
        
        if (game.fixed[r][c]) return;

        const currentVal = game.userBoard[r][c];
        if (currentVal === num) return;

        // save to history
        history.push({ r, c, prev: currentVal });

        game.userBoard[r][c] = num;
        const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        cellEl.textContent = num;
        cellEl.classList.add('user-input');
        
        // Remove old error class
        cellEl.classList.remove('error');
        // trigger reflow for animation reset
        void cellEl.offsetWidth;

        if (num !== game.solution[r][c]) {
            cellEl.classList.add('error');
            mistakes++;
            mistakeCountEl.textContent = mistakes;
            if (mistakes >= MAX_MISTAKES) {
                gameOver(false);
            }
        } else {
            // Check win
            if (game.checkWin()) {
                gameOver(true);
            }
        }

        updateHighlights();
    }

    function eraseCell() {
        if (!selectedCell) return;
        const { r, c } = selectedCell;
        if (game.fixed[r][c]) return;
        
        const currentVal = game.userBoard[r][c];
        if (currentVal === 0) return;

        history.push({ r, c, prev: currentVal });
        game.userBoard[r][c] = 0;
        
        const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        cellEl.textContent = '';
        cellEl.classList.remove('user-input', 'error');
        
        updateHighlights();
    }

    function undo() {
        if (history.length === 0) return;
        const action = history.pop();
        game.userBoard[action.r][action.c] = action.prev;
        
        const cellEl = document.querySelector(`.cell[data-r="${action.r}"][data-c="${action.c}"]`);
        if (action.prev === 0) {
            cellEl.textContent = '';
            cellEl.classList.remove('user-input', 'error');
        } else {
            cellEl.textContent = action.prev;
            cellEl.classList.add('user-input');
            if (action.prev !== game.solution[action.r][action.c]) {
                cellEl.classList.add('error');
            } else {
                cellEl.classList.remove('error');
            }
        }
        updateHighlights();
    }

    function provideHint() {
        if (!selectedCell) return;
        const { r, c } = selectedCell;
        if (game.fixed[r][c] || game.userBoard[r][c] === game.solution[r][c]) return;
        inputNumber(game.solution[r][c]);
    }

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer++;
            const m = Math.floor(timer / 60).toString().padStart(2, '0');
            const s = (timer % 60).toString().padStart(2, '0');
            timerEl.textContent = `${m}:${s}`;
        }, 1000);
    }

    function resetTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timer = 0;
        timerEl.textContent = "00:00";
    }

    function gameOver(isWin) {
        clearInterval(timerInterval);
        if (isWin) {
            modalTitle.textContent = "恭喜过关！";
            modalTitle.style.color = "var(--success-color)";
            modalMessage.textContent = `你用时 ${timerEl.textContent} 完成了${diffBtns[difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2].textContent}难度的数独。`;
        } else {
            modalTitle.textContent = "游戏结束";
            modalTitle.style.color = "var(--error-color)";
            modalMessage.textContent = "你已经达到了最大错误次数限制 (3次)。";
        }
        modalOverlay.classList.remove('hidden');
    }

    // Event Listeners
    diffBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            diffBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            difficulty = e.target.dataset.level;
            initGame();
        });
    });

    numBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            inputNumber(parseInt(e.target.dataset.val));
        });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '9') {
            inputNumber(parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            eraseCell();
        } else if (selectedCell) {
            let { r, c } = selectedCell;
            if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
            if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
            if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
            if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
            selectCell(r, c);
        }
    });

    btnErase.addEventListener('click', eraseCell);
    btnUndo.addEventListener('click', undo);
    btnHint.addEventListener('click', provideHint);
    
    btnNewGame.addEventListener('click', initGame);
    btnModalClose.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        initGame();
    });

    // Start initial game
    initGame();
});
