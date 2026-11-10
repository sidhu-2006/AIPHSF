# HLERS - Start all services
Write-Host "Starting HLERS services..." -ForegroundColor Green

$env:Path = "C:\Users\Sidhu\AppData\Roaming\fnm\node-versions\v24.22.2\installation;C:\projects\HLERS\HLERS-main\ml\venv\Scripts;C:\Users\Sidhu\AppData\Local\Programs\Python\Python312;$env:Path"

# 1. Start ML Scoring Service (Port 5001)
Write-Host "Starting ML scoring service on port 5001..." -ForegroundColor Cyan
$mlProcess = Start-Process -FilePath "C:\projects\HLERS\HLERS-main\ml\venv\Scripts\python.exe" -ArgumentList "app.py" -WorkingDirectory "C:\projects\HLERS\HLERS-main\ml" -PassThru

# 2. Start Express Server (Port 5000)
Write-Host "Starting Backend API on port 5000..." -ForegroundColor Cyan
$serverProcess = Start-Process -FilePath "C:\Users\Sidhu\AppData\Roaming\fnm\node-versions\v24.22.2\installation\node.exe" -ArgumentList "index.js" -WorkingDirectory "C:\projects\HLERS\HLERS-main\server" -PassThru

# 3. Start Vite Client (Port 5173)
Write-Host "Starting Frontend Client on port 5173..." -ForegroundColor Cyan
$clientProcess = Start-Process -FilePath "C:\Users\Sidhu\AppData\Roaming\fnm\node-versions\v24.22.2\installation\npm.cmd" -ArgumentList "run dev" -WorkingDirectory "C:\projects\HLERS\HLERS-main\client" -PassThru

Write-Host "`nAll HLERS services started!" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "- Backend API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "- ML Service: http://localhost:5001" -ForegroundColor Yellow
Write-Host "`nPress Ctrl+C or close this window to stop all services."

try {
    Wait-Process -Id $clientProcess.Id
} finally {
    Stop-Process -Id $mlProcess.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $clientProcess.Id -ErrorAction SilentlyContinue
}

