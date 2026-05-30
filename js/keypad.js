// 自定义数字键盘模块

var numpad = {
    el: null,
    currentInput: null,
    visible: false,

    // 初始化键盘
    init: function() {
        this.el = document.getElementById('numpad');
        if (!this.el) return;

        var self = this;
        // 事件委托处理按键点击
        this.el.addEventListener('click', function(e) {
            var btn = e.target.closest('.numpad-key');
            if (!btn) return;
            e.preventDefault();

            var key = btn.dataset.key;
            if (!key) return;

            if (key === 'del') {
                self.doBackspace();
            } else {
                self.doInput(key);
            }
        });

        // 点击键盘区域外时隐藏（但不阻止输入框聚焦）
        document.addEventListener('touchstart', function(e) {
            if (!self.visible) return;
            if (self.el.contains(e.target)) return;
            if (e.target.closest('.answer-box, .memory-box')) return;
            self.hide();
        }, { passive: true });
    },

    // 显示键盘
    show: function(input) {
        if (!this.el) return;
        this.currentInput = input;
        this.el.classList.add('show');
        this.visible = true;
        document.body.classList.add('numpad-open');
    },

    // 隐藏键盘
    hide: function() {
        if (!this.el) return;
        this.el.classList.remove('show');
        this.visible = false;
        this.currentInput = null;
        document.body.classList.remove('numpad-open');
    },

    // 输入数字
    doInput: function(num) {
        var input = this.currentInput;
        if (!input) return;
        if (input.disabled) return;

        // 追加模式：多位数输入（如猜数字游戏）
        if (input.classList.contains('numpad-append')) {
            if (input.value.length < 10) {
                input.value += num;
            }
            input.placeholder = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }

        input.value = num;
        input.placeholder = '';

        // 触发 input 事件，让原有的处理逻辑接管
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // 如果输入框有值，聚焦下一个
        if (input.value.length === 1) {
            var allInputs = Array.from(input.parentElement.querySelectorAll('.answer-box, .memory-box'));
            var idx = allInputs.indexOf(input);
            var next = allInputs[idx + 1];
            if (next && !next.disabled) {
                this.currentInput = next;
                next.focus();
            }
        }
    },

    // 退格
    doBackspace: function() {
        var input = this.currentInput;
        if (!input) return;
        if (input.disabled) return;

        // 追加模式：删除最后一个字符
        if (input.classList.contains('numpad-append')) {
            if (input.value.length > 0) {
                input.value = input.value.slice(0, -1);
            }
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }

        if (input.value !== '') {
            input.value = '';
            input.placeholder = input.classList.contains('memory-box') ? '?' : '';
        } else {
            // 当前框为空，跳到上一个
            var allInputs = Array.from(input.parentElement.querySelectorAll('.answer-box, .memory-box'));
            var idx = allInputs.indexOf(input);
            var prev = allInputs[idx - 1];
            if (prev && !prev.disabled) {
                prev.value = '';
                prev.placeholder = prev.classList.contains('memory-box') ? '?' : '';
                this.currentInput = prev;
                prev.focus();
            }
        }

        // 触发 input 事件
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
};

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', function() {
    numpad.init();
});
