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

$git = Find-Git
if (-not $git) {
  Write-Host "*** Git не найден ***"
  Write-Host "Установите GitHub Desktop (https://desktop.github.com) и запустите снова."
  Write-Host ""
  Read-Host "Нажмите Enter, чтобы закрыть"
  exit 1
}

Write-Host "[1/3] Проверяю папку Загрузки..."
$dl = Join-Path $env:USERPROFILE 'Downloads'
if (Test-Path $dl) {
  $jobs = @(
    @{ filter = 'news*.js';  dest = 'data\news.js'  },
    @{ filter = 'users*.js'; dest = 'data\users.js' }
  )
  foreach ($j in $jobs) {
    $f = Get-ChildItem -LiteralPath $dl -Filter $j.filter -File -ErrorAction SilentlyContinue |
         Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($f) {
      Move-Item -LiteralPath $f.FullName -Destination (Join-Path $root $j.dest) -Force
      Write-Host ("      обновлён " + $j.dest)
    }
  }
}

Write-Host "[2/3] Ищу изменения..."
& $git add -A
& $git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "      Изменений нет - публиковать нечего."
  Write-Host "      Если вы редактировали новости в браузере, сначала нажмите"
  Write-Host "      кнопку Скачать data/news.js в редакторе."
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
