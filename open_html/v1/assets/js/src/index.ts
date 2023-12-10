import { load_bundle } from "./bundle_loader";

const file_input_e = document.getElementById("fileinput")! as HTMLInputElement;
const iframe1 = document.getElementById("iframe1")! as HTMLIFrameElement;
function change() {
    var files = file_input_e.files!;

    if (files.length === 0) {
        return;
    }
    if (files.length >= 2) {
        return;
    }

    var file = files[0];
    console.log(file);

    if (file.name.endsWith(".htpkg") || file.name.endsWith(".htpk")) {
        console.log("Loading bundle");
        load_bundle(file).then((bundle) => {
            if (bundle === null) {
                return;
            }

            if (bundle.mismatchedVersion) {
                alert(
                    "The bundle was built with a different version of open_html. This may cause unexpected behavior."
                );
            }

            console.log("Loading bundle entrypoint", bundle.entrypoint);
            iframe1.src = bundle.entrypoint;
        });
        return;
    }

    iframe1.src = URL.createObjectURL(file);
}
file_input_e.onchange = change;
