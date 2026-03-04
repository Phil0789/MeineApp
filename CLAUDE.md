# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A German-language Progressive Web App (PWA) for Android that captures tasks by voice, assigns them to up to 10 colour-coded projects, optionally attaches a due date, and provides a monthly calendar overview. Fully offline-capable, zero external dependencies, no build step.

## Running the app locally

The app requires a static file server (`file://` URLs block the Service Worker).

```bash
# Python (usually pre-installed)
python -m http.server 8080

# Or Node
npx serve .
```

Open `http://localhost:8080` in **Chrome**. For testing on a physical Android device use an HTTPS tunnel (e.g. `npx localtunnel --port 8080`), as the Web Speech API requires HTTPS outside `localhost`.

After code changes, do a **hard reload** (Ctrl+Shift+R / Cmd+Shift+R) to bypass the service worker cache, or bump `CACHE_NAME` in `sw.js` (currently `aufgaben-v2`).

## Architecture

No framework, no bundler, no dependencies. Three source files:

| File | Role |
|------|------|
| `app.js` | All state, logic, and DOM rendering (~600 lines) |
| `styles.css` | All styling — mobile-first, CSS custom properties |
| `sw.js` | Service worker — cache-first, all static assets |

### State management

All mutable state lives in a single `state` object at the top of `app.js`. Every action function mutates state then calls `render()`, which tears down and rebuilds the full DOM from scratch (no virtual DOM). `saveData()` persists `{ projects, tasks }` to `localStorage` after every mutation.

### Key flows

**Voice → assign → save:**
1. FAB tap → `startListening()` → Web Speech API (`de-DE`, `continuous: false`)
2. `recognition.onresult` streams interim text live; on final result: `state.assigning = true`
3. Assign modal: user picks optional due date + project → `assignTask(projectId)` → `state.tasks.unshift(...)` → `saveData()`

**Text fallback:** if Speech API is unavailable or user taps "Text eingeben", `openTextMode()` shows a textarea in the recording overlay instead of the mic animation.

**Project editing:** tapping the pencil icon on a project sets `state.editingProjectId`, which causes `renderProjectsView()` to render an inline edit form in place of that project's list item. `saveEditProject()` patches the project in-place and saves.

**Calendar:** `renderCalendarView()` builds a month grid from `getCalendarDays(year, month)`. Tapping a day sets `state.calendarSelectedDay`, which appends a `renderCalendarDayDetail()` panel below the grid showing all tasks (including completed) with that `dueDate`.

### Data model

```js
// Project
{ id: string, name: string, color: string, createdAt: number }

// Task
{ id: string, text: string, projectId: string|null, dueDate: string|null,
  createdAt: number, done: boolean, completedAt: number|null }
```

`dueDate` is stored as an ISO date string `'YYYY-MM-DD'`. Overdue = `task.dueDate < getToday() && !task.done`. Tasks are stored newest-first (`unshift`).

### Views / navigation

Three tabs in the bottom nav:
- **Aufgaben** — task list, grouped by project, with filter chips and "show completed" toggle
- **Kalender** — monthly grid; days with tasks show coloured dots; overdue days get a red tint; tapping a day shows its tasks
- **Projekte** — project list with inline add/edit forms (colour picker + name field)

### CSS conventions

All colours and spacing tokens are CSS custom properties on `:root` in `styles.css`. Icon buttons use `.btn-icon` as base with `.btn-edit` or `.btn-danger` for hover-colour variants.

## Browser support

| Feature | Requirement |
|---------|-------------|
| Speech Recognition | Chrome on desktop & Android only |
| PWA install prompt | Chrome on Android |
| Core app (text mode, calendar, projects) | Any modern browser |

## Constraints

- Maximum 10 projects (enforced in `saveNewProject`).
- Deleting a project reassigns its tasks to `projectId: null` ("Ohne Projekt").
- No server, no accounts — data lives only in `localStorage` on the device.
