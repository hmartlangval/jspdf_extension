/** goal of this is to fix all IMPORT statements with a twilio compatible require.
 * No Longer in use as we have changed the original codes with require that should not demand a post-build fix script
 * 
 * 
 */


// const fs = require('fs');
// const path = require('path');

// // Function to process a single file
// function processFile(filePath) {
//     // Read the file content
//     let content = fs.readFileSync(filePath, 'utf8');

//     // // Regex to match import statements
//     // const importRegex = /^(\s*import\s+(?:.+\s+from\s+)?['"](.+)['"])(\s*;\s*)?$/gm;

//     // // Replace import statements with .js extension inside the statement
//     // content = content.replace(importRegex, (match, importStatement, importPath, semicolon) => {
//     //     // Check if path already has .js extension
//     //     if (!importPath.endsWith('.js')) {
//     //         const updatedImportPath = importPath.endsWith('/') ? importPath + 'index.js' : importPath + '.js';
//     //         return importStatement.replace(importPath, updatedImportPath) + (semicolon || '');
//     //     }
//     //     return match; // No change needed
//     // });
    
//     const importRegex = /import\s+(\w+)\s+from\s+['"](.\/\w+)['"];?/g;

//     // Replace import statements with require statements
//     const modifiedData = data.replace(importRegex, (match, moduleName, importPath) => {
//         const assetPath = `/pdfscripts${importPath.substring(1)}.js`; // Adjust asset path as needed
//         return `const ${moduleName} = require(Runtime.getAssets()['${assetPath}'].path);`;
//     });


   

//     // Write the modified content back to the file
//     fs.writeFileSync(filePath, content, 'utf8');
// }

// // Function to process all .js files in a directory
// function processDirectory(dirPath) {
//     // Read the directory
//     fs.readdirSync(dirPath).forEach(file => {
//         const filePath = path.join(dirPath, file);
//         const stat = fs.statSync(filePath);

//         if (stat.isDirectory()) {
//             // Recursively process subdirectories
//             processDirectory(filePath);
//         } else if (filePath.endsWith('.js')) {
//             // Process .js files
//             console.log(`Processing ${filePath}...`);
//             processFile(filePath);
//         }
//     });
// }

// // Example usage: Process a specific directory
// const directoryPath = './dist'; // Replace with your folder path
// processDirectory(directoryPath);
