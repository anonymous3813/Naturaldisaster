BEGIN TRY
BEGIN TRAN;

-- Create Storms table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Storms' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[Storms] (
        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [externalId] NVARCHAR(255) NOT NULL,
        [title] NVARCHAR(255) NOT NULL,
        [lat] FLOAT NOT NULL,
        [lon] FLOAT NOT NULL,
        [radiusKm] FLOAT NOT NULL,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END;

-- Create Notifications table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notifications' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[Notifications] (
        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [userId] NVARCHAR(255) NOT NULL,
        [message] NVARCHAR(1000) NOT NULL,
        [delivered] BIT NOT NULL DEFAULT 0,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END;

-- (You already have UserLocations so we won’t recreate it)

COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRAN;
    END;
    THROW;
END CATCH;
