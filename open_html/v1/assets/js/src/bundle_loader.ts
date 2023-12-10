import * as zip from "@zip.js/zip.js";
import * as css_lib from "css";

import { version } from "./constants";

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
class Path extends String {
    cd(path: string): Path {
        let inDirectory = this.endsWith("/");
        const pathParts = path.split("/");
        const cdPath = path.split("/");

        if (inDirectory) {
            // Remove the last empty string
            cdPath.pop();
        }

        let newPath: string[] = [];

        if (cdPath[0] != "") {
            newPath = this.split("/");
        }

        for (const part of pathParts) {
            if (part === ".." && newPath.length > 0) {
                newPath.pop();
            } else if (part === ".") {
                inDirectory = true;
            } else {
                if (!inDirectory) {
                    newPath.pop();
                }

                newPath.push(part);

                inDirectory = true;
            }
        }

        const newPathStr = newPath.join("/");

        if (path.endsWith("/")) {
            return new Path(newPathStr + "/");
        }

        return new Path(newPathStr);
    }
}
const importStatement = "import";
async function replaceJSRefs(
    txt: string,
    entries: zip.Entry[],
    path: Path
): Promise<string> {
    for (let i = 0; i < txt.length; ++i) {
        // If txt[i] == "i" it could be import
        console.log(txt.at(i));
        if (txt.at(i) == "i") {
            // string of length is import
            const x = txt.substring(i, importStatement.length + i);
            console.warn(x);
            // is import
            if (x == importStatement) {
                // find Path String
                let currEndChar;
                while (i < txt.length) {
                    i++;
                    if (
                        txt.at(i) == '"' ||
                        txt.at(i) == "'" ||
                        txt.at(i) == "`"
                    ) {
                        currEndChar = txt.at(i);
                        break;
                    }
                }
                // Get URL String
                let j = i;
                while (j < txt.length) {
                    j++;
                    if (
                        currEndChar == txt.at(j) &&
                        (txt.at(j - 1) != "\\" ? txt.at(j - 2) == "\\" : false)
                    ) {
                        console.log(txt.substring(i, j));
                        break;
                    }
                }
            }
        }
    }

    return txt;
}

async function replaceJSFile(
    blob: Blob,
    path: Path,
    entries: zip.Entry[]
): Promise<Blob> {
    const res: Blob = await new Promise((reject, resolve) => {
        let fr = new FileReader();
        fr.onload = async (e: ProgressEvent<FileReader>) => {
            let txt = e.target!.result;
            txt = await replaceJSRefs(txt as string, entries, path);
            const rt = new Blob([txt as BlobPart], {
                type: "text/javascript",
            });
            resolve(rt);
        };
        fr.onerror = (e) => {
            reject(new Blob([]));
        };
        fr.readAsText(blob);
    });
    return res;
}

async function replaceHTMLFile(
    blob: Blob,
    path: Path,
    entries: zip.Entry[]
): Promise<Blob> {
    const res: Blob = await new Promise((reject, resolve) => {
        let fr = new FileReader();
        fr.onload = async (e: ProgressEvent<FileReader>) => {
            let txt = e.target!.result;
            txt = await replaceRefs(txt as string, entries, "/");
            const rt = new Blob([txt as BlobPart], {
                type: "text/html",
            });
            resolve(rt);
        };
        fr.onerror = (e) => {
            reject(new Blob([]));
        };
        fr.readAsText(blob);
    });
    return res;
}

