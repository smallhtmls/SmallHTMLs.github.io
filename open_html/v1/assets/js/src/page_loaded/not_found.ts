const status_e = document.getElementById("status")!;
const params = new URLSearchParams(window.location.search);

const status = params.get("status");

if (status) {
    status_e.innerText = status;
} else {
    status_e.innerText = "ERR_NOT_FOUND";
}
