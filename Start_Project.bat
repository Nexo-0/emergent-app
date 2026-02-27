@echo off
echo =====================================
echo    Setting up Backend...
echo =====================================

cd backend

python -m venv venv
call venv\Scripts\activate

pip install -r requirements.txt

start cmd /k uvicorn server:app --host 127.0.0.1 --port 8080

cd ..

echo =====================================
echo    Setting up Frontend...
echo =====================================

cd frontend

npm install
npm start

pause