// This file is for running test snippets
const amzdate = new Date().toISOString().split('.')[0].replace(/[-|:]/g, '') + 'Z';
const date = amzdate.split('T')[0];
console.log('date =', date);
console.log('amzdate =', amzdate);

console.log('json:', JSON.stringify('sdf'));
console.log('string:', 'sdf');
console.log('equal:', 'sdf' === JSON.stringify('sdf'));