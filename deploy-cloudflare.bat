@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   Публикация сайта на Cloudflare Pages
echo ============================================
echo.

echo [1/3] Сборка папки .deploy...
node "tools\build-deploy.js"
if errorlevel 1 goto :err
echo.

echo [2/3] Проверка входа в Cloudflare...
echo     При первом запуске откроется браузер — войдите в свой аккаунт Cloudflare.
echo.
npx --yes wrangler@latest whoami
if errorlevel 1 (
  echo     Выполняю вход...
  npx --yes wrangler@latest login
  if errorlevel 1 goto :err
)
echo.

echo [3/3] Загрузка на Cloudflare Pages (проект: azstec)...
echo     Если проект ещё не создан — wrangler предложит его создать, ответьте Yes.
echo.
npx --yes wrangler@latest pages deploy .deploy --project-name=azstec --branch=main --commit-dirty=true
if errorlevel 1 goto :err

echo.
echo ============================================
echo   Готово! Сайт опубликован.
echo   Адрес вида: https://azstec.pages.dev
echo ============================================
pause
exit /b 0

:err
echo.
echo *** ОШИБКА. Прочитайте сообщение выше. ***
pause
exit /b 1
