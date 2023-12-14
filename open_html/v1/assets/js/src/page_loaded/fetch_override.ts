import { CursedFiles } from "../bundle_loader";

const _fetch = window.fetch;

const files: CursedFiles = window.top!.currFiles;

window.fetch = (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
    if (typeof input === "string" && !input.startsWith("http")) {
        const file = files[input];

        if (file) {
            return _fetch(file, init);
        } else {
            return new Promise(resolve => {
                resolve(new Response("Not found\nOpen HTML / v1", { status: 404 }));
            });
        }
    }

    return _fetch(input, init);
};
