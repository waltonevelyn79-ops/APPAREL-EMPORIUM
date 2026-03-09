import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Before any schema change:
// 1. Auto-backup current database
// 2. Run prisma db push
// 3. If error, restore backup
// 4. Log migration result

export async function safeMigrate(): Promise<{
    success: boolean;
    backupPath: string;
    output: string;
    error?: string;
}> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'prisma', 'backups');
    // Works mainly with SQLite databases. Change to mysqldump or pg_dump logic for production relational DBs
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const backupPath = path.join(backupDir, `backup-${timestamp}.db`);

    try {
        // 1. Auto-backup current database
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, backupPath);
            console.log(`[Backup] DB correctly backed up to ${backupPath}`);
        } else {
            console.warn('[Backup] Warning: No dev.db found. Creating a fresh DB.');
        }

        // 2. Run prisma db push
        const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss');

        // 4. Log migration result
        return {
            success: true,
            backupPath,
            output: stdout,
        };

    } catch (error: any) {
        // 3. If error, restore backup
        console.error(`[Migration] Failed. Restoring database from backup ${backupPath}...`);

        if (fs.existsSync(backupPath) && fs.existsSync(dbPath)) {
            fs.copyFileSync(backupPath, dbPath);
            console.log(`[Restore] DB restored safely.`);
        }

        return {
            success: false,
            backupPath,
            output: error.stdout || '',
            error: error.message || error.stderr,
        };
    }
}

