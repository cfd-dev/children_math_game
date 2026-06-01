// 迷宫游戏模块
var mazeState = {
    gridSize: 5,
    maze: [],
    playerRow: 0,
    playerCol: 0,
    stepCount: 0,
    optimalSteps: 0,
    startTime: null,
    timerInterval: null,
    isComplete: false,
    questionCount: 3,
    currentQuestion: 0,
    score: 0,
    keyHandler: null
};

// 年级难度配置
var mazeGradeConfig = {
    'k-small':  { size: 5,  mazeCount: 3, description: '5×5 迷宫（简单）' },
    'k-medium': { size: 7,  mazeCount: 3, description: '7×7 迷宫' },
    'k-large':  { size: 9,  mazeCount: 3, description: '9×9 迷宫' },
    'grade-1':  { size: 9,  mazeCount: 5, description: '9×9 迷宫' },
    'grade-2':  { size: 11, mazeCount: 5, description: '11×11 迷宫' },
    'grade-3':  { size: 13, mazeCount: 5, description: '13×13 迷宫' },
    'grade-4':  { size: 13, mazeCount: 5, description: '13×13 迷宫（进阶）' },
    'grade-5':  { size: 15, mazeCount: 5, description: '15×15 迷宫' },
    'grade-6':  { size: 15, mazeCount: 5, description: '15×15 迷宫（困难）' }
};

function getMazeConfig() {
    return mazeGradeConfig[currentGrade] || mazeGradeConfig['grade-1'];
}

// ========== 迷宫生成（递归回溯 / DFS）==========
function generateMaze(size) {
    var grid = [];
    for (var r = 0; r < size; r++) {
        grid[r] = [];
        for (var c = 0; c < size; c++) {
            grid[r][c] = { top: true, right: true, bottom: true, left: true, visited: false };
        }
    }

    var directions = [
        [-1, 0, 'top', 'bottom'],
        [1, 0, 'bottom', 'top'],
        [0, -1, 'left', 'right'],
        [0, 1, 'right', 'left']
    ];

    var stack = [[0, 0]];
    grid[0][0].visited = true;

    while (stack.length > 0) {
        var cur = stack[stack.length - 1];
        var r = cur[0], c = cur[1];

        var neighbors = [];
        for (var d = 0; d < directions.length; d++) {
            var nr = r + directions[d][0];
            var nc = c + directions[d][1];
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && !grid[nr][nc].visited) {
                neighbors.push([nr, nc, directions[d][2], directions[d][3]]);
            }
        }

        if (neighbors.length > 0) {
            var chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
            var nr = chosen[0], nc = chosen[1];
            grid[r][c][chosen[2]] = false;
            grid[nr][nc][chosen[3]] = false;
            grid[nr][nc].visited = true;
            stack.push([nr, nc]);
        } else {
            stack.pop();
        }
    }

    // 开放入口和出口
    grid[0][0].top = false;
    grid[size - 1][size - 1].bottom = false;

    return grid;
}

// ========== BFS 最短路径 ==========
function findOptimalPath(grid, size) {
    var queue = [[0, 0, 0]];
    var visited = {};
    visited['0,0'] = true;

    var moves = [
        [-1, 0, 'top'],
        [1, 0, 'bottom'],
        [0, -1, 'left'],
        [0, 1, 'right']
    ];

    while (queue.length > 0) {
        var cur = queue.shift();
        var r = cur[0], c = cur[1], steps = cur[2];

        if (r === size - 1 && c === size - 1) return steps;

        for (var m = 0; m < moves.length; m++) {
            var nr = r + moves[m][0];
            var nc = c + moves[m][1];
            var wall = moves[m][2];
            if (nr >= 0 && nr < size && nc >= 0 && nc < size &&
                !grid[r][c][wall] && !visited[nr + ',' + nc]) {
                visited[nr + ',' + nc] = true;
                queue.push([nr, nc, steps + 1]);
            }
        }
    }
    return -1;
}

// ========== 渲染迷宫 ==========
function renderMaze() {
    var container = document.getElementById('maze-grid');
    container.innerHTML = '';
    var size = mazeState.gridSize;
    container.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';

    for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
            var cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            var wall = mazeState.maze[r][c];
            if (wall.top) cell.style.borderTop = '2px solid #333';
            if (wall.right) cell.style.borderRight = '2px solid #333';
            if (wall.bottom) cell.style.borderBottom = '2px solid #333';
            if (wall.left) cell.style.borderLeft = '2px solid #333';

            if (r === 0 && c === 0) cell.classList.add('start');
            if (r === size - 1 && c === size - 1) cell.classList.add('end');
            if (r === mazeState.playerRow && c === mazeState.playerCol) cell.classList.add('player');

            cell.addEventListener('click', (function(row, col) {
                return function() { handleMazeCellClick(row, col); };
            })(r, c));

            container.appendChild(cell);
        }
    }
}

function updateMazeCellHighlight() {
    var cells = document.querySelectorAll('.maze-cell');
    var size = mazeState.gridSize;
    for (var i = 0; i < cells.length; i++) {
        cells[i].classList.remove('player');
    }
    var idx = mazeState.playerRow * size + mazeState.playerCol;
    if (cells[idx]) cells[idx].classList.add('player');
}

// ========== 玩家移动 ==========
function handleMazeCellClick(row, col) {
    if (mazeState.isComplete) return;
    var dr = row - mazeState.playerRow;
    var dc = col - mazeState.playerCol;
    if (Math.abs(dr) + Math.abs(dc) !== 1) return;

    var direction;
    if (dr === -1) direction = 'up';
    else if (dr === 1) direction = 'down';
    else if (dc === -1) direction = 'left';
    else if (dc === 1) direction = 'right';
    handleMazeMove(direction);
}

