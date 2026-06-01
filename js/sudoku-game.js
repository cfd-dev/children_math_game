// 数独游戏模块
var sudokuState = {
    gridSize: 4,
    subRows: 2,
    subCols: 2,
    puzzle: [],      // 当前题目（0表示空）
    solution: [],    // 完整答案
    userGrid: [],    // 用户填写的
    fixed: [],       // 固定格子（题目自带）
    selectedRow: -1,
    selectedCol: -1,
    startTime: null,
    timerInterval: null,
    mistakes: 0,
    maxMistakes: 3,
    isComplete: false
};

// 按年级的数独配置
var sudokuGradeConfig = {
    'k-small':  { gridSize: 4, subRows: 2, subCols: 2, blanks: 6,  description: '4×4 数独（简单）' },
    'k-medium': { gridSize: 4, subRows: 2, subCols: 2, blanks: 8,  description: '4×4 数独' },
    'k-large':  { gridSize: 4, subRows: 2, subCols: 2, blanks: 10, description: '4×4 数独（进阶）' },
    'grade-1':  { gridSize: 6, subRows: 2, subCols: 3, blanks: 14, description: '6×6 数独（简单）' },
    'grade-2':  { gridSize: 6, subRows: 2, subCols: 3, blanks: 18, description: '6×6 数独' },
    'grade-3':  { gridSize: 9, subRows: 3, subCols: 3, blanks: 35, description: '9×9 数独（简单）' },
    'grade-4':  { gridSize: 9, subRows: 3, subCols: 3, blanks: 42, description: '9×9 数独' },
    'grade-5':  { gridSize: 9, subRows: 3, subCols: 3, blanks: 50, description: '9×9 数独（进阶）' },
    'grade-6':  { gridSize: 9, subRows: 3, subCols: 3, blanks: 55, description: '9×9 数独（困难）' }
};

// 获取当前数独配置
function getSudokuConfig() {
    return sudokuGradeConfig[currentGrade] || sudokuGradeConfig['grade-1'];
}

// 创建空网格
function createEmptyGrid(size) {
    var grid = [];
    for (var i = 0; i < size; i++) {
        grid[i] = [];
        for (var j = 0; j < size; j++) {
            grid[i][j] = 0;
        }
    }
    return grid;
}

// 深拷贝网格
function cloneGrid(grid) {
    return grid.map(function(row) { return row.slice(); });
}

// 检查数字在指定位置是否有效
function isValid(grid, row, col, num, size, subRows, subCols) {
    // 检查行
    for (var c = 0; c < size; c++) {
        if (grid[row][c] === num) return false;
    }
    // 检查列
    for (var r = 0; r < size; r++) {
        if (grid[r][col] === num) return false;
    }
    // 检查子网格
    var startRow = Math.floor(row / subRows) * subRows;
    var startCol = Math.floor(col / subCols) * subCols;
    for (var r = startRow; r < startRow + subRows; r++) {
        for (var c = startCol; c < startCol + subCols; c++) {
            if (grid[r][c] === num) return false;
        }
    }
    return true;
}

// 用回溯法生成完整数独
function generateCompleteGrid(size, subRows, subCols) {
    var grid = createEmptyGrid(size);

    function fill(pos) {
        if (pos === size * size) return true;
        var row = Math.floor(pos / size);
        var col = pos % size;

        // 随机顺序填入数字
        var nums = [];
        for (var i = 1; i <= size; i++) nums.push(i);
        // Fisher-Yates 洗牌
        for (var i = nums.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp;
        }

        for (var k = 0; k < nums.length; k++) {
            if (isValid(grid, row, col, nums[k], size, subRows, subCols)) {
                grid[row][col] = nums[k];
                if (fill(pos + 1)) return true;
                grid[row][col] = 0;
            }
        }
        return false;
    }

    fill(0);
    return grid;
}

