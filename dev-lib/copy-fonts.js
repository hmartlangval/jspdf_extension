const fs = require('fs');
const path = require('path');

const sourceDir = './src/fonts';
const outputDir = './dist/fonts';

/*** COPY all fonts from source/fonts directory to dist/fonts directory */

function copyFonts(sourceDir, outputDir) {
    fs.readdirSync(sourceDir).forEach(file => {
        const filePath = path.join(sourceDir, file);
        const stat = fs.statSync(filePath);

        if(!stat.isDirectory() &&  path.extname(file) === '.js') {
            const sourceFile = path.join(sourceDir, file);
            const destFile = path.join(outputDir, file);

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }

            fs.copyFile(sourceFile, destFile, (err) => {
                if (err) {
                    console.log('Error copying file: ' + err);
                } else {
                    console.log(`Copied ${sourceFile} to ${destFile}`);
                }
            });
        }
    });

    // fs.readdir(sourceDir, (err, files) => {
    //     if (err) {
    //         console.error('Error reading source directory:', err);
    //         return;
    //     }

    //     files.forEach(file => {
    //         if (path.extname(file) === '.css') {
    //             const sourceFile = path.join(sourceDir, file);
    //             const destFile = path.join(outputDir, file);

    //             fs.copyFile(sourceFile, destFile, (err) => {
    //                 if (err) {
    //                     console.error(`Error copying ${sourceFile} to ${destFile}:`, err);
    //                 } else {
    //                     console.log(`Copied ${sourceFile} to ${destFile}`);
    //                 }
    //             });
    //         }
    //     });
    // });
}

copyFonts(sourceDir, outputDir);