function handleMazeMove(direction) {
    if (mazeState.isComplete) return;

    var r = mazeState.playerRow;
    var c = mazeState.playerCol;
    var wall = mazeState.maze[r][c];
    var nr = r, nc = c;

    if (direction === 'up' && !wall.top) nr--;
    else if (direction === 'down' && !wall.bottom) nr++;
    else if (direction === 'left' && !wall.left) nc--;
    else if (direction === 'right' && !wall.right) nc++;
    else return; // 有墙，不能移动

    mazeState.playerRow = nr;
    mazeState.playerCol = nc;
    mazeState.stepCount++;
    updateMazeCellHighlight();
    playClickSound();

    // 检查是否到达终点
    if (nr === mazeState.gridSize - 1 && nc === mazeState.gridSize - 1) {
        mazeState.isComplete = true;
        completeMaze();
    }
}

function completeMaze() {
    var elapsed = Math.floor((Date.now() - mazeState.startTime) / 1000);
    var baseScore = Math.max(10, 100 - elapsed);
    if (mazeState.stepCount <= mazeState.optimalSteps * 1.5) baseScore += 20;
    mazeState.score += baseScore;

    var feedback = document.getElementById('maze-feedback');
    feedback.textContent = '✓ 到达终点！用时' + elapsed + '秒，步数' + mazeState.stepCount + '，得分+' + baseScore;
    feedback.className = 'feedback correct';
    playCorrectSound();
    speakCorrect();

    setTimeout(function() {
        mazeState.currentQuestion++;
        if (mazeState.currentQuestion >= mazeState.questionCount) {
            finishMazeGame();
        } else {
            showNextMazeQuestion();
        }
    }, 2000);
}

// ========== 键盘支持 ==========
function mazeKeyHandler(e) {
    var keyMap = {
        'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
        'w': 'up', 's': 'down', 'a': 'left', 'd': 'right',
        'W': 'up', 'S': 'down', 'A': 'left', 'D': 'right'
    };
    var dir = keyMap[e.key];
    if (dir) {
        e.preventDefault();
        handleMazeMove(dir);
    }
}

// ========== 游戏生命周期 ==========
function startMazeGame() {
    var config = getMazeConfig();
    mazeState.questionCount = config.mazeCount;
    mazeState.gridSize = config.size;
    mazeState.currentQuestion = 0;
    mazeState.score = 0;
    mazeState.isComplete = false;
    mazeState.startTime = Date.now();

    if (mazeState.timerInterval) clearInterval(mazeState.timerInterval);
    mazeState.timerInterval = setInterval(updateMazeTimer, 1000);

    // 注册键盘事件
    if (mazeState.keyHandler) document.removeEventListener('keydown', mazeState.keyHandler);
    mazeState.keyHandler = mazeKeyHandler;
    document.addEventListener('keydown', mazeState.keyHandler);

    playStartSound();
    showNextMazeQuestion();

    document.getElementById('maze-setup').style.display = 'none';
    document.getElementById('maze-result').style.display = 'none';
    document.getElementById('maze-quiz').style.display = 'block';
}

function showNextMazeQuestion() {
    mazeState.isComplete = false;
    mazeState.stepCount = 0;
    mazeState.playerRow = 0;
    mazeState.playerCol = 0;

    mazeState.maze = generateMaze(mazeState.gridSize);
    mazeState.optimalSteps = findOptimalPath(mazeState.maze, mazeState.gridSize);

    document.getElementById('maze-progress').textContent =
        '第 ' + (mazeState.currentQuestion + 1) + '/' + mazeState.questionCount + ' 关';
    document.getElementById('maze-score').textContent = '得分：' + mazeState.score;

    var feedback = document.getElementById('maze-feedback');
    feedback.textContent = '';
    feedback.className = 'feedback';

    renderMaze();
}

function updateMazeTimer() {
    var elapsed = Math.floor((Date.now() - mazeState.startTime) / 1000);
    var el = document.getElementById('maze-timer');
    if (el) el.textContent = '用时：' + elapsed + '秒';
}

function finishMazeGame() {
    if (mazeState.timerInterval) clearInterval(mazeState.timerInterval);
    if (mazeState.keyHandler) {
        document.removeEventListener('keydown', mazeState.keyHandler);
        mazeState.keyHandler = null;
    }

    var totalTime = Math.floor((Date.now() - mazeState.startTime) / 1000);
    var accuracy = Math.round((mazeState.currentQuestion / mazeState.questionCount) * 100);

    saveMazeRecord(accuracy, totalTime, mazeState.questionCount, mazeState.score);

    document.getElementById('maze-reward-score').textContent = mazeState.score;
    document.getElementById('maze-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('maze-reward-time').textContent = totalTime;

    playMemoryLevelSound();
    speakReward(accuracy);
    setRewardStars('maze-reward-stars', accuracy);

    document.getElementById('maze-quiz').style.display = 'none';
    document.getElementById('maze-reward').style.display = 'block';
}

function showMazeRewardResult() {
    var totalTime = Math.floor((Date.now() - mazeState.startTime) / 1000);
    var accuracy = Math.round((mazeState.currentQuestion / mazeState.questionCount) * 100);

    document.getElementById('maze-result-score').textContent = mazeState.score;
    document.getElementById('maze-result-accuracy').textContent = accuracy + '%';
    document.getElementById('maze-result-mazes').textContent =
        mazeState.currentQuestion + '/' + mazeState.questionCount;
    document.getElementById('maze-result-time').textContent = totalTime;

    document.getElementById('maze-reward').style.display = 'none';
    document.getElementById('maze-result').style.display = 'block';
}
