-- Setup Database Script for Omni-Insights
-- Kör denna SQL i SQL Server Management Studio eller sqlcmd

-- Skapa databasen OmniInsights om den inte redan existerar
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'OmniInsights')
BEGIN
    CREATE DATABASE OmniInsights
    PRINT 'Databasen OmniInsights har skapats'
END
ELSE
BEGIN
    PRINT 'Databasen OmniInsights existerar redan'
END

-- Använd databasen
USE OmniInsights
GO

-- Entity Framework Core skapar tabellerna automatiskt när appen startar
-- Men du kan skapa dem manuellt här om du vill:

-- Skapa TrackingData-tabellen
IF NOT EXISTS (SELECT name FROM sys.tables WHERE name = 'TrackingData')
BEGIN
    CREATE TABLE TrackingData (
        Id INT PRIMARY KEY IDENTITY(1,1),
        SessionId UNIQUEIDENTIFIER NOT NULL,
        Timestamp DATETIME2 NOT NULL,
        X_mm FLOAT NOT NULL,
        Y_mm FLOAT NOT NULL,
        Z_mm FLOAT NOT NULL,
        Magnitude_mm FLOAT NOT NULL,
        Pitch_deg FLOAT NOT NULL,
        Roll_deg FLOAT NOT NULL,
        Yaw_deg FLOAT NOT NULL,
        BeamOn BIT NOT NULL DEFAULT 0,
        FileType NVARCHAR(50),
        FileName NVARCHAR(255)
    )
    
    -- Skapa composite index för performance
    CREATE INDEX idx_TrackingData_SessionTimestamp ON TrackingData(SessionId, Timestamp)
    
    PRINT 'TrackingData-tabellen har skapats'
END
ELSE
BEGIN
    PRINT 'TrackingData-tabellen existerar redan'
END

PRINT 'Databasen är redo!'