// 从完整网格中移除数字生成题目
function createPuzzle(solution, blanks, size) {
    var puzzle = cloneGrid(solution);
    var positions = [];
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            positions.push([i, j]);
        }
    }
    // 洗牌
    for (var i = positions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = positions[i]; positions[i] = positions[j]; positions[j] = tmp;
    }
    // 移除指定数量的格子
    var removed = 0;
    for (var i = 0; i < positions.length && removed < blanks; i++) {
        var r = positions[i][0], c = positions[i][1];
        puzzle[r][c] = 0;
        removed++;
    }
    return puzzle;
}

// 检查用户填入的数字是否与行/列/子网格冲突
function hasConflict(grid, row, col, num, size, subRows, subCols) {
    if (num === 0) return false;
    // 行冲突
    for (var c = 0; c < size; c++) {
        if (c !== col && grid[row][c] === num) return true;
    }
    // 列冲突
    for (var r = 0; r < size; r++) {
        if (r !== row && grid[r][col] === num) return true;
    }
    // 子网格冲突
    var startRow = Math.floor(row / subRows) * subRows;
    var startCol = Math.floor(col / subCols) * subCols;
    for (var r = startRow; r < startRow + subRows; r++) {
        for (var c = startCol; c < startCol + subCols; c++) {
            if ((r !== row || c !== col) && grid[r][c] === num) return true;
        }
    }
    return false;
}

// 渲染数独网格
function renderSudokuGrid() {
    var config = getSudokuConfig();
    var size = config.gridSize;
    var container = document.getElementById('sudoku-grid');
    container.innerHTML = '';
    container.className = 'sudoku-grid sudoku-' + size;

    for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
            var cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            // 子网格边框
            if (c % config.subCols === 0 && c > 0) cell.classList.add('border-left');
            if (r % config.subRows === 0 && r > 0) cell.classList.add('border-top');
            // 右边框和下边框
            if (c === size - 1) cell.classList.add('border-right');
            if (r === size - 1) cell.classList.add('border-bottom');

            if (sudokuState.fixed[r][c]) {
                cell.textContent = sudokuState.puzzle[r][c];
                cell.classList.add('fixed');
            } else if (sudokuState.userGrid[r][c] !== 0) {
                cell.textContent = sudokuState.userGrid[r][c];
                cell.classList.add('user-input');
                // 检查冲突
                if (hasConflict(sudokuState.userGrid, r, c, sudokuState.userGrid[r][c], size, config.subRows, config.subCols)) {
                    cell.classList.add('conflict');
                }
            }

            // 选中状态
            if (r === sudokuState.selectedRow && c === sudokuState.selectedCol) {
                cell.classList.add('selected');
            }

            // 高亮同行同列同子网格
            if (sudokuState.selectedRow >= 0) {
                if (r === sudokuState.selectedRow || c === sudokuState.selectedCol) {
                    cell.classList.add('highlight');
                }
                var sr = Math.floor(sudokuState.selectedRow / config.subRows) * config.subRows;
                var sc = Math.floor(sudokuState.selectedCol / config.subCols) * config.subCols;
                if (r >= sr && r < sr + config.subRows && c >= sc && c < sc + config.subCols) {
                    cell.classList.add('highlight');
                }
                // 高亮相同数字
                var selectedVal = sudokuState.userGrid[sudokuState.selectedRow][sudokuState.selectedCol] || sudokuState.puzzle[sudokuState.selectedRow][sudokuState.selectedCol];
                if (selectedVal !== 0 && (sudokuState.userGrid[r][c] === selectedVal || (sudokuState.fixed[r][c] && sudokuState.puzzle[r][c] === selectedVal))) {
                    cell.classList.add('same-number');
                }
            }

            cell.addEventListener('click', (function(row, col) {
                return function() { selectSudokuCell(row, col); };
            })(r, c));

            container.appendChild(cell);
        }
    }
}

