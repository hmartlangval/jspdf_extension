# JSPDF ENHANCED
By Nelvin, 7 July, 2024

**JSPDF** is a lightweight Javascript library for creating PDF at low level. This means that a number of details needs to be written in order to write even a single line of text into the PDF document.

This extension is an abstraction to some of the low-level logics and exposes a more simplified interface for generating the content. While this extension has a targetted design and may not fit for all requirement, it will be helpful in many basic requirements. 

# Technology
> Written in ES6 but build and exported as CommonJS module since some target platform supports only CommonJS (example Twilio serverless functions)

To change the build settings, go to `tsconfig.json > compilerOptions > module` 

> Also note that this library uses pixel for the dimension computation. While this can be changed, some of the margin/padding computation may not be accurate since the font sizes are assumed to be in pixels only.

# How to run
1. clone the project
2. npm install
3. npm run build


## Testing the code
1. npm run build
2. npm run download

This will run the script, generate a pdf and download it in the **`/downloads`** folder.

## To build for twilio serverless functions
1. npm run build4twilio

Specifically targetted for twilio functions, all classes and libraries are made as private assets. Hence the scripts will automatically append **`.private.js`** to end of each .js file.

### How to deploy to twilio
1. Copy all files in the **`/dist`** folder to Twilio's assets folder
2. From any of the **twilio-functions.js** file import the **`class.js`** file
3. Since it is a private assets, use the  twilio's inbuilt `Runtime.getAssets()['assetpath']`
4. Remember Twilio uses CommonJS so use "**require**" instead of "**imports**"


# Some key points:
1. Auto tracking of the last line, appends texts to the next line automatically
2. Can generate a page cover (basic design) 
3. Auto computation of the new page break
4. Drawing wrapping boxes (with background colors) on paragraphs
5. Uniform box padding on paragraphs
6. Text alignments - right or left
7. Flexible paragraph content width specified in percentage