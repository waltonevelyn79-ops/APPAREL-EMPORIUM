const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('Apparel_Emporium_User_Manual_Handover.pdf');
pdf(dataBuffer).then(function(data) {
  console.log('--- PDF INFO ---');
  console.log('Total Pages:', data.numpages);
  console.log('Text length:', data.text.length);
  console.log('Sample Text:\n', data.text.substring(0, 500));
}).catch(err => {
  console.error('PDF Parse Error:', err);
});
