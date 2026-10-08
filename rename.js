const fs = require('fs');
const path = require('path');

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('build') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else { 
            if (!file.includes('package-lock.json') && !file.endsWith('.png') && !file.endsWith('.jpg')) {
                results.push(file);
            }
        }
    });
    return results;
};

const files = walk(__dirname);

files.forEach(file => {
    try {
        const ext = path.extname(file);
        if (['.js', '.jsx', '.css', '.html', '.md', '.json', '.bat'].includes(ext)) {
            let content = fs.readFileSync(file, 'utf8');
            let newContent = content
                .replace(/hearaid/gi, 'hearaid')
                .replace(/HearAid/gi, 'HearAid')
                .replace(/HearAid/gi, 'HearAid');
            
            if (content !== newContent) {
                fs.writeFileSync(file, newContent, 'utf8');
                console.log('Updated:', file);
            }
        }
    } catch (e) {
        console.log('Error reading', file);
    }
});
