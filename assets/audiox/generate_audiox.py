"""使用 DashScope qwen3-tts-instruct-flash 批量生成儿童数学 App 语音资源
   端点: /api/v1/services/aigc/multimodal-generation/generation
   输出: WAV 保存到 audiox/{voice}/ 子目录"""

import sys
import os
import time
import json
import requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

API_KEY = os.environ.get("DASHSCOPE_API_KEY", "")
ENDPOINT = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL = "qwen3-tts-flash"
VOICE = "Cherry"

MAX_RETRIES = 3
RETRY_DELAY = 2

VOICE_DESC = "6-8岁小女孩的声音，甜美、温暖、充满活力，像幼儿园里最受小朋友欢迎的大姐姐。语速适中偏慢，吐字清晰，带有自然的微笑感，尾音略微上扬，亲切可爱。"

STYLE_PROMPTS = {
    "correct":        "用兴奋、惊喜的语气说出。像看到好朋友做了一件了不起的事情一样，声音里充满真诚的赞美和开心。活泼但不做作。",
    "wrong":          "用温柔、安慰的语气说出。像好朋友轻轻拍拍肩膀一样，声音柔软但不低沉，带着'没关系，我相信你'的鼓励感。",
    "reward_high":    "用超级开心、激动的语气说出。像刚看到一场精彩的表演一样，声音里充满赞叹和骄傲。稍微提高音量和语速。",
    "reward_mid":     "用肯定、鼓励的语气说出。像一位耐心的老师在期末评语里写表扬一样，声音温暖而真诚。",
    "reward_low":     "用温和、包容的语气说出。像妈妈在孩子摔倒后轻轻扶起来一样，声音柔和但有力量，传递'没关系，我陪着你'的信息。",
    "reward_verylow": "用轻快、积极的语气说出。完全没有沮丧，反而像在说'我们一起来玩吧'一样轻松。",
    "system":         "用自信、可爱的自我介绍语气说出。像一个小朋友在新朋友面前介绍自己一样，声音明亮、大方，带着一点点骄傲感。",
}

ENTRIES = [
    ("correct_01.wav", "答对啦", "correct"),
    ("correct_02.wav", "好厉害呀", "correct"),
    ("correct_03.wav", "你太棒啦", "correct"),
    ("correct_04.wav", "真聪明呀", "correct"),
    ("correct_05.wav", "太了不起啦", "correct"),
    ("correct_06.wav", "做得真好呀", "correct"),
    ("correct_07.wav", "好棒好棒", "correct"),
    ("correct_08.wav", "对啦对啦", "correct"),

    ("wrong_01.wav", "没关系哦", "wrong"),
    ("wrong_02.wav", "再试试吧", "wrong"),
    ("wrong_03.wav", "加油呀", "wrong"),
    ("wrong_04.wav", "别着急", "wrong"),
    ("wrong_05.wav", "差一点点啦", "wrong"),
    ("wrong_06.wav", "没关系我们再来", "wrong"),

    ("reward_high_01.wav", "太厉害啦，你是小小数学家", "reward_high"),
    ("reward_high_02.wav", "好棒呀，全部答对啦", "reward_high"),
    ("reward_high_03.wav", "你就是小天才呀", "reward_high"),

    ("reward_mid_01.wav", "做得很好哦，继续加油", "reward_mid"),
    ("reward_mid_02.wav", "很厉害了呢，再练练会更棒", "reward_mid"),
    ("reward_mid_03.wav", "你进步好大呀", "reward_mid"),

    ("reward_low_01.wav", "没关系，我们再来一次", "reward_low"),
    ("reward_low_02.wav", "慢慢来你会越来越棒", "reward_low"),
    ("reward_low_03.wav", "加油下次一定行", "reward_low"),

    ("reward_verylow_01.wav", "别灰心哦多练练就好啦", "reward_verylow"),
    ("reward_verylow_02.wav", "我们一起加油好不好", "reward_verylow"),
    ("reward_verylow_03.wav", "慢慢来不着急", "reward_verylow"),

    ("system_hello.wav", "我是你的学习小助手", "system"),
]


def synthesize(text, style_key):
    style = STYLE_PROMPTS.get(style_key, "")
    prompt = f"{VOICE_DESC}{style}"

    payload = {
        "model": MODEL,
        "input": {
            "text": text,
            "voice": VOICE,
            "prompt": prompt,
        },
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }
    resp = requests.post(ENDPOINT, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    audio_info = data.get("output", {}).get("audio", {})
    audio_url = audio_info.get("url", "")
    if not audio_url:
        raise RuntimeError(f"No audio URL in response: {json.dumps(data, ensure_ascii=False)[:200]}")

    audio_resp = requests.get(audio_url, timeout=30)
    audio_resp.raise_for_status()
    return audio_resp.content


def generate_one(filename, text, style_key, idx, total, output_dir):
    wav_path = os.path.join(output_dir, filename)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            wav_data = synthesize(text, style_key)
            with open(wav_path, "wb") as f:
                f.write(wav_data)
            size_kb = len(wav_data) / 1024
            print(f"  \u2713 [{idx}/{total}] {filename} ({size_kb:.1f} KB)")
            return True

        except requests.exceptions.HTTPError as e:
            status = e.response.status_code if e.response is not None else "?"
            body = e.response.text[:120] if e.response is not None else ""
            print(f"  \u2717 [{idx}/{total}] HTTP {status}: {body}")
            if "Arrearage" in body:
                print("  \u2717 账户欠费，请充值后重试")
                return False
            if status == 429:
                wait = RETRY_DELAY * (2 ** (attempt - 1))
                print(f"    \u23f3 限流，等待 {wait}s...")
                time.sleep(wait)
                continue
            if status in (401, 403):
                return False
        except Exception as e:
            print(f"  \u2717 [{idx}/{total}] {e}")

        if attempt < MAX_RETRIES:
            time.sleep(RETRY_DELAY * attempt)

    return False


def main():
    if not API_KEY:
        print("错误：未找到环境变量 DASHSCOPE_API_KEY")
        sys.exit(1)

    output_dir = os.path.join(SCRIPT_DIR, VOICE.lower())
    os.makedirs(output_dir, exist_ok=True)

    total = len(ENTRIES)
    print(f"DashScope {MODEL} 批量语音生成")
    print(f"  音色: {VOICE}  输出: {output_dir}")
    print(f"  条目: {total} 条\n")

    ok = fail = 0
    for idx, (filename, text, style_key) in enumerate(ENTRIES, 1):
        if generate_one(filename, text, style_key, idx, total, output_dir):
            ok += 1
        else:
            fail += 1
        if idx < total:
            time.sleep(0.3)

    print(f"\n完成 \u2713 {ok} / \u2717 {fail}，共 {total} 条")
    if fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
