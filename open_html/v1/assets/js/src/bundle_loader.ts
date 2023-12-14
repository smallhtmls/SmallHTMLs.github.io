import * as zip from "@zip.js/zip.js";
import * as css_lib from "css";

import { version } from "./constants";
import { file } from "bun";

const LIMIT_OF_THE_SAME_FILE = 30;

interface BundleLoadResult {
    entrypoint: string;
    allowDevtools: boolean;
    mismatchedVersion: boolean;
}

const linkPropertyTable = {
    link: "href",
    img: "src",
    script: "src",
    iframe: "src",
    a: "href",
    audio: "src",
    video: "src",
};

declare global {
    interface Window {
        currFiles: CursedFiles;
        updateWindowTitle: (title: string) => void;
    }
}

function getSplitRoot(href: string): string[] {
    let rt = href.split("/");
    rt.pop();
    return rt;
}
let splitURL = window.location.href;
let splitRoot = getSplitRoot(splitURL);
if (splitURL.endsWith("/")) {
    splitURL = splitURL.substring(0, splitURL.length - 1);
} else if (splitURL.endsWith(".html")) {
    const splitedURL = splitURL.split("/");
    splitedURL.pop();
    splitURL = splitedURL.join("/");
}

class Path extends String {
    cd(dist: string): Path {
        const isDir = this.endsWith("/");
        const distIsDir = dist.endsWith("/");
        let distArr: string[] = [];
        if (dist.startsWith("/")) {
            distArr = dist.split("/");
        } else {
            let srcArr = this.split("/");
            if (!isDir) {
                srcArr.pop();
                console.log("POP!", srcArr);
            }
            distArr = srcArr.concat(dist.split("/"));
        }
        console.log(distArr);
        for (let i = 0; i < distArr.length; i++) {
            if (distArr[i] == ".") {
                distArr.splice(i, 1);
                i--;
            }
            if (distArr[i] == "..") {
                if (i - 1 < 0) alert("I is to low!");
                distArr.splice(i - 1, 2);
                i -= 2;
            }
            if (distArr[i] == "" && !(i == 0 || i == distArr.length - 1)) {
                distArr.splice(i, 1);
                i--;
            }
        }

        return new Path(distArr.join("/"));
    }
    addAbsolute(url: string): Path {
        let a = url.split("/");
        let rUrl: string[] = [];
        if (a[3] == splitRoot[3]) {
            for (let i = 0; i < a.length; i++) {
                if (splitRoot.length <= i) {
                    rUrl.push(a[i]);
                    continue;
                }
                if (a[i] != splitRoot[i]) {
                    rUrl.unshift("..");
                    rUrl.push(a[i]);
                }
            }
            console.warn(a, splitRoot, rUrl, rUrl.join("/"));
            return this.cd(rUrl.join("/"));
        } else if (a[0] == splitRoot[0]) {
            a.splice(0, 3);
            a.unshift("");
        }
        return this.cd(a.join("/"));
    }
}
export interface CursedFiles {
    [key: string]: string | undefined;
}
let cursedFiles: CursedFiles = {};
const importStatement = "import";
async function replaceJSRefs(txt: string, entries: zip.Entry[], path: Path): Promise<string> {
    //Jump Comments
    for (let i = 0; i < txt.length; ++i) {
        if (txt.at(i) == "/" && txt.at(i + 1) == "/")
            while (i < txt.length) {
                i++;
                if (txt.at(i) == "\n") break;
            }
        if (txt.at(i) == "/" && txt.at(i + 1) == "*")
            while (i < txt.length) {
                i++;
                if (txt.at(i - 1) == "*" && txt.at(i) == "/") break;
            }
        //Jump Strings
        if (txt.at(i) == '"' || txt.at(i) == "'" || txt.at(i) == "`") {
            let strEnd = "";
            strEnd = txt.at(i)!;
            while (i < txt.length) {
                i++;
                if (txt.at(i) == strEnd && (txt.at(i - 1) == "\\" ? txt.at(i - 2) == "\\" : true)) break;
            }
        }
        // If txt[i] == "i" it could be import + Later @ support!
        if (txt.at(i) == "i" /*|| txt.at(i) == "@"*/) {
            // string of length is import
            const x = txt.substring(i, importStatement.length + i);
            // is import
            if (x === importStatement || txt.at(i) == "@") {
                let atI = i;
                let isAt = txt.at(i) == "@";
                // find Path String
                let currEndChar;
                while (i < txt.length) {
                    i++;
                    if (txt.at(i) == '"' || txt.at(i) == "'" || txt.at(i) == "`") {
                        currEndChar = txt.at(i);
                        break;
                    }
                }
                // Get URL String
                let j = i;
                while (j < txt.length) {
                    j++;
                    if (currEndChar === txt.at(j) && (txt.at(j - 1) == "\\" ? txt.at(j - 2) == "\\" : true)) {
                        const curl = txt.slice(i + 1, j);

                        const nwurl = await resolveURL(curl, entries, path);
                        if (isAt) {
                            txt = txt.slice(0, atI) + txt.slice(atI + 1);
                        }
                        // Insert string at Position
                        txt = txt.slice(0, i + 1) + nwurl + txt.slice(j);
                        i = i + nwurl.length;
                        break;
                    }
                }
            }
        }
    }

    return txt;
}

