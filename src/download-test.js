const jsPDFExtensionByNelvin = require("../dist/class");
const fs = require('fs');

const DATE_FORMAT = "lll";
const ME_BACKGROUND_COLOR = "#D8E7FB";
const AGENT_BACKGROUND_COLOR = "#F2E6FA";

const FONTS = {
    Regular: {
        name: "Inter-Regular",
        assetPath: "../dist/fonts/Inter-Regular-normal.js"
    },
    Bold: {
        name: "Inter-Bold",
        assetPath: "../dist/fonts/Inter-Bold-bold.js"
    }
    // Regular: {
    //   name: "Inter-Regular",
    //   assetPath: Runtime.getAssets()["/pdfscripts/fonts/Inter-Regular-normal.js"].path
    // },
    // Bold: {
    //   name: "Inter-Bold",
    //   assetPath: Runtime.getAssets()["/pdfscripts/fonts/Inter-Bold-bold.js"].path
    // }
}

const COVER_CONFIG = {
    fontSizeTitle: 20, //optional
    fontSizeSubtitle: 10, //optional
    bgColor: "#101010",
    textColor: "#FFFFFF",
    iconUrl: "https://hmartlangval.github.io/jspdf_extension/public/logo.png",
    title: "Sample Document Title",
    iconWidth: 250, //optional
    iconHeight: 200 //optional
}

// while we can get these from the UI, translations may cause issues with the fonts used. So we better configure from backend
const FOOTER_CONFIG = {
    footer_text: "Nelvin PDF Enhanced", //event.footer_1
    footer_url: "https://zogamers.com/" //event.footer_url
}

function downloadPDF() {
    fetch(COVER_CONFIG.iconUrl)
        .then(async (imgResp) => {
            try {
                let contentType = imgResp.headers.get('content-type');
                let buf = await imgResp.arrayBuffer();
                let base64Image = `data:${contentType};base64,` + Buffer.from(buf).toString("base64");
                COVER_CONFIG.iconUrl = base64Image;


                const jspdf2 = new jsPDFExtensionByNelvin(
                    {
                        borderedXPadding: 10,
                        borderedYPadding: 20,
                        defaultFontSize: 12,
                        lineHeightFactor: 1,
                        lineVSpacing: 50,
                        xPadding: 80,
                        yPadding: 80,
                        defaultTextColor: "#000000",
                        dir: "rtl"
                    },
                    FONTS,
                    COVER_CONFIG
                );

                jspdf2.doPrint();

                jspdf2.drawFooter(FOOTER_CONFIG);

                let buffer = jspdf2.getDoc().output('arraybuffer');

                console.log('writing to file')
                fs.writeFile("./downloads/download-test.pdf", Buffer.from(buffer), (err) => {
                    if (err) {
                        console.error('Error saving PDF file:', err);
                    } else {
                        console.log('PDF file saved successfully.');
                    }
                });


            }
            catch (err) {
                console.log('error occured ', err)
            }
        })
        .catch(error => {
            console.log("ERROR ON FETCH", error)
        })
}
downloadPDF();
