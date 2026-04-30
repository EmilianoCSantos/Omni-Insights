# Setup Database Script for Omni-Insights
# Skapa databasen OmniInsights i (localdb)\MSSQLLocalDB

Write-Host "🗄️  Omni-Insights Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Kontrollera om sqlcmd är tillgänglig
try {
    $sqlcmdTest = sqlcmd -? | Out-Null
} catch {
    Write-Host "❌ sqlcmd är inte installerad eller inte i PATH" -ForegroundColor Red
    Write-Host "Installera SQL Server Command Line Tools (sqlcmd) eller använd SQL Server Management Studio" -ForegroundColor Yellow
    exit 1
}

# Kontrollera om (localdb)\MSSQLLocalDB är tillgänglig
Write-Host "Kontrollerar LocalDB-instans..." -ForegroundColor Yellow
try {
    $instances = sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "SELECT @@VERSION" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ LocalDB är tillgänglig" -ForegroundColor Green
    } else {
        Write-Host "❌ Kan inte ansluta till LocalDB" -ForegroundColor Red
        Write-Host "Se till att SQL Server LocalDB är installerat" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Fel vid anslutning till LocalDB" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

# Skapa databasen
Write-Host ""
Write-Host "Skapar databasen 'OmniInsights'..." -ForegroundColor Yellow

$createDbQuery = "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'OmniInsights')
BEGIN
    CREATE DATABASE OmniInsights
    PRINT 'Databasen OmniInsights har skapats'
END
ELSE
BEGIN
    PRINT 'Databasen OmniInsights existerar redan'
END
"

try {
    $result = sqlcmd -S "(localdb)\MSSQLLocalDB" -Q $createDbQuery
    Write-Host $result -ForegroundColor Green
    Write-Host "✓ Databasen är redo!" -ForegroundColor Green
} catch {
    Write-Host "❌ Fel vid skapande av databasen" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup klar!" -ForegroundColor Green
Write-Host ""
Write-Host "Nästa steg:" -ForegroundColor Cyan
Write-Host "1. Öppna backend-mappen: cd backend" -ForegroundColor White
Write-Host "2. Starta servern: dotnet run" -ForegroundColor White
Write-Host "3. Entity Framework skapar tabellerna automatiskt" -ForegroundColor White
Write-Host ""