let splitURL = window.location.pathname;
if (splitURL.endsWith("/")) {
    splitURL = splitURL.substring(0, splitURL.length - 1);
}
console.log(splitURL);
function resolveURL(
    txt: string,
    entries: zip.Entry[],
    path: Path
): Promise<string> {
    return new Promise(async (resolve, reject) => {
        let txtArr = txt.split(splitURL);
        if (txtArr.length == 1) {
            txt = txtArr[0];
        } else {
            txt = txtArr[1];
        }
        const filePath = path.cd(txt);
        console.log(filePath);
        let file = entries.find((a) => {
            const b = "/" + a.filename;
            return b == filePath.toString();
        });
        let currBlob = await file!.getData!(new zip.BlobWriter());
        if (
            filePath.endsWith(".js") /* ||
            filePath.endsWith(".ts") ||
            filePath.endsWith(".jsx") ||
            filePath.endsWith(".tsx") */
        ) {
            currBlob = await replaceJSFile(currBlob, filePath, entries);
        } else if (filePath.endsWith(".css")) {
            console.log("CSS");
            currBlob = await parse_css(currBlob, filePath, entries);
        } else if (filePath.endsWith(".html")) {
            currBlob = await replaceHTMLFile(currBlob, filePath, entries);
        }
        return URL.createObjectURL(currBlob);
        /*let fr = new FileReader();
        fr.onload = async (e: ProgressEvent<FileReader>) => {
            resolve(e.target!.result as string);
        };
        fr.onerror = reject;
        fr.readAsText(currBlob);*/
    });
}
async function replaceRefs(
    txt: string,
    entries: zip.Entry[],
    path: string = "."
): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(txt, "text/html");
    for (const [tagName, property] of Object.entries(linkPropertyTable)) {
        const queriedElements = doc.getElementsByTagName(tagName);
        for (const element of queriedElements) {
            if (element.hasAttribute(property)) {
                //@ts-ignore
                element[property] = await resolveURL(
                    //@ts-ignore
                    element[property],
                    entries,
                    new Path(path)
                );
            }
        }
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
}

export async function load_bundle(
    bundle: File
): Promise<BundleLoadResult | null> {
    const zip_reader = new zip.ZipReader(new zip.BlobReader(bundle));
    const entries = await zip_reader.getEntries();

    let entrypoint = "index.html";
    let allowDevtools = true;
    let mismatchedVersion = true;

    const metaFile = entries.find((entry) => entry.filename === "meta.json")!;
    if (metaFile) {
        const meta = JSON.parse(await metaFile.getData!(new zip.TextWriter()));

        if (meta.entrypoint) {
            entrypoint = meta.entrypoint;
        }

        if (meta.allowDevtools === false) {
            allowDevtools = false;
        }

        if (meta.version === version) {
            mismatchedVersion = false;
        }
    }

    const entrypointFile = entries.find(
        (entry) => entry.filename === entrypoint
    )!;
    if (!entrypointFile) {
        alert("The bundle does not contain an entrypoint file.");
        return null;
    }
    const entrypointDataUrl = await entrypointFile.getData!(
        new zip.BlobWriter("text/html")
    );

    const res: Blob = await new Promise((reject, resolve) => {
        let fr = new FileReader();
        fr.onload = async (e: ProgressEvent<FileReader>) => {
            let txt = e.target!.result;
            txt = await replaceRefs(txt as string, entries, "/");
            const rt = new Blob([txt as BlobPart], {
                type: "text/html",
            });
            resolve(rt);
        };
        fr.onerror = (e) => {
            reject(new Blob([]));
        };
        fr.readAsText(entrypointDataUrl);
    });
    const uri = URL.createObjectURL(res);
    return {
        entrypoint: uri,
        allowDevtools,
        mismatchedVersion,
    };
}

export function parse_css(
    css: Blob,
    path: Path,
    entries: zip.Entry[]
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = async (e: ProgressEvent<FileReader>) => {
            let css_parsed = css_lib.parse(e.target!.result as string);

            console.log(css_parsed);

            // Iterate over every url() in the CSS file and replace it with the resolved URL
            for (const rule of css_parsed.stylesheet!.rules) {
                if (rule.type == "import") {
                    const url = rule.import!;
                    if (!url.startsWith("url(")) continue;

                    // Remove the url() wrapper
                    const pure_url = url.substring(4, url.length - 1);
                    const resolvedURL = await resolveURL(
                        pure_url,
                        entries,
                        path
                    );
                    rule.import = resolvedURL;
                }
            }

            console.error(css_lib.stringify(css_parsed));
            resolve(
                new Blob([css_lib.stringify(css_parsed)], { type: "text/css" })
            );
        };
        fr.onerror = reject;

        fr.readAsText(css);
    });
}
