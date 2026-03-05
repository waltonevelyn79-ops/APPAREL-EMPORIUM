import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;

export async function checkForUpdates(): Promise<{
    currentVersion: string;
    latestVersion: string;
    updateAvailable: boolean;
    changelog: string;
}> {
    try {
        const repoUrl = process.env.GITHUB_REPO_URL || 'https://raw.githubusercontent.com/globalstitch/webapp/main';

        const pkgRes = await fetch(`${repoUrl}/package.json`, { cache: 'no-store' });
        if (!pkgRes.ok) throw new Error('Failed to fetch remote package.json');

        const remotePkg = await pkgRes.json();
        const latestVersion = remotePkg.version;

        const updateAvailable = compareVersions(latestVersion, APP_VERSION) > 0;

        let changelog = 'No changelog available.';
        if (updateAvailable) {
            const clRes = await fetch(`${repoUrl}/CHANGELOG.md`, { cache: 'no-store' });
            if (clRes.ok) {
                changelog = await clRes.text();
            }
        }

        return {
            currentVersion: APP_VERSION,
            latestVersion,
            updateAvailable,
            changelog
        };
    } catch (err: any) {
        return {
            currentVersion: APP_VERSION,
            latestVersion: APP_VERSION,
            updateAvailable: false,
            changelog: `Could not check for updates: ${err.message}. To enable remote version checking, set GITHUB_REPO_URL in your .env`
        };
    }
}

// Simple semver compare function
function compareVersions(v1: string, v2: string): number {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}
