import jsPDF, { TextOptionsLight } from "jspdf";

export const computeDimension = (doc: jsPDF, sz: string) => {
    let w = doc.internal.pageSize.width;
    let fstyle: TextOptionsLight = { maxWidth: doc.internal.pageSize.width }
    let dim = doc.getTextDimensions(sz, fstyle);
    return { width: w, textDim: dim, centeredStart: (w / 2) - (dim.w / 2) }
}

export const sampleBase64Image = () => {
    let img64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII";
    return img64;
}

export const isRtl = (dir: string | undefined) => {
    return dir === "rtl"
}

export const groupBy = function (xs: any[], key: string) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}

// DATE_FORMAT: 'lll',

export const makeid = (length: number) => {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
