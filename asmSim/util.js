export function setURIParams(params) {
    let arr = [];
    for (let o in params) {
        arr.push(o + "=" + encodeURIComponent(params[o]));
    }
    let str = "?" + arr.join("&");
    history.pushState({ asmSim: 1 }, "", str);
}
export function getURIParams() {
    let params_as = window.location.search.substring(1).split("&");
    let params_m = {};
    for (const param_s of params_as) {
        const sign_i = param_s.indexOf("=");
        const key_s = param_s.substring(0, sign_i);
        const value_s = param_s.substring(sign_i + 1);
        if (key_s.length === 0) continue;
        params_m[key_s] = decodeURIComponent(value_s);
    }
    return params_m;
}
export function setStyle(text_color, background_color, theme) {
    document.documentElement.style.setProperty("--text-color", text_color);
    document.documentElement.style.setProperty("--background-color", background_color);
    monaco.editor.setTheme(theme);
}
export function download(filename, text) {
    //https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
export function setContextMenu(x, y, options) {
    let d = document.createElement("div");
    d.style.top = y + "px";
    d.style.left = x + "px";
    d.classList.add("contextMenu");
    for (let o in options) {
        const clb = options[o];
        let option = document.createElement("div");
        option.classList.add("contextMenuItem");
        option.addEventListener(o[0] === "C" ? "click" : "mouseenter", e => {
            clb(e, d);
        });
        option.innerText = o.substring(1);
        d.appendChild(option);
    }
    document.body.prepend(d);
    return d;
}

export function encodeUnit(nmb) {
    nmb = Math.floor(nmb);
    if (nmb >= 1000) {
        let n = nmb / 1000;
        n = n.toPrecision(2);
        return n.toString() + "k";
    }
    return nmb.toString();
}
export function decodeUnit(str) {
    let multiply = 1;
    if (str[str.length - 1].toLowerCase() === "k") {
        multiply = 1000;
        str = str.substring(0, str.length - 1);
    }
    console.log(str);
    return parseFloat(str) * multiply;
}
export function isIn(val_i, bitMode_i) {
    return val_i >= -bitMode_i / 2n && val_i <= bitMode_i / 2n;
}
export function setClassVisible(cls, v) {
    for (let e of Array.from(document.body.getElementsByClassName(cls))) {
        if (!v) {
            e.style.fill = "transparent";
            e.style.stroke = "transparent";
        } else {
            e.style.fill = "";
            e.style.stroke = "";
        }
    }
}
export function printBin(stream, numb_i, padding = 0) {
    let zeros_s = numb_i.toString(2).padStart(padding, "0");

    zeros_s = zeros_s.match(/.{1,8}/g).join(" ");
    stream(zeros_s, numb_i);
}
