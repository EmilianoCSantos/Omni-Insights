# Database Setup

Två sätt att skapa databasen för Omni-Insights:

## Alternativ 1: PowerShell Script (Rekommenderat)

```powershell
# Kör från projektets root-mapp:
.\setup-database.ps1
```

Scriptet kommer:
- Kontrollera att LocalDB är installerat
- Skapa databasen "OmniInsights"
- Ge instruktioner för nästa steg

## Alternativ 2: SQL Script

Använd SQL Server Management Studio (SSMS):

1. Öppna SSMS
2. Anslut till `(localdb)\MSSQLLocalDB`
3. Öppna `setup-database.sql`
4. Kör scriptet (F5)

**Eller använd sqlcmd:**

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -i setup-database.sql
```

## Efter Setup

1. Gå till backend-mappen:
   ```powershell
   cd backend
   ```

2. Starta servern:
   ```powershell
   dotnet run
   ```

3. Entity Framework skapar automatiskt tabellerna första gången appen startar

4. I ett nytt terminal, starta frontend:
   ```powershell
   cd frontend
   npm start
   ```

5. Öppna `http://localhost:3000` i din webbläsare

## Kontrollera databasen

```powershell
# Se alla databaser
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "SELECT name FROM sys.databases"

# Se tabeller i OmniInsights
sqlcmd -S "(localdb)\MSSQLLocalDB" -d OmniInsights -Q "SELECT name FROM sys.tables"
```
