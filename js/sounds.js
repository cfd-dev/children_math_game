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

// ============ 语音鼓励 ============
// 彩蛋模式开关（连续点击音效按钮5次切换）
var eggVoiceMode = localStorage.getItem('eggVoiceMode') === 'on';
var _soundTapCount = 0;
var _soundTapTimer = null;

// 监听主界面图标的隐藏彩蛋
document.addEventListener('click', function(e) {
    var btn = e.target.closest('.app-title-icon');
    if (!btn) return;
    _soundTapCount++;
    clearTimeout(_soundTapTimer);
    _soundTapTimer = setTimeout(function() { _soundTapCount = 0; }, 800);
    if (_soundTapCount >= 5) {
        _soundTapCount = 0;
        eggVoiceMode = !eggVoiceMode;
        localStorage.setItem('eggVoiceMode', eggVoiceMode ? 'on' : 'off');
        // 切换提示音
        if (eggVoiceMode) {
            playCorrectSound();
        } else {
            playWrongSound();
        }
        showVoiceModeToast(eggVoiceMode);
    }
});

function showVoiceModeToast(isEgg) {
    var toast = document.createElement('div');
    toast.textContent = isEgg ? '🎤 已切换到经典语音模式' : '🌟 已切换到童声语音模式';
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);'
        + 'background:rgba(0,0,0,0.8);color:#fff;padding:16px 28px;border-radius:16px;'
        + 'font-size:1.1em;z-index:10000;pointer-events:none;'
        + 'animation:voiceToast 2s ease forwards;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2000);
}

// --- 常规语音：活泼生动的童声 ---
var childCorrectPhrases = [
    { text: '答对啦', rate: 1.0, pitch: 1.6 },
    { text: '哇，好厉害呀', rate: 0.9, pitch: 1.7 },
    { text: '你太棒啦', rate: 1.0, pitch: 1.5 },
    { text: '真聪明呀', rate: 0.95, pitch: 1.6 },
    { text: '哇塞，太了不起啦', rate: 0.85, pitch: 1.8 },
    { text: '做得真好呀', rate: 1.0, pitch: 1.5 },
    { text: '好棒好棒', rate: 1.05, pitch: 1.7 },
    { text: '对啦对啦，就是这样', rate: 0.95, pitch: 1.6 }
];
var childWrongPhrases = [
    { text: '没关系哦，再试试', rate: 0.85, pitch: 1.3 },
    { text: '加油呀，你可以的', rate: 0.9, pitch: 1.4 },
    { text: '别着急，慢慢来哦', rate: 0.8, pitch: 1.3 },
    { text: '差一点点啦，再试一次', rate: 0.85, pitch: 1.4 },
    { text: '没关系，我们再来', rate: 0.9, pitch: 1.35 }
];
var childRewardPhrases = {
    high: [
        { text: '哇，太厉害啦，你是小小数学家', rate: 0.85, pitch: 1.7 },
        { text: '好棒呀，全部答对啦，真了不起', rate: 0.9, pitch: 1.6 },
        { text: '你就是小天才呀，太优秀啦', rate: 0.85, pitch: 1.8 }
    ],
    mid: [
        { text: '做得很好哦，再练练会更棒', rate: 0.9, pitch: 1.5 },
        { text: '很厉害了呢，继续加油呀', rate: 0.9, pitch: 1.5 },
        { text: '你进步好大呀，真为你骄傲', rate: 0.85, pitch: 1.6 }
    ],
    low: [
        { text: '没关系，我们再来一次好不好', rate: 0.8, pitch: 1.4 },
        { text: '慢慢来，你会越来越棒的', rate: 0.85, pitch: 1.4 },
        { text: '加油，下次一定可以的', rate: 0.9, pitch: 1.45 }
    ],
    veryLow: [
        { text: '别灰心哦，多练练就好啦', rate: 0.8, pitch: 1.35 },
        { text: '我们一起加油好不好', rate: 0.85, pitch: 1.4 },
        { text: '没关系，慢慢来不着急', rate: 0.8, pitch: 1.3 }
    ]
};

// --- 彩蛋语音：原始机器人风格 ---
var eggCorrectPhrases = [
    { text: '答对了', rate: 1.1, pitch: 1.2 },
    { text: '你真棒', rate: 1.1, pitch: 1.2 },
    { text: '太厉害了', rate: 1.1, pitch: 1.2 },
    { text: '真聪明', rate: 1.1, pitch: 1.2 },
    { text: '非常好', rate: 1.1, pitch: 1.2 },
    { text: '真了不起', rate: 1.1, pitch: 1.2 }
];
var eggWrongPhrases = [
    { text: '答错了', rate: 1.1, pitch: 1.2 },
    { text: '还需努力', rate: 1.1, pitch: 1.2 },
    { text: '再想想', rate: 1.1, pitch: 1.2 },
    { text: '别灰心', rate: 1.1, pitch: 1.2 }
];
var eggRewardPhrases = {
    high: [{ text: '太棒了，你真是小天才！', rate: 1.1, pitch: 1.2 }],
    mid: [{ text: '做得不错，继续努力！', rate: 1.1, pitch: 1.2 }],
    low: [{ text: '还可以，加油哦！', rate: 1.1, pitch: 1.2 }],
    veryLow: [{ text: '没关系，多练习就会进步！', rate: 1.1, pitch: 1.2 }]
};

function getZhVoice() {
    var voices = window.speechSynthesis.getVoices();
    return voices.find(function(v) {
        return v.lang.startsWith('zh') && /female|xiaoxiao|yaoyao|huihui|lili|tian|wan/i.test(v.name);
    }) || voices.find(function(v) {
        return v.lang.startsWith('zh');
    }) || null;
}

function speakItem(item) {
    if (!soundEnabled) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(item.text);
    utter.lang = 'zh-CN';
    utter.rate = item.rate;
    utter.pitch = item.pitch;
    if (!eggVoiceMode) {
        var voice = getZhVoice();
        if (voice) utter.voice = voice;
    }
    window.speechSynthesis.speak(utter);
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function speakCorrect() {
    var list = eggVoiceMode ? eggCorrectPhrases : childCorrectPhrases;
    speakItem(pickRandom(list));
}

function speakWrong() {
    var list = eggVoiceMode ? eggWrongPhrases : childWrongPhrases;
    speakItem(pickRandom(list));
}

function speakReward(accuracy) {
    var tier;
    if (accuracy >= 90) tier = 'high';
    else if (accuracy >= 70) tier = 'mid';
    else if (accuracy >= 50) tier = 'low';
    else tier = 'veryLow';
    var list = eggVoiceMode ? eggRewardPhrases[tier] : childRewardPhrases[tier];
    speakItem(pickRandom(list));
}
