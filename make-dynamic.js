const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedFiles = [];

walkDir('src/app', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('import { prisma } from') || content.includes('import prisma from')) {
            // If it doesn't already have force-dynamic
            if (!content.includes("export const dynamic = 'force-dynamic'")) {
                // we remove the revalidate = 60 if it exists, as force-dynamic cannot be used with revalidate
                content = content.replace(/export const revalidate = \d+;/g, '');
                // add force-dynamic to the top (after imports)

                // split by lines
                const lines = content.split('\n');
                let lastImportIndex = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('import ')) {
                        lastImportIndex = i;
                    }
                }

                lines.splice(lastImportIndex + 1, 0, '\nexport const dynamic = \'force-dynamic\';\n');
                fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                modifiedFiles.push(filePath);
            }
        }
    }
});

console.log("Modified " + modifiedFiles.length + " files to be force-dynamic.");
