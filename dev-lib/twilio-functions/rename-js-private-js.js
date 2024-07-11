/***
 * Date: 1st Jul, 2024
 * Nelvin: Script will rename automatically all files from *.js to *.private.js
 * Reason: we are uploading all these files to twilio assets as private only.
 * 
 * 
 */

const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively process subdirectories
            processDirectory(filePath);
        } else {

            if (path.extname(file) === '.js') {
                const oldPath = path.join(dirPath, file);
                const newPath = path.join(dirPath, path.basename(file, '.js') + '.private.js');

                fs.rename(oldPath, newPath, err => {
                    if (err) {
                        console.log('Error renaming file: ' + err);
                    } else {
                        console.log(`Renamed: ${oldPath} -> ${newPath}`);
                    }
                });
            }

        }
    });
}

const directoryPath = path.join(__dirname, '../../dist');
processDirectory(directoryPath);