import { CursedFiles } from "../bundle_loader";

const params = new URLSearchParams(window.location.search);
const url = params.get("url");

const files: CursedFiles = window.top!.currFiles;

if (url == null) {
    console.warn("Url parameter 'url' is missing.");
    window.location.href = "not_found.html?status=INVALID_CALL";
} else if (url.startsWith("http")) {
    console.debug("Redirecting to external url: " + url);
    window.location.href = url;
} else {
    console.debug("Redirecting to internal url: " + url);
    const path = decodeURIComponent(url);
    const file = files[path];
    console.debug("Resolved redirect url: " + (file == undefined ? "FILE_NOT_FOUND" : file));

    if (file == undefined) window.location.href = "not_found.html?status=FILE_NOT_FOUND";
    else window.location.href = file;
}
