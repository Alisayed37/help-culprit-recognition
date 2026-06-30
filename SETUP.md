# Help Culprit Recognition — Setup Guide

A forensic suspect-search app: **.NET 8 API** + **Python FastAPI (CLIP) AI service** + **React (Vite) UI** + **MySQL**.

---

## 1. Install prerequisites (one time, per machine)

Install these four tools first and make sure each is on your PATH:

| Tool | Version | Download |
|------|---------|----------|
| .NET SDK | 8.0 or newer | https://dotnet.microsoft.com/download/dotnet/8.0 |
| Python | 3.10+ | https://www.python.org/downloads/ (check "Add to PATH") |
| Node.js | 18+ | https://nodejs.org/ |
| MySQL Server | 8.x | https://dev.mysql.com/downloads/installer/ |

> During MySQL install, set a **root password** and remember it. Make sure the MySQL service is running afterward.

Verify they're installed (open a new terminal):
```bat
dotnet --version
python --version
node --version
mysql --version
```

---

## 2. Install project dependencies

Double-click **`setup.bat`** (in the project root).

It will:
1. Check the tools above are present
2. `pip install -r implementation/requirements.txt` (PyTorch, transformers, FastAPI…)
3. `npm install` in the frontend
4. `dotnet restore` in the backend
5. Ask for your **MySQL root password** and write it into `backend/ForensicApi/appsettings.json`

> The app **auto-creates** the `ForensicDb` database and all tables on first run — you don't create them manually.

### Doing it manually instead
```bat
REM Python AI
cd implementation
python -m pip install -r requirements.txt

REM Frontend
cd ..\frontend\forensic-ui
npm install

REM Backend
cd ..\..\backend\ForensicApi
dotnet restore
```
Then open `backend/ForensicApi/appsettings.json` and set the password in the connection string:
```json
"DefaultConnection": "Server=localhost;Database=ForensicDb;Uid=root;Pwd=YOUR_MYSQL_PASSWORD;"
```

---

## 3. The AI model files (IMPORTANT)

The trained CLIP models live in **`implementation/models/`** (e.g. `epoch_3/model.safetensors` ≈ 600 MB each).
These are large and may not survive a zip/Git transfer — make sure they are copied too.

A model folder is only usable if it contains a **`model.safetensors`** weights file.
Working models in the dropdown: **Epoch 0, Epoch 3 (recommended), Epoch 8**.

---

## 4. Run the app

Double-click **`start.bat`**. It opens three windows (Python AI, .NET API, React UI), starts MySQL if needed, and opens the browser.

- UI → http://localhost:5173
- API → http://localhost:5011
- Python docs → http://127.0.0.1:8000/docs

⏳ Wait ~30–60 s on first launch for the Python service to load the CLIP models before searching.

To stop everything: double-click **`stop.bat`**.

---

## 5. How to use it

1. **Register** an account, then log in.
2. Create a **New Investigation** (sidebar).
3. Open the **Images** tab → **Upload Images** → wait for *"Upload complete. Index rebuilt."*
4. Open the **Search** tab:
   - **Text search**: describe the suspect (e.g. "a man with glasses"); optionally use the certainty sliders.
   - **Image search**: upload a query photo to find visually similar suspects.
   - Keep the model on **Epoch 3**.

> You must **upload + index images before searching** an investigation, otherwise you'll get *"Investigation vectors not found."*

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Access denied for user 'root'` | Password in `appsettings.json` doesn't match MySQL. Re-run `setup.bat` or edit it. |
| `Unknown database 'forensicdb'` | Harmless — the API creates it on startup. Just restart the backend. |
| `Investigation vectors not found` | Upload images to that investigation (Images tab) before searching. |
| `Model epoch_X not loaded` | That model folder is missing `model.safetensors`. Use Epoch 3. |
| Python window closes instantly | A package failed to install — run `pip install -r implementation/requirements.txt` and read the error. |
| Port already in use | Run `stop.bat`, then `start.bat` again. |

---

## Default ports
| Service | Port |
|---|---|
| React UI | 5173 |
| .NET API | 5011 |
| Python AI | 8000 |
| MySQL | 3306 |
