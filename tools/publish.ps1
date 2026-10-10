# Публикация сайта АЗС Технологии на GitHub Pages
param([switch]$Dry)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host ""
Write-Host "============================================"
Write-Host "   Публикация сайта АЗС Технологии"
Write-Host "   (GitHub Pages)"
Write-Host "============================================"
Write-Host ""

function Find-Git {
  $c = Get-Command git -ErrorAction SilentlyContinue
  if ($c) { return $c.Source }
  $base = Join-Path $env:LOCALAPPDATA 'GitHubDesktop'
  if (Test-Path $base) {
    foreach ($d in (Get-ChildItem $base -Directory -Filter 'app-*' | Sort-Object Name -Descending)) {
      $exe = Join-Path $d.FullName 'resources\app\git\cmd\git.exe'
      if (Test-Path $exe) { return $exe }
    }
  }
  return $null
}

# Папка "Загрузки" берётся из настроек Windows (у каждого пользователя она своя,
# часто не C:\Users\...\Downloads, а, например, D:\Downloads).
function Find-Downloads {
  $candidates = @()
  try {
    $sf = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders' -ErrorAction Stop
    $p = $sf.'{374DE290-123F-4565-9164-39C4925E467B}'
    if ($p) { $candidates += $p }
  } catch {}
  try {
    $usf = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders' -ErrorAction Stop
    $p = $usf.'{374DE290-123F-4565-9164-39C4925E467B}'
    if ($p) { $candidates += [Environment]::ExpandEnvironmentVariables($p) }
  } catch {}
  if ($env:USERPROFILE) { $candidates += (Join-Path $env:USERPROFILE 'Downloads') }
  $candidates += 'D:\Downloads'
  $candidates += 'C:\Downloads'

  foreach ($c in $candidates) { if ($c -and (Test-Path $c)) { return $c } }
  return $null
}

$git = Find-Git
if (-not $git) {
  Write-Host "*** Git не найден ***"
  Write-Host "Установите GitHub Desktop (https://desktop.github.com) и запустите снова."
  Write-Host ""
  Read-Host "Нажмите Enter, чтобы закрыть"
  exit 1
}

$dl = Find-Downloads
Write-Host "[1/3] Проверяю папку Загрузки: $dl"
if (-not $dl) {
  Write-Host "      Не удалось определить папку Загрузки."
} else {
  # Отдельно ищем news.js и users.js. Учитываем копии вида "users (1).js".
  $jobs = @(
    @{ name = 'news';  dest = 'data\news.js';  parts = @('news', 'newsData', 'материалы') },
    @{ name = 'users'; dest = 'data\users.js'; parts = @('users', 'пользователи') }
  )
  foreach ($j in $jobs) {
    $found = @()
    foreach ($f in (Get-ChildItem -LiteralPath $dl -File -Filter '*.js' -ErrorAction SilentlyContinue)) {
      $base = [IO.Path]::GetFileNameWithoutExtension($f.Name)   # например "users (1)"
      $clean = ($base -replace '\s*\(\d+\)\s*$', '').Trim()      # убираем " (1)"
      if ($j.parts -contains $clean.ToLower()) { $found += $f }
    }
    $destPath = Join-Path $root $j.dest
    if ($found.Count) {
      $f = $found | Sort-Object LastWriteTime -Descending | Select-Object -First 1
      $destTime = if (Test-Path $destPath) { (Get-Item -LiteralPath $destPath).LastWriteTime } else { [DateTime]::MinValue }
      if ($f.LastWriteTime -gt $destTime) {
        Copy-Item -LiteralPath $f.FullName -Destination $destPath -Force
        Write-Host ("      обновлён " + $j.dest + "  <-  " + $f.Name)
      } else {
        Write-Host ("      " + $j.dest + " — свежее уже в проекте, скачанный файл старее (оставляю как есть)")
      }
    } else {
      Write-Host ("      " + $j.dest + " — файл в Загрузках не найден (оставляю как есть)")
    }
  }
}

Write-Host "[2/3] Ищу изменения..."
& $git add -A
& $git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "      Изменений нет - публиковать нечего."
  Write-Host "      Если вы редактировали материалы в браузере, сначала нажмите"
  Write-Host "      кнопку Скачать в редакторе (data/news.js и data/users.js)."
  Write-Host ""
  Read-Host "Нажмите Enter, чтобы закрыть"
  exit 0
}

if ($Dry) {
  Write-Host "      [проверка] Изменения есть, готово к публикации:"
  & $git status -s
  Write-Host ""
  Read-Host "Нажмите Enter, чтобы закрыть"
  exit 0
}

Write-Host "[3/3] Публикую на GitHub..."
$msg = "Обновление сайта " + (Get-Date -Format 'dd.MM.yyyy HH:mm')
& $git commit -m $msg | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "*** Не удалось сделать commit. Запустите GitHub Desktop и проверьте репозиторий. ***"
  Write-Host ""
  Read-Host "Нажмите Enter, чтобы закрыть"
  exit 1
}

& $git push
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "*** Не удалось отправить (push). Проверьте интернет и вход в GitHub Desktop. ***"
  Write-Host ""
  Read-Host "Нажмите Enter, чтобы закрыть"
  exit 1
}

Write-Host ""
Write-Host "============================================"
Write-Host "   Готово! Сайт обновится примерно через минуту:"
Write-Host "   https://amogusas.github.io/azstec-deploy/"
Write-Host "============================================"
Write-Host ""
Read-Host "Нажмите Enter, чтобы закрыть"
