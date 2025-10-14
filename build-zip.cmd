@echo off
REM ================== SummerPhantasm ZIP ==================
setlocal

REM 0) 切到脚本所在目录
cd /d "%~dp0"

REM 0.1) 基本检查
if not exist "package.json" (
  echo [ERR] 当前目录没有 package.json，请把本腳本放在項目根目錄再運行。
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERR] 没找到 npm，請先安裝 Node.js（含 npm）並加入 PATH。
  pause
  exit /b 1
)

REM 1) 清理上次產物與緩存
if exist "dist" rmdir /s /q "dist" >nul 2>nul
if exist "%LOCALAPPDATA%\electron-builder\Cache\wix"  rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\wix"  >nul 2>nul
if exist "%LOCALAPPDATA%\electron-builder\Cache\nsis" rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\nsis" >nul 2>nul

REM 2) 把臨時目錄指向 D:\tmp
if not exist "D:\tmp" mkdir "D:\tmp" >nul 2>nul
set "TEMP=D:\tmp"
set "TMP=D:\tmp"

REM 3) 使用國內鏡像
set "ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/"
set "ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/"

REM 4) 打 ZIP 包（僅 Windows x64）
echo.
echo === 正在打包 ZIP（x64） ===
call npm run dist -- -w zip --publish never
if errorlevel 1 (
  echo.
  echo [ERR] 打包失敗，請把上面紅色錯誤貼給我。
  pause
  exit /b 1
)

REM 5) 打開輸出目錄
echo.
echo === 打包完成，打開 dist 目錄 ===
if exist "%cd%\dist" start "" explorer "%cd%\dist"
endlocal
