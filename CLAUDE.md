# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How to Run

Open `index.html` directly in a browser. No build step, no dependencies to install. The only external resource is an EmailJS CDN script loaded in `<head>` for the feedback form.

## Architecture

**Single-page static app** — all UI lives in one `index.html`. Each "page" is a `<div class="page">` toggled via `showPage(pageId)` in `app.js`. No routing library, no modules, no bundler.

**Script load order matters** — all JS files are plain `<script>` tags with global scope. `math-quiz.js` must load before other game modules because it defines `gradeConfig` and `currentGrade` globals that every module consumes. `app.js` loads last.

```
sounds.js, keypad.js          → standalone, no deps
math-quiz.js                  → defines gradeConfig, currentGrade
{all other game modules}.js   → use gradeConfig, numpad, sounds, profile save funcs
profile.js                    → user data, radar chart, history
app.js                        → navigation, goHome(), init
```

**Each game page has 4 display states** (toggled via `style.display`): `*-setup`, `*-quiz`, `*-reward`, `*-result`.

**24-point game (`24game.js`) is a special case** — it uses its own on-screen keyboard (not the global numpad) with calculator-style free input for all grades. The player types an expression freely using digits, operators, and parentheses. The game includes a brute-force solver (`findAllSolutions`) that enumerates all possible expressions, and a recursive-descent parser (`safeEval24`) for safe evaluation. Keys for digits/operators not needed for the current puzzle are grayed out.

**`goHome()` in app.js** is the central reset — it resets every game page to setup visibility, clears all timer intervals, and hides the numpad. When adding a new game, you must add its reset logic here.

**Maze game (`maze-game.js`)** — generates perfect mazes (single path + dead ends, no loops) using DFS recursive backtracking, BFS for optimal path. Setup page has a maze size dropdown (±10 from grade default, step 5). Grid rendered as CSS grid; borders drawn per-cell (top/left only, last row/right for bottom/right) to avoid overlap. Supports mazes up to 40×40. Registers keyboard arrow keys only while active; removes handler on exit. `countPaths` has search node limit to avoid performance issues on large mazes.

**RMB game (`rmb-game.js`)** — simulates shopping with emoji items. Three question types based on grade: "total" (calculate sum), "change" (given total, calculate change), "both" (calculate both total and change from items with quantities). Higher grades have `qtyMax > 1` (buy multiple of same item) and `showSubtotal: false` (no price hint on cards). Uses the numpad in append mode (`numpad-append` class) for multi-digit input with a submit button.

## Adding a New Game

Every game follows an identical pattern:

1. State object at module top: `var xyzState = { totalQuestions, currentQuestion, score, correctCount, startTime, timerInterval, isProcessing }`
2. Per-grade config: `var xyzGradeConfig` keyed by grade IDs (`'k-small'`, `'k-medium'`, `'k-large'`, `'grade-1'` through `'grade-6'`). Fall back to `'grade-1'` if key missing.
3. Standard functions: `start*Game()`, `showNext*Question()`, `check*Answer()`, `finish*Game()`, `show*RewardResult()`
4. Call `save*Record()` and `update*Ability()` from profile.js on game finish
5. Add HTML with the 4 display states in `index.html`, a menu button on home-page, and reset logic in `goHome()`
6. Add history tab and stat card in profile page HTML

## Key Coupling Points

- `gradeConfig` / `currentGrade` (defined in `math-quiz.js`) — used by all game modules and profile
- `numpad` object (from `keypad.js`) — referenced directly by name in game modules for numeric input
- `playCorrectSound()`, `playWrongSound()`, `playClickSound()` etc. (from `sounds.js`) — global click delegation auto-plays click sounds; `playTone()` checks `soundEnabled` flag
- `voiceAudioProfiles` / `voiceStyles` (from `sounds.js`) — voice role registry. Pre-recorded WAV files live under `assets/audio-xiaomi/` (MiMo TTS) and `assets/audio-aliyun/` (DashScope TTS). Each voice entry has `base`, `correct[]`, `wrong[]`, `reward{high,mid,low,veryLow}[]`. `playVoiceAudio()` applies `playbackRate` from `voiceStyles[style].rate` for speed control. Default voice is `cherry` (DashScope). HTML select is in `index.html` profile page.
- `STORAGE_KEYS` and `initStorage()` (from `profile.js`) — all localStorage keys defined there
- Profile functions: `save*Record()`, `update*Ability()`, `getUserName()`, `getUserGrade()` called cross-module

## User Data

All data in `localStorage`. History arrays capped at 50 entries. Ability scores are numeric (0-100, default 50). Sound preference stored as `'on'`/`'off'` string. `isFirstTimeUser()` checks for missing `userGrade` or `userName`.

## Five-Dimension Ability Assessment

The profile radar chart uses 5 composite dimensions, each computed by `getDimensionScores()` in `profile.js` as the average of its constituent game abilities:

- **计算** (calc): math + compare + sum + match
- **推理** (logic): pattern + sudoku + twentyfour + brainteaser
- **记忆** (memory): memory
- **空间** (spatial): maze + seek
- **数感** (numberSense): sort + clock + rmb

Individual per-game ability values are still tracked and updated independently by each game's `update*Ability()` function. The dimension scores are computed on the fly when the profile page loads.

## CSS

Single file `css/style.css`. Mobile-first responsive with breakpoints at 480px and 360px. Custom on-screen numpad replaces native keyboard on mobile. The `.menu-buttons` grid uses `repeat(3, 1fr)` with `min-width: 0` on buttons to prevent content overflow on narrow screens. Maze game has landscape media query for side-by-side layout (maze left, controls right).

## EmailJS Feedback

Configured in `app.js` — replace `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID` with actual values from emailjs.com.