// 渲染数字选择器
function renderNumberPicker() {
    var config = getSudokuConfig();
    var size = config.gridSize;
    var container = document.getElementById('sudoku-number-picker');
    container.innerHTML = '';

    for (var n = 1; n <= size; n++) {
        var btn = document.createElement('button');
        btn.className = 'sudoku-num-btn';
        btn.textContent = n;
        btn.dataset.num = n;

        // 统计该数字已填入次数
        var count = 0;
        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                if (sudokuState.userGrid[r][c] === n || (sudokuState.fixed[r][c] && sudokuState.puzzle[r][c] === n)) {
                    count++;
                }
            }
        }
        if (count >= size) btn.classList.add('completed');

        btn.addEventListener('click', (function(num) {
            return function() { inputSudokuNumber(num); };
        })(n));

        container.appendChild(btn);
    }

    // 清除按钮
    var clearBtn = document.createElement('button');
    clearBtn.className = 'sudoku-num-btn sudoku-clear-btn';
    clearBtn.textContent = '清除';
    clearBtn.addEventListener('click', function() { inputSudokuNumber(0); });
    container.appendChild(clearBtn);
}

// 选择格子
function selectSudokuCell(row, col) {
    if (sudokuState.isComplete) return;
    if (sudokuState.fixed[row][col]) return;

    sudokuState.selectedRow = row;
    sudokuState.selectedCol = col;
    renderSudokuGrid();
}

// 输入数字
function inputSudokuNumber(num) {
    if (sudokuState.isComplete) return;
    if (sudokuState.selectedRow < 0 || sudokuState.selectedCol < 0) return;
    if (sudokuState.fixed[sudokuState.selectedRow][sudokuState.selectedCol]) return;

    var r = sudokuState.selectedRow;
    var c = sudokuState.selectedCol;
    var config = getSudokuConfig();

    sudokuState.userGrid[r][c] = num;

    // 检查是否错误（与答案不一致）
    if (num !== 0 && num !== sudokuState.solution[r][c]) {
        sudokuState.mistakes++;
        playWrongSound();
        speakWrong();
        document.getElementById('sudoku-mistakes').textContent = '错误：' + sudokuState.mistakes + '/' + sudokuState.maxMistakes;

        if (sudokuState.mistakes >= sudokuState.maxMistakes) {
            // 游戏结束
            sudokuState.isComplete = true;
            if (sudokuState.timerInterval) clearInterval(sudokuState.timerInterval);
            document.getElementById('sudoku-feedback').textContent = '错误次数已达上限，游戏结束！';
            document.getElementById('sudoku-feedback').className = 'feedback wrong';
            document.getElementById('sudoku-reveal-btn').style.display = 'inline-block';
            playWrongSound();
            renderSudokuGrid();
            renderNumberPicker();
            return;
        }
    } else if (num !== 0) {
        playCorrectSound();
        speakCorrect();
    }

    renderSudokuGrid();
    renderNumberPicker();

    // 检查是否完成
    if (num !== 0 && checkSudokuComplete()) {
        sudokuState.isComplete = true;
        if (sudokuState.timerInterval) clearInterval(sudokuState.timerInterval);
        finishSudokuGame();
    }
}

