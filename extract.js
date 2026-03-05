const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const files = [
    'Brochure.doc.pdf',
    'Content.docx.pdf',
    'WEBSITE.xlsx - HOME.pdf',
    'WEBSITE.xlsx - SLIDES.pdf',
    'WEBSITE.xlsx - PRODUCT PORTFOLIO.pdf'
];

const basePath = 'c:\\Users\\DELL\\OneDrive\\Desktop\\aelbd';

async function extract() {
    for (const file of files) {
        const filePath = path.join(basePath, file);
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            fs.writeFileSync(`${file}.txt`, data.text);
            console.log(`Extracted ${file}.txt`);
        } catch (err) {
            console.error(`Failed to extract ${file}:`, err);
        }
    }
}

extract();
