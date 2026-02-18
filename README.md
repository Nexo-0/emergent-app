# QuickShop Kiosk App

QuickShop is a React + FastAPI + MongoDB self-service kiosk application.

## Stack
- Frontend: React, React Router, Tailwind
- Backend: FastAPI
- Database: MongoDB Atlas

## Project Structure
- `backend/server.py` - FastAPI app and API routes
- `backend/requirements.txt` - Python dependencies
- `backend/.env` - backend environment variables
- `frontend/src/` - React app source
- `frontend/src/screens/` - app screens (welcome, categories, products, cart, checkout, confirmation)

## API Endpoints
- `GET /api/categories`
- `GET /api/categories/{category_ref}`
- `POST /api/categories`
- `GET /api/products`
- `GET /api/products?category_id={id}`
- `GET /api/products/{id}`
- `POST /api/products`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `POST /api/seed-data` (POST only)
- `GET /api/health/connectors`

## Environment

### Backend (`backend/.env`)
```env
MONGO_URL=mongodb+srv://<user>:<pass>@cluster0.3d2ywdn.mongodb.net/sample_supplies?retryWrites=true&w=majority&appName=Cluster0&tls=true
DB_NAME=sample_supplies
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (`frontend/.env`)
```env
REACT_APP_BACKEND_URL=http://127.0.0.1:8080
```

## Run Locally

### 1) Start backend
```powershell
cd D:\UI_UX\emergent-app\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn server:app --host 127.0.0.1 --port 8080 --reload
```

### 2) Seed data
```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8080/api/seed-data
```

### 3) Start frontend
```powershell
cd D:\UI_UX\emergent-app\frontend
npm.cmd install
npm.cmd start
```

### 4) Open app
- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8080`

## Notes
- `GET /api/seed-data` returns `405 Method Not Allowed` by design. Use `POST`.
- Receipt printing uses native browser print (`window.print()`) and prints only the `#receipt` section.