async function replaceJSFile(blob: Blob, path: Path, entries: zip.Entry[]): Promise<Blob> {
    const res: Blob = await new Promise((resolve, reject) => {
        let fr = new FileReader();
        fr.onload = async (e: ProgressEvent<FileReader>) => {
            let txt = e.target!.result;
            txt = await replaceJSRefs(txt as string, entries, path);
            const rt = new Blob([txt as BlobPart], {
                type: "text/javascript",
            });
            resolve(rt);
        };
        fr.onerror = e => {
            reject(new Blob([]));
        };
        fr.readAsText(blob);
    });
    return res;
}

async function replaceHTMLFile(blob: Blob, path: Path, entries: zip.Entry[]): Promise<Blob> {
    const res: Blob = await new Promise((resolve, reject) => {
        let fr = new FileReader();
        fr.onload = async (e: ProgressEvent<FileReader>) => {
            let txt = e.target!.result;
            txt = await replaceRefs(txt as string, entries, path);
            const rt = new Blob([txt as BlobPart], {
                type: "text/html",
            });
            resolve(rt);
        };
        fr.onerror = e => {
            console.error("replaceHTMLFile", e);
            reject(new Blob([]));
        };
        fr.readAsText(blob);
    });
    return res;
}

function resolveURL(txt: string, entries: zip.Entry[], path: Path): Promise<string> {
    return new Promise(async (resolve, reject) => {
        //absolute Path
        const filePath = path.addAbsolute(txt);
        //\ absolute Path
        let file = entries.find(a => {
            const b = "/" + a.filename;
            return b == filePath.toString();
        });
        if (!(cursedFiles[filePath.toString()] === undefined)) {
            resolve(cursedFiles[filePath.toString()]!);
            return;
        }
        cursedFiles[filePath.toString()] = "";
        console.warn(file, filePath.toString());
        if (file == undefined) {
            console.error("File Undef");
            alert("Some error occurred!");
        }
        let currBlob = await file!.getData!(new zip.BlobWriter());
        if (filePath.endsWith(".js")) {
            currBlob = await replaceJSFile(currBlob, filePath, entries);
        } else if (filePath.endsWith(".css")) {
            currBlob = await parse_css(currBlob, filePath, entries);
        } else if (filePath.endsWith(".html")) {
            currBlob = await replaceHTMLFile(currBlob, filePath, entries);
        }
        const rt = URL.createObjectURL(currBlob);
        cursedFiles[filePath.toString()] = rt;

        resolve(rt);
    });
}
function getRedirectURL(siteTRedirectTo: string): string {
    console.log(splitURL);
    return splitURL + "/redirect.html?url=" + encodeURIComponent(siteTRedirectTo);
}
async function replaceRefs(txt: string, entries: zip.Entry[], path: Path = new Path(".")): Promise<string> {
    console.log(path, txt);
    const parser = new DOMParser();
    const doc = parser.parseFromString(txt, "text/html");

    for (const [tagName, property] of Object.entries(linkPropertyTable)) {
        const queriedElements = doc.getElementsByTagName(tagName);
        for (const element of queriedElements as HTMLCollectionOf<HTMLElement>) {
            if (element.hasAttribute(property)) {
                let txt = element.getAttribute(property)!;
                //@ts-ignore
                element[property] = await resolveURL(
                    //@ts-ignore
                    element[property],
                    entries,
                    path
                );
                if (tagName == "a") {
                    const filePath = path.addAbsolute(txt);
                    console.log("addAbsolute...", filePath, path, txt);
                    element.setAttribute(property, getRedirectURL(filePath.toString()));
                }
            }
        }
    }

    /* -------------------------------- Overrides ------------------------------- */
    const overrideWrapper = doc.createElement("div");
    overrideWrapper.style.display = "none";
    overrideWrapper.id = "smallhtmls-openhtml-overrideWrapper";
    ["fetch", "title"].forEach(id => {
        const script = doc.createElement("script");
        script.src = window.origin + "/assets/js/dist/open_html/v1/page_loaded/" + id + "_override.js";
        script.type = "module";
        overrideWrapper.appendChild(script);
    });
    doc.body.appendChild(overrideWrapper);
    /* -------------------------------------------------------------------------- */

    const serializer = new XMLSerializer();
    const rt = serializer.serializeToString(doc);
    return rt;
}

