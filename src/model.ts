export interface IPageSettings {
    defaultFontSize: number,
    yPadding: number,
    xPadding: number,
    borderedXPadding: number,
    borderedYPadding: number,
    lineVSpacing: number,
    lineHeightFactor: number
}

export interface IPageInfo {
    bgColor?: string,
    isNoBackground?: boolean,
    text: string,
    borderStartY: number,
    borderStartX: number,
    borderEndY: number,
    borderWidth: number,
    textStartX: number,
    textStartY: number,
    textContainerWidth: number,
    // start: number,
    rows: number,
    style: {
        fontSize: number,
        style?: string,
        align?: "right" | "left" | "center" | "justify" | undefined,
        color: string,
    },
    isNewPage: boolean,
    iconUrl?: string,
    pageId: string,
    isRtl: boolean,
    icon?: {
        iconUrl: string,
        type: string,
        startX: number,
        startY: number,
        w: number,
        h: number
    }
    // isLast: false
}

export interface IParagraph {
    textSz: string;
    style?: "bold" | undefined;
    fontSize2?: number;
    marginBottom?: number;
    marginTop?: number;
    color?: string,
    align?: "right" | "left" | "center" | "justify" | undefined;
}

export interface IContentResult {
    text: string;
    dim: { w: number, h: number },
    isNewPage: boolean;
    isNewPageAfter: boolean;
}