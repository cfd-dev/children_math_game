// 音效模块 - 使用 Web Audio API 生成适合儿童的音效

let soundEnabled = localStorage.getItem('soundEnabled') !== 'off';

function updateSoundIcon() {
    var iconOn = document.getElementById('sound-icon-on');
    var iconOff = document.getElementById('sound-icon-off');
    if (iconOn && iconOff) {
        iconOn.style.display = soundEnabled ? '' : 'none';
        iconOff.style.display = soundEnabled ? 'none' : '';
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled ? 'on' : 'off');
    updateSoundIcon();
    if (soundEnabled) playClickSound();
}

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// 播放一个音符
function playTone(frequency, duration, type, volume, delay) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const startTime = ctx.currentTime + (delay || 0);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume || 0.3, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

// 按钮点击音效 - 轻快的"嘀"声
function playClickSound() {
    playTone(800, 0.08, 'sine', 0.15);
}

// 输入数字音效 - 短促的敲击声
function playTypeSound() {
    playTone(600, 0.05, 'sine', 0.1);
}

// 回答正确音效 - 欢快的上升音阶
function playCorrectSound() {
    playTone(523, 0.12, 'sine', 0.25, 0);      // C5
    playTone(659, 0.12, 'sine', 0.25, 0.1);     // E5
    playTone(784, 0.2, 'sine', 0.3, 0.2);       // G5
}

// 回答错误音效 - 友好的下降音
function playWrongSound() {
    playTone(400, 0.15, 'triangle', 0.2, 0);
    playTone(300, 0.25, 'triangle', 0.2, 0.12);
}

// 过关/升级音效 - 欢庆的旋律
function playLevelUpSound() {
    playTone(523, 0.1, 'sine', 0.25, 0);        // C5
    playTone(587, 0.1, 'sine', 0.25, 0.08);     // D5
    playTone(659, 0.1, 'sine', 0.25, 0.16);     // E5
    playTone(784, 0.15, 'sine', 0.3, 0.24);     // G5
    playTone(1047, 0.3, 'sine', 0.35, 0.35);    // C6
}

// 记忆游戏过关音效 - 闪亮的上升音
function playMemoryLevelSound() {
    playTone(659, 0.08, 'sine', 0.2, 0);        // E5
    playTone(784, 0.08, 'sine', 0.2, 0.07);     // G5
    playTone(1047, 0.08, 'sine', 0.25, 0.14);   // C6
    playTone(1319, 0.25, 'sine', 0.3, 0.22);    // E6
}

// 开始游戏音效
function playStartSound() {
    playTone(392, 0.1, 'sine', 0.2, 0);         // G4
    playTone(523, 0.1, 'sine', 0.2, 0.08);      // C5
    playTone(659, 0.15, 'sine', 0.25, 0.16);    // E5
}

// 为所有按钮添加点击音效（事件委托）
document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (btn) {
        playClickSound();
    }
});

// 为所有输入框添加输入音效（事件委托）
document.addEventListener('input', function(e) {
    if (e.target.matches('.answer-box, .memory-box') && e.target.value.length === 1) {
        playTypeSound();
    }
});
