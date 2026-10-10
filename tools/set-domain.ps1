# Подключение своего домена к сайту на GitHub Pages
# Создаёт файл CNAME, фиксирует его в git и публикует.
param([string]$Domain = 'azstec.ru')

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host ""
Write-Host "============================================"
Write-Host "   Подключение домена: $Domain"
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
  Write-Host "*** Git не найден. Установите GitHub Desktop. ***"
  Read-Host "Нажмите Enter, чтобы закрыть"
  exit 1
}

# 1. Файл CNAME — GitHub Pages читает из него имя домена
$Domain = $Domain.Trim().ToLower()
Set-Content -Path (Join-Path $root 'CNAME') -Value $Domain -NoNewline -Encoding ascii
Write-Host "[1/3] CNAME создан: $Domain"

# 2. Проверяем, что robots.txt и sitemap.xml ссылаются на этот домен
foreach ($f in @('robots.txt', 'sitemap.xml')) {
  $p = Join-Path $root $f
  if (Test-Path $p) {
    $c = Get-Content -Raw $p
    if ($c -notmatch [regex]::Escape($Domain)) {
      Write-Host "      ! в $f другой домен — замените адрес вручную"
    }
  } else {
    Write-Host "      ! $f отсутствует"
  }
}

# 3. Публикация
Write-Host "[2/3] Фиксирую изменения..."
& $git add -A
& $git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "      Изменений нет."
} else {
  & $git commit -m "Подключение домена $Domain" | Out-Null
  Write-Host "[3/3] Отправляю на GitHub..."
  & $git push
  if ($LASTEXITCODE -ne 0) {
    Write-Host "*** Не удалось отправить (push). Проверьте вход в GitHub. ***"
    Read-Host "Нажмите Enter, чтобы закрыть"
    exit 1
  }
}

Write-Host ""
Write-Host "============================================"
Write-Host "   Готово. Дальше:"
Write-Host "   1) GitHub -> Settings -> Pages -> Custom domain: $Domain -> Save"
Write-Host "   2) Включите Enforce HTTPS"
Write-Host "   Сайт откроется на https://$Domain"
Write-Host "============================================"
Write-Host ""
Read-Host "Нажмите Enter, чтобы закрыть"
