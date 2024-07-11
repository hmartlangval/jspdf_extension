
/***
 * Date: 1st Jul, 2024
 * Nelvin: Twilio functions has a way of importing private assets.
 * the CommonJS approach of require("path")will not work, we need to retrieve the path at Runtime.
 * So this script converts all fixed "paths" to runtime "paths"
 */

const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../../dist'); // Adjust this if you need to target a different directory

function replaceRequiresInFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    // const result = data.replace(/require\(\s*["']\.\//g, 'require(Runtime.getAssets()["/pdfscripts/');
    const result = data.replace(/require\(\s*["']\.\/([^"']+)["']\s*\)/g, 'require(Runtime.getAssets()["/pdfscripts/$1.js"].path)');

    /** this line will replace all require("./filename.js") to require(Runtimexxxx[/filename.js].path) */
    // const result = data.replace(/require\(\s*["']\.\/([^"']+\.js)["']\s*\)/g, 'require(Runtime.getAssets()["/pdfscripts/$1"].path)');

    // /** the tsc exports an extra line "exports {};" at the end of the file, remove that */
    // const res2 = result.replace(/export {};/g, "");

    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`Processed file: ${filePath}`);
}

function processDirectory(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach(file => {
            const filePath = path.join(directory, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                processDirectory(filePath); // Recursively process directories
            } else if (path.extname(file) === '.js') {
                replaceRequiresInFile(filePath);
            }
        });
    });
}

processDirectory(directoryPath);
