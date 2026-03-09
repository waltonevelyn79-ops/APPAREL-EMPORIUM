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
        if (content.includes("'use client'") || content.includes('"use client"')) {
            let hasDynamic = false;
            if (content.match(/export const dynamic\s*=\s*['"]force-dynamic['"];?/)) {
                content = content.replace(/export const dynamic\s*=\s*['"]force-dynamic['"];?\s*/g, '');
                fs.writeFileSync(filePath, content, 'utf8');
                modifiedFiles.push(filePath);
            }
        }
    }
});

console.log("Modified " + modifiedFiles.length + " client files to remove force-dynamic.");