// 检查数独是否完成
function checkSudokuComplete() {
    var config = getSudokuConfig();
    var size = config.gridSize;
    for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
            if (sudokuState.userGrid[r][c] !== sudokuState.solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

// 开始数独游戏
function startSudokuGame() {
    var config = getSudokuConfig();
    sudokuState.gridSize = config.gridSize;
    sudokuState.subRows = config.subRows;
    sudokuState.subCols = config.subCols;
    sudokuState.selectedRow = -1;
    sudokuState.selectedCol = -1;
    sudokuState.mistakes = 0;
    sudokuState.isComplete = false;
    sudokuState.startTime = Date.now();

    // 生成题目
    var solution = generateCompleteGrid(config.gridSize, config.subRows, config.subCols);
    var puzzle = createPuzzle(solution, config.blanks, config.gridSize);

    sudokuState.solution = solution;
    sudokuState.puzzle = puzzle;
    sudokuState.userGrid = cloneGrid(puzzle);

    // 标记固定格子
    sudokuState.fixed = [];
    for (var r = 0; r < config.gridSize; r++) {
        sudokuState.fixed[r] = [];
        for (var c = 0; c < config.gridSize; c++) {
            sudokuState.fixed[r][c] = (puzzle[r][c] !== 0);
        }
    }

    // 切换显示
    document.getElementById('sudoku-setup').style.display = 'none';
    document.getElementById('sudoku-result').style.display = 'none';
    document.getElementById('sudoku-reward').style.display = 'none';
    document.getElementById('sudoku-quiz').style.display = 'block';
    document.getElementById('sudoku-feedback').textContent = '';
    document.getElementById('sudoku-feedback').className = 'feedback';
    document.getElementById('sudoku-reveal-btn').style.display = 'none';
    document.getElementById('sudoku-mistakes').textContent = '错误：0/' + sudokuState.maxMistakes;

    // 清除之前的定时器
    if (sudokuState.timerInterval) clearInterval(sudokuState.timerInterval);

    // 开始计时
    sudokuState.timerInterval = setInterval(updateSudokuTimer, 1000);

    playStartSound();

    // 渲染
    renderSudokuGrid();
    renderNumberPicker();
}

// 更新计时器
function updateSudokuTimer() {
    var elapsed = Math.floor((Date.now() - sudokuState.startTime) / 1000);
    var min = Math.floor(elapsed / 60);
    var sec = elapsed % 60;
    document.getElementById('sudoku-timer').textContent = '用时：' + min + '分' + (sec < 10 ? '0' : '') + sec + '秒';
}

// 揭晓答案
function revealSudokuAnswer() {
    var config = getSudokuConfig();
    var size = config.gridSize;
    for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
            sudokuState.userGrid[r][c] = sudokuState.solution[r][c];
        }
    }
    sudokuState.isComplete = true;
    if (sudokuState.timerInterval) clearInterval(sudokuState.timerInterval);
    renderSudokuGrid();
    renderNumberPicker();
    document.getElementById('sudoku-feedback').textContent = '已显示完整答案';
    document.getElementById('sudoku-feedback').className = 'feedback';
}

// 完成游戏
function finishSudokuGame() {
    if (sudokuState.timerInterval) clearInterval(sudokuState.timerInterval);

    var elapsed = Math.floor((Date.now() - sudokuState.startTime) / 1000);
    var config = getSudokuConfig();
    var score = Math.max(0, 100 - sudokuState.mistakes * 10);

    // 保存记录
    saveSudokuRecord(score, elapsed, config.gridSize, sudokuState.mistakes);

    // 显示奖励画面
    document.getElementById('sudoku-reward-score').textContent = score;
    document.getElementById('sudoku-reward-time').textContent = elapsed;
    document.getElementById('sudoku-reward-mistakes').textContent = sudokuState.mistakes;

    playMemoryLevelSound();
    speakReward(score);

    document.getElementById('sudoku-quiz').style.display = 'none';
    document.getElementById('sudoku-reward').style.display = 'block';
}

// 从奖励画面进入详细结果
function showSudokuRewardResult() {
    var elapsed = Math.floor((Date.now() - sudokuState.startTime) / 1000);
    var score = Math.max(0, 100 - sudokuState.mistakes * 10);

    document.getElementById('sudoku-result-score').textContent = score;
    document.getElementById('sudoku-result-time').textContent = elapsed + '秒';
    document.getElementById('sudoku-result-mistakes').textContent = sudokuState.mistakes;

    document.getElementById('sudoku-reward').style.display = 'none';
    document.getElementById('sudoku-result').style.display = 'block';
}
