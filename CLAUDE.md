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

**`goHome()` in app.js** is the central reset — it resets every game page to setup visibility, clears all timer intervals, and hides the numpad. When adding a new game, you must add its reset logic here.

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
- `STORAGE_KEYS` and `initStorage()` (from `profile.js`) — all localStorage keys defined there
- Profile functions: `save*Record()`, `update*Ability()`, `getUserName()`, `getUserGrade()` called cross-module

## User Data

All data in `localStorage`. History arrays capped at 50 entries. Ability scores are numeric (0-100, default 50). Sound preference stored as `'on'`/`'off'` string. `isFirstTimeUser()` checks for missing `userGrade` or `userName`.

## CSS

Single file `css/style.css`. Mobile-first responsive with breakpoints at 480px and 360px. Custom on-screen numpad replaces native keyboard on mobile. The `.menu-buttons` grid uses `repeat(3, 1fr)` with `min-width: 0` on buttons to prevent content overflow on narrow screens.

## EmailJS Feedback

Configured in `app.js` — replace `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID` with actual values from emailjs.com.
