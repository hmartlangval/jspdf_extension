
import { IParagraph, IPageInfo, IPageSettings, IContentResult } from "./model";
import jsPDF, { TextOptionsLight } from "jspdf";
import moment from "moment";
import { computeDimension, groupBy, makeid, sampleBase64Image } from "./core";

interface IPageSetting extends IPageSettings {
    dir?: "rtl" | "ltr",
    defaultTextColor?: string
}

interface IFooterConfig {
    footer_text?: string,
    footer_url?: string
}

interface ICoverConfig {
    bgColor: string,
    textColor: string,
    iconUrl: string,
    title: string,
    fontSizeTitle?: number,
    fontSizeSubtitle?: number,
    iconWidth?: number,
    iconHeight?: number,
    generated_time?: string
}
interface IColorsConfig {
    primary: string,
    secondary: string
}

interface IFC {
    name: string,
    assetPath: string
}

interface IFontsConfig {
    Regular: IFC,
    Bold: IFC
}



/** Please NOTE that this extension's size unit works best using "px" and "px_scaling" fixes enabled.
 * While it will work for other units also, slight variations are expected on some top paddings.
 * 
 * DIR: RTL is not supported as of version 1.0
 */
module.exports = class jsPDFExtensionByNelvin {
    private pageSettings: IPageSetting;
    private doc: jsPDF;
    private lastY: number
    private mainFontRegular: string;
    private mainFontBold: string;
    private domList: IPageInfo[][];

    constructor(pageSettings: IPageSetting, fonts: IFontsConfig, coverConfig: ICoverConfig) {
        this.domList = [];

        this.pageSettings = {
            defaultTextColor: "#000000",
            ...(pageSettings ?? {}),
            dir: "ltr",
        };

        require(`${fonts.Regular.assetPath}`);
        require(`${fonts.Bold.assetPath}`);
        this.mainFontRegular = fonts.Regular.name ?? "Helvetica";
        this.mainFontBold = fonts.Bold.name ?? "Helvetica";

        this.doc = new jsPDF({
            orientation: 'portrait',
            format: 'a4',
            unit: 'px',
            hotfixes: ["px_scaling"]
        });

        this.lastY = pageSettings.yPadding;

        this.drawCover(coverConfig)

    }

    drawCover(cfg: ICoverConfig) {

        cfg.iconWidth = cfg.iconWidth ?? 60;
        cfg.iconHeight = cfg.iconHeight ?? 60;


        let doc = this.doc;

        doc.setFillColor(cfg.bgColor);
        doc.setDrawColor(cfg.textColor);
        doc.rect(0, 0, doc.internal.pageSize.width, cfg.iconHeight + 300, 'FD');

        doc.setFontSize(cfg.fontSizeTitle ?? 20);
        doc.setTextColor(cfg.textColor);

        let imgW = cfg.iconWidth, imgH = cfg.iconHeight;
        let top = 100;

        let w = doc.internal.pageSize.width;
        doc.addImage(cfg.iconUrl, 'jpeg', (w / 2 - imgW / 2), top, imgW, imgH);

        this.setFontBold()
        let sz_title = cfg.title;
        // let sz_datetime = new Date().toISOString().split('T')[0]; // moment().format(DATE_FORMAT);
        let sz_datetime = cfg.generated_time ?? moment().format("lll");

        let fstyle: TextOptionsLight = { maxWidth: doc.internal.pageSize.width }
        let dim = computeDimension(doc, sz_title);
        doc.text(
            sz_title,
            dim.centeredStart,
            // (w / 2) - (dim.w / 2),
            (top + imgH + 50),
            // fstyle
        )

        doc.setFontSize(cfg.fontSizeSubtitle ?? 10);
        // let dim2 = doc.getTextDimensions(sz_datetime, fstyle);
        let dim2 = computeDimension(doc, sz_datetime);
        doc.text(
            sz_datetime,
            dim2.centeredStart,
            // w / 2 - dim2.w / 2,
            (top + imgH + 80),
            // fstyle
        )

        doc.addPage();

        this.setFont();
        doc.setFontSize(this.pageSettings.defaultFontSize);
        doc.setTextColor(this.pageSettings.defaultTextColor ?? "#000000");
    }

    drawFooter(cfg: IFooterConfig) {
        if(!cfg.footer_text && !cfg.footer_url) return;

        this.doc.addPage();
        this.lastY = this.pageSettings.yPadding;
        this.doc.setFontSize(10);
        this.setFont();

        if (!!cfg.footer_text) {
            let d1 = computeDimension(this.doc, cfg.footer_text)
            this.doc.text(cfg.footer_text, d1.centeredStart, this.pageSettings.yPadding * 2);
        }
        if (!!cfg.footer_url) {
            let d1 = computeDimension(this.doc, cfg.footer_url)
            this.doc.text(cfg.footer_url, d1.centeredStart, this.pageSettings.yPadding * 2 + this.pageSettings.defaultFontSize + 5)
        }
    }

    contentToText(text: any, maxWidth: number, containerHeight: number, maxContainerHeight?: number, para?: {
        marginBottom?: number,
        marginTop?: number,
    }, container?: { marginTop?: number }): IContentResult {

        let ps = this.pageSettings;

        let mt = container?.marginTop ?? 0;
        let pt = para?.marginTop ?? 0;

        let shouldNewPage = containerHeight < (30 + mt);
        if (shouldNewPage) {
            containerHeight = maxContainerHeight ?? (this.doc.internal.pageSize.height - (ps.yPadding * 2) - (ps.borderedYPadding * 2));
        }

        let initLength = text.length;
        let hAbs = { w: 0, h: 0 };
        let contH = containerHeight - (ps.borderedYPadding * 2) - mt - pt;

        let loopbreaker = 0;
        while (loopbreaker < 300 && text.length > 0 && (hAbs = this.doc.getTextDimensions(text, { maxWidth })).h > contH) {
            loopbreaker++;
            text.splice(text.length - 1, 1);
        }

        // computation of other margin bottom
        let isNewPageAfter = initLength > text.length;
        /*** COMPUTE MARGIN BOTTOM (ONLY IF NOT NEW PAGE, the paragraph continues, no need to calculate for margin bottom */
        if (!isNewPageAfter) {
            contH -= para?.marginBottom ?? 0;
            loopbreaker = 0;
            while (loopbreaker < 300 && text.length > 0 && (hAbs = this.doc.getTextDimensions(text, { maxWidth })).h > contH) {
                loopbreaker++;
                text.splice(text.length - 1, 1);
            }
            isNewPageAfter = initLength > text.length
        }

        let result = {
            text: text as string,
            dim: hAbs,

            /** a tricky situation where the FIRST algorithm satisfies text fits in the container Height,
             * But since computing the margin bottom, it no longer fits into the existing page and needs to drop to new page.
             * Here the text.length === 0 may arise if it is a single line, therefore causing the next content to overlap  
             */
            isNewPage: shouldNewPage || (initLength > 0 && text.length === 0 && isNewPageAfter),
            isNewPageAfter
        };

        return result;
    }

    isRightAligned(align?: string): boolean {
        let mod = align === "right" ? true : false;
        mod = this.pageSettings.dir === "rtl" ? !mod : mod;
        return mod;
    }

    createVirtualDOM(
        paragraphs: IParagraph[],
        header?: string,
        icon?: { url: string, type: string },
        boxConfig: {
            align?: "right" | "left",
            marginTop?: number,
            marginBottom?: number,
            leftMargin?: number,
            padBorderY?: number,
            padBorderX?: number,
            iconWidth?: number,
            bgColor?: string,
            contentWidth?: number, //the custom container width instead of the document width
            noBackground?: boolean, //ensures this para is not bordered, all border pads ignored
            noLineGap?: boolean //ensures it does not add a v-space end of para
        } = {}) {
        let ps = this.pageSettings;

        let pageInfo: IPageInfo[] = []
        let written = 0;
        let lastY = 0;
        let textHeight = 0;
        let padPageY = ps.yPadding;
        let iconWidth = boxConfig.iconWidth ?? 50;
        // let startY = dynamicValues.current.lastY;
        let startY = this.lastY;

        let padBorderY = (boxConfig.padBorderY ?? ps.borderedYPadding);
        let padBorderX = (boxConfig.padBorderX ?? ps.borderedXPadding);

        let h = this.doc.internal.pageSize.height;
        let containerHeight = h - padPageY - startY - padBorderY + ps.lineVSpacing;

        let containerWidth = this.doc.internal.pageSize.width - ps.xPadding * 2;
        let tCW = boxConfig.contentWidth ? (containerWidth * boxConfig.contentWidth) : containerWidth;

        let borderStartX = ((boxConfig.align === "right" && boxConfig.contentWidth) ? (containerWidth - tCW) : 0) + ps.xPadding;
        containerWidth = tCW;

        let borderStartY = startY + (boxConfig.marginTop ?? 0);
        let textStartX = borderStartX + padBorderX + iconWidth;
        let textStartY = borderStartY + padBorderY;
        let textSize = { width: containerWidth - iconWidth - padBorderX * 2 }
        let boxId = makeid(8);

        paragraphs.forEach((paragraph, idx) => {

            // if(paragraph.textSz.includes("ABC"))
            //     debugger;

            written = 0;
            let __fontSize = paragraph.fontSize2 ?? ps.defaultFontSize;

            /** reduce container if text is already printed within the same box container */
            containerHeight = textHeight === 0 ? containerHeight : containerHeight - textHeight;
            containerHeight -= (paragraph.marginTop ?? 0);

            /** compute textY if text was already printed within the same box container
             * + __fontSize is to ensure textY maintains consistent gap from borderY and textY for varying fontSizes
             */
            textStartY = textHeight === 0 ? (textStartY + __fontSize) : (textStartY + textHeight);
            // textStartY = textHeight === 0 ? (textStartY + padBorderY + parseInt((__fontSize / 1.8).toString())) : (textStartY + textHeight);
            textStartY += (paragraph.marginTop ?? 0);

            /** set fonts style */
            this.setFont(paragraph.style);
            this.doc.setFontSize(__fontSize);

            const paraText = this.doc.splitTextToSize(paragraph.textSz, textSize.width as number);
            let result = this.contentToText(paraText.slice(0), textSize.width as number, containerHeight, undefined, {
                marginBottom: paragraph.marginBottom,
                marginTop: paragraph.marginTop
            });

            let loopbreaker = 0;
            /** do until one full box is drawn
             * Text may require multiple pages, hence the loop to split page by page and compute the borders for each
             */
            do {

                loopbreaker++;

                if (result.isNewPage) {
                    boxId = makeid(8);
                    startY = padPageY;
                    containerHeight = h - padPageY * 2 - padBorderY * 2;
                    borderStartY = startY
                    textStartY = startY + padBorderY + __fontSize;
                }

                const a = {
                    pageId: boxId,
                    isNoBackground: boxConfig.noBackground,
                    bgColor: boxConfig.bgColor,
                    text: result.text,
                    borderStartX: borderStartX,
                    borderStartY: borderStartY,
                    // borderEndY: borderStartY + data[1].h + (ps.borderedYPadding * 2),
                    // borderEndY: textStartY + result.dim.h + (padBorderY / 2),
                    borderEndY: textStartY + result.dim.h + padBorderY - __fontSize,
                    isRtl: ps.dir === "rtl",
                    // textStartX: isRightAligned(paragraph.align) ? containerWidth - (iconWidth) + (ps.borderedXPadding * 2) + __fontSize : textStartX,
                    // textStartX: this.isRightAligned(paragraph.align) ? this.doc.internal.pageSize.width - (ps.xPadding) - (ps.borderedXPadding) - iconWidth : textStartX,
                    textStartX: this.isRightAligned(paragraph.align) ? this.doc.internal.pageSize.width - (ps.xPadding) - (padBorderX) - iconWidth : textStartX,
                    textStartY: textStartY,
                    borderWidth: containerWidth,
                    textContainerWidth: (containerWidth),
                    rows: result.text.length,
                    style: {
                        fontSize: __fontSize,
                        style: paragraph.style,
                        align: this.isRightAligned(paragraph.align) ? "right" : undefined as any,
                        color: paragraph.color ?? this.pageSettings.defaultTextColor as string
                    },
                    isNewPage: result.isNewPage || written > 0,
                    // iconUrl: written === 0 ? iconUrl : undefined,
                    icon: written === 0 && icon ? {
                        iconUrl: icon.url,
                        type: icon.type || 'PNG',
                        startX: ps.dir === "rtl" ? containerWidth : ps.xPadding + padBorderX, // ps.borderedXPadding,
                        startY: borderStartY + padBorderY, // ps.borderedYPadding,
                        w: 32,
                        h: 32
                    } : undefined
                }

                written += result.text.length;

                textHeight = result.dim.h;

                // lastY = para.padBorderY ? (a.borderEndY - ps.borderedYPadding + para.padBorderY) : a.borderEndY; // + ps.lineVSpacing;
                lastY = a.borderEndY;// + ps.lineVSpacing;

                if (result.isNewPageAfter) {
                    // debugger;
                    boxId = makeid(8);
                    startY = padPageY;
                    containerHeight = h - padPageY * 2 - padBorderY * 2;
                    borderStartY = startY
                    textStartY = startY + padBorderY + __fontSize;
                    result = this.contentToText(paraText.slice(written), textSize.width as number, containerHeight, undefined,
                        {
                            marginBottom: paragraph.marginBottom,
                        }
                    );
                } else {
                    //everything fits in the box and end of the paragraph
                    textHeight = result.dim.h + (paragraph.marginBottom ?? 0);
                    lastY += (paragraph.marginBottom ?? 0);
                    a.borderEndY += (paragraph.marginBottom ?? 0);
                }

                // dynamicValues.current.lastY = lastY;
                this.lastY = lastY;
                pageInfo.push(a);

            }
            while (loopbreaker < 200 && written < paraText.length);

            /** this line marks the end of ONE paragraph within a given box, place a gap between the next paragraph Y pos */
            // dynamicValues.current.lastY = lastY + ps.lineVSpacing;
            this.lastY = lastY + (boxConfig.noLineGap ? 0 : ps.lineVSpacing);
        })

        /** end of box border, put Y spacing where next box starts */
        if (boxConfig.marginBottom) {
            // dynamicValues.current.lastY += para.marginBottom;
            this.lastY += boxConfig.marginBottom;
        }

        this.domList.push(pageInfo);
        return pageInfo;
    }

    setFont(style?:string) {
        style === "bold"? this.setFontBold() : this.setFontRegular();
    }
    setFontRegular() {
        this.doc.setFont(this.mainFontRegular, "normal")
    }
    setFontBold() {
        this.doc.setFont(this.mainFontBold, "bold")
    }


    async doPrint() {

        let p = this.domList;

        let doc = this.doc;

        // console.log(doc.getFontList());

        /*** merge all page info into single array */
        let f: IPageInfo[] = [];
        p.forEach((x) => {
            x.forEach((y: IPageInfo) => {
                f.push(y)
            })
        })

        let boxBorders = groupBy(f, "pageId");

        Object.entries(boxBorders).forEach(async (page: any) => {

            let arr = page[1] as IPageInfo[];
            let bStartY = arr[0].borderStartY;
            let bEndY = arr[arr.length - 1].borderEndY;

            if (arr[0].isNewPage) {
                doc.addPage();
            }

            // doc.setFillColor(theme.palette.background.highlight);
            if (!arr[0].isNoBackground) {

                doc.setFillColor(arr[0].bgColor ?? "#EAEAEA");
                doc.setDrawColor(arr[0].bgColor ?? "#EAEAEA");
                doc.roundedRect(arr[0].borderStartX, bStartY, arr[0].borderWidth, bEndY - bStartY,
                    8, 8,
                    'FD');
            }

            arr.forEach(async line => {
                doc.setFontSize(line.style.fontSize);
                this.setFont(line.style.style);
                doc.setTextColor(line.style.color)

                // doc.text(line.text, line.textStartX + (line.style.align === "right" ? this.pageSettings.borderedXPadding: 0), line.textStartY, {
                doc.text(line.text, line.textStartX, line.textStartY, {
                    maxWidth: line.textContainerWidth,
                    align: line.style.align, // line.style.align || (line.isRtl ? "right" : "left"),
                    isOutputRtl: line.isRtl,
                    isInputRtl: false,
                })

                if (line.icon) {
                    // url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT09ZQ63_ELLO78MDZ0WE3nEJxEfnqTf6trUQ&usqp=CAU";
                    const lb = line.icon;

                    /*** CORS issue when attempting to addImage() directly using URL which are in cross-domain
                     * solution: uses NextAPI  /api/images?url=<> which loads the image from URL and returns a base64 encoded image string
                    */
                    if (lb.iconUrl.startsWith("http")) {
                        doc.addImage(
                            sampleBase64Image(),
                            // icons[lb.iconUrl] || sampleBase64Image(),
                            "jpeg", //jpeg bcoz images are base64
                            lb.startX,
                            lb.startY,
                            lb.w,
                            lb.h
                        )
                    }
                    else {
                        doc.addImage(
                            lb.iconUrl,
                            lb.type,
                            lb.startX,
                            lb.startY,
                            lb.w,
                            lb.h
                        )
                    }
                }
            })
        });
    }

    async prepareDownload(filename: string, response: any) {
        // const blobUrl = doc.output('bloburl');
        // window.open(blobUrl, '_system', 'location=yes');

        const pdfData = this.doc.output('arraybuffer');
        response.appendHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
        response.appendHeader('Content-Type', 'application/pdf');
        response.setBody(Buffer.from(pdfData));
        return response;
        // callback(null, response);
    }

    async saveBlob() {
        const blobUrl = this.doc.output('bloburl');
        window.open(blobUrl, '_system', 'location=yes');
    }

    getDoc() {
        return this.doc;
    }
}
