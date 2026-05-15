# Don't say the same thing

A simple browser-based game host app for "Don't say the same thing as me". Only the host sees the screen; you read each question aloud and players answer out loud, trying not to match your private answer.

## Files

- `index.html` — entry point
- `styles.css` — styling, with light/dark mode support
- `app.js` — game logic
- `questions/example.json` — example question pack

## Run locally

Just open `index.html` in any modern browser. No build step, no dependencies.

For mobile testing with localhost, serve it with any static server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `dont-say-same`).
2. Push these files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/dont-say-same.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
5. Save. After a minute or two the site will be live at `https://<your-username>.github.io/dont-say-same/`.

## Question file format

A JSON array of `{ question, answer }` objects. The `answer` field is filled in during play and can start as an empty string:

```json
[
  { "question": "Name a fruit that is yellow.", "answer": "" },
  { "question": "Name a famous scientist.", "answer": "" }
]
```

## How to play

1. Open the app on your phone or laptop.
2. Set the player count.
3. Optionally load a custom `.json` question pack (otherwise 3 defaults are used).
4. Tap **Start game**.
5. Read the question out loud. Type your private answer. Tap **Next**.
6. Reveal answers however you like (count down, then everyone reveals; players who matched anyone lose a point, etc. — house rules).

State auto-saves to `localStorage`, so reloading won't lose your progress. **Export answers** saves the played session as JSON.

## Keyboard shortcuts

- `←` / `→` — previous / next question (when not typing in the answer field)
