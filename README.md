# 📅 WallCalendar

A beautiful, interactive wall calendar built with React — inspired by the aesthetic of a physical desk calendar with a spiral binding, hero photography, and a clean grid layout.

---

## ✨ Features

- **Month hero images** — each month gets a unique full-width Unsplash photo
- **Date range selection** — click two dates to highlight a range
- **Notes per date** — jot down notes for any day or date range, saved to `localStorage`
- **Reminders** — add time-based reminders to any single date with browser notification support
- **Indian public holidays** — auto-labelled on the calendar via `date-holidays`
- **Dark mode** — toggle between light and dark themes
- **Animated month transitions** — smooth 3D flip animation using Framer Motion
- **Spiral binding UI** — decorative metal coil rendered purely in CSS
- **Responsive layout** — adapts for mobile and tablet screens

---

## 🛠 Design Choices

| Choice | Reason |
|---|---|
| `date-fns` for date logic | Lightweight, tree-shakeable, no global state like Moment.js |
| `framer-motion` for transitions | Enables the 3D page-flip effect cleanly with `AnimatePresence` |
| `date-holidays` with `'IN'` locale | Auto-injects Indian public holidays without a backend |
| `localStorage` for persistence | Zero-config persistence — no backend or auth needed for an intern project |
| CSS `clip-path` for the hero shape | Pure CSS diagonal shape overlay, no SVG files needed |
| `repeating-linear-gradient` for ruled lines | Mimics a real notepad without any images |

---

## 🚀 Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/your-username/wall-calendar.git
cd wall-calendar
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install required packages (if not already in `package.json`)

```bash
npm install date-fns framer-motion lucide-react date-holidays
```

### 4. Place the component files

Make sure these files are in your `src/` folder:

```
src/
├── WallCalendar.jsx
├── WallCalendar.css
└── App.jsx        ← import WallCalendar here
```

### 5. Update `App.jsx`

```jsx
import WallCalendar from './WallCalendar';

function App() {
  return <WallCalendar />;
}

export default App;
```

### 6. Start the dev server

```bash
npm run dev       # if using Vite
# or
npm start         # if using Create React App
```

Open [http://localhost:5173](http://localhost:5173) (Vite) or [http://localhost:3000](http://localhost:3000) (CRA) in your browser.

---

## 🧪 Testing Mobile View

In **Arc** (or any browser):
1. Press `Cmd + Option + I` to open DevTools
2. Press `Cmd + Shift + M` to toggle device toolbar
3. Select a device preset (e.g. iPhone 14) or type `390` as the width

Breakpoints in the CSS:
- `≤ 768px` — stacked layout, smaller hero
- `≤ 480px` — compact day cells and hero

---


## 🔔 Browser Notifications

To enable reminder notifications, click the **Notifications Off** badge in the sidebar. Your browser will ask for permission. Reminders fire at the exact time you set (checked every 30 seconds).

> Works best in Chrome/Arc. Safari has limited Notification API support.

---

Built as an intern assignment.