export async function load_bundle(bundle: File): Promise<BundleLoadResult | null> {
    console.info("Loading bundle...");
    const zip_reader = new zip.ZipReader(new zip.BlobReader(bundle));
    const entries = await zip_reader.getEntries();

    let entrypoint = "index.html";
    let allowDevtools = true;
    let mismatchedVersion = true;

    const metaFile = entries.find(entry => entry.filename === "meta.json")!;
    if (metaFile) {
        console.debug("Parsing meta.json file...");
        const meta = JSON.parse(await metaFile.getData!(new zip.TextWriter()));

        if (meta.entrypoint) {
            entrypoint = meta.entrypoint;
        }

        if (meta.allowDevtools === false) {
            console.debug("Devtools are disabled.");
            allowDevtools = false;
        }

        if (meta.version === version) {
            mismatchedVersion = false;
        } else {
            console.debug("The bundle was built with a different version of open_html.");
        }
    } else {
        console.debug("The bundle does not contain a meta.json file.");
    }

    const entrypointFile = entries.find(entry => entry.filename === entrypoint)!;
    if (!entrypointFile) {
        console.error("The bundle does not contain the entrypoint file.");
        alert("The bundle does not contain the entrypoint file.");

        return null;
    }
    const entrypointDataUrl = await entrypointFile.getData!(new zip.BlobWriter("text/html"));

    const res: Blob = await new Promise((resolve, reject) => {
        let fr = new FileReader();
        fr.onload = async (e: ProgressEvent<FileReader>) => {
            let txt = e.target!.result;
            txt = await replaceRefs(txt as string, entries, new Path("/"));
            const rt = new Blob([txt as BlobPart], {
                type: "text/html",
            });

            console.debug("Bundle loaded.");
            console.timeEnd("parseBundle");
            window.currFiles = cursedFiles;
            resolve(rt);
        };
        fr.onerror = e => {
            console.error("Error parsing bundle", e);
            reject(new Blob([]));
        };

        console.debug("Loading bundle...");
        console.time("parseBundle");
        fr.readAsText(entrypointDataUrl);
    });

    const uri = URL.createObjectURL(res);

    return {
        entrypoint: uri,
        allowDevtools,
        mismatchedVersion,
    };
}

export function parse_css(css: Blob, path: Path, entries: zip.Entry[]): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = async (e: ProgressEvent<FileReader>) => {
            let css_parsed = css_lib.parse(e.target!.result as string);

            // Iterate over every url() in the CSS file and replace it with the resolved URL
            for (const rule of css_parsed.stylesheet!.rules) {
                if (rule.type == "import") {
                    // @ts-ignore
                    const url = rule.import!;
                    if (!url.startsWith("url(")) continue;

                    // Remove the url() wrapper
                    let pure_url = url.substring(4, url.length - 1);
                    // Remove the quotes if they exist
                    if (pure_url.startsWith('"') || pure_url.startsWith("'")) {
                        pure_url = pure_url.substring(1, pure_url.length - 1);
                    }

                    const resolvedURL = await resolveURL(pure_url, entries, path);

                    // @ts-ignore
                    rule.import = 'url("' + resolvedURL + '")';
                }
            }

            resolve(new Blob([css_lib.stringify(css_parsed)], { type: "text/css" }));
        };
        fr.onerror = reject;

        fr.readAsText(css);
    });
}
