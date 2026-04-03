# Chore Tracker

A simple home chore tracker with recurring task management.

## Setup on GitHub Pages

### 1. Create a GitHub repository
- Go to github.com → click **+** → **New repository**
- Name it exactly: `lil-Task-List`
- Set to **Public**
- Click **Create repository**

### 2. Upload these files
- On your new repo page, click **uploading an existing file**
- Drag and drop ALL files and folders from this zip (keep the folder structure intact)
- Scroll down, click **Commit changes**

### 3. Enable GitHub Pages
- Go to your repo **Settings** → **Pages** (left sidebar)
- Under **Source**, select **GitHub Actions**
- Click **Save**

### 4. Wait ~2 minutes
GitHub will automatically build and deploy. You'll see a green checkmark under the **Actions** tab when done.

### 5. Your app is live at:
```
https://alexkishi.github.io/lil-Task-List/
```

---

## Adding sync later (Firebase)

The storage logic is isolated in `src/App.jsx` at the top — look for the comment:
```
// ─── Storage helpers (swap these out when adding Firebase later) ───
```
Replace `loadTasks()` and `saveTasks()` with Firebase Firestore calls and you're done.
