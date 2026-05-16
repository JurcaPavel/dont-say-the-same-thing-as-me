# Don't say the same thing

A simple browser-based game host app for "Don't say the same thing as me". Only the host sees the screen; you read each question aloud and players answer out loud, trying not to match your private answer.

## Files

- `index.html` — entry point
- `styles.css` — styling, with light/dark mode support
- `app.js` — game logic
- `questions.js` — question pack (edit this to change questions)

## Run locally

Just open `index.html` in any modern browser. No build step, no dependencies.

## Adding or changing questions

Edit `questions.js`. Each entry has an English question, an optional Czech translation, and a pre-filled host answer:

```js
const QUESTIONS = [
  {
    "category": "general",
    "difficulty": "easy",
    "question": "Name a fruit that is yellow.",
    "question-cs": "Jmenujte ovoce, které je žluté.",
    "answer": ""
  }
];
```