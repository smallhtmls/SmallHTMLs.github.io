const SVG_NS = "http://www.w3.org/2000/svg";
const FAC_LOG2_10 = Math.log(2) / Math.log(10);

function getStringInt16(num_i) {
    // Mask the lowest 16 bits
    console.log(num_i);
    const bits16 = Number(num_i & 0xffffn);

    // Interpret as signed 16-bit integer
    const signed = bits16 & 0x8000 ? bits16 - 0x10000 : bits16;

    return signed.toString();
}
function int16StringToBigint(str) {
    const num = BigInt(str);
    console.log("Cnv", str, num);
    if (num < -32768n || num > 32767n) {
        throw new RangeError("Value out of 16-bit signed integer range");
    }
    // Convert to unsigned 16-bit representation
    const bits16 = num < 0n ? num + 0x10000n : num;
    return bits16;
}

function setDataBus(padding_i, nmb_i) {
    let zeros_s = nmb_i.toString(2).padStart(Number(padding_i), "0");

    zeros_s = zeros_s.match(/.{1,8}/g).join(" ");
    zeros_s = zeros_s.split(" ");
    DATA_BUS_BIT_E.innerHTML = "";
    //
    for (let i = 0; i < zeros_s.length; i++) {
        const span = document.createElementNS(SVG_NS, "tspan");
        const zeros0_s = zeros_s[i];
        const zeros1_s = zeros_s[++i];
        span.innerHTML = zeros0_s + " " + (zeros1_s ? zeros1_s : "");
        span.setAttribute("x", "490");
        span.setAttribute("dy", "25px");
        DATA_BUS_BIT_E.appendChild(span);
    }
    DATA_BUS_NUMBER_E[0].innerHTML = getStringInt16(nmb_i);
    DATA_BUS_NUMBER_E[1].innerHTML = "0x" + nmb_i.toString(16);
}
function setAddressBus(addr_n) {
    ADDRESS_BUS_STATE_E.innerHTML = addr_n;
}
function setControlBus(state, bitMode) {
    switch (state) {
        case STATE_WRITE:
            CONTROL_BUS_STATE_E.innerHTML = "WRITE - SCHREIBEN";
            break;
        case STATE_READ:
            CONTROL_BUS_STATE_E.innerHTML = "READ - LESEN";
            break;
    }
}
function setAccuDisplay(accu_i) {
    ACCUMULATOR_TEXT_E.innerHTML = getStringInt16(accu_i);
}
function setInstructionDisplay(id_i__name_s) {
    INSTRUCTION_ID_E.innerHTML =
        id_i__name_s.constructor.name == "BigInt"
            ? getStringInt16(id_i__name_s)
            : id_i__name_s;
}
function setInstructionData(data_i) {
    INSTRUCTION_DATA_E.innerHTML = getStringInt16(data_i);
}
let lastRamTable;
let ntoDisplay_n;
function renderRamTable(
    renderMode = 8n,
    ramsize = 5000n,
    getCell_f,
    writeIfAllowed_f
) {
    const chess_count = ramsize / (renderMode / 8n);
    ntoDisplay_n = Math.ceil(FAC_LOG2_10 * Number(renderMode));
    const table_e = document.createElement("table");
    table_e.appendChild(document.createElement("tr"));
    for (let i = -1; i < 10; i++) {
        const td = document.createElement("td");
        td.innerText = i == -1 ? "" : "X" + i;
        table_e.lastElementChild.appendChild(td);
    }
    for (let i = 0; i < chess_count; i++) {
        if (i % 10 == 0) {
            table_e.appendChild(document.createElement("tr"));
            const td_e = document.createElement("td");
            td_e.innerText = i / 10 + "X";
            table_e.lastElementChild.appendChild(td_e);
        }
        const obj_e = document.createElement("td");
        obj_e.onclick = (e) => {
            let str = prompt("Enter new Value!");
            if (!str) return;
            let int_i = int16StringToBigint(str);
            console.log(int_i);
            let objects = writeIfAllowed_f(i, int_i);
            updateRamRender(objects, 0);
        };
        const cellData_i = getCell_f(i, renderMode / 8n);
        obj_e.innerText = getStringInt16(cellData_i).padStart(
            ntoDisplay_n,
            "0"
        );
        if (cellData_i != 0n) obj_e.classList.add("valueInCell");
        table_e.lastElementChild.appendChild(obj_e);
    }
    if (lastRamTable) lastRamTable.remove();
    lastRamTable = table_e;
    table_e.id = "ramTable";
    STORAGE_E.appendChild(table_e);
}
function updateMem() {
    let a = BIT_MODE_SELECTOR_E.value;
    let val =
        a == "8"
            ? BIT_MODE_8
            : a == "16"
            ? BIT_MODE_16
            : a === "32"
            ? BIT_MODE_32
            : a == "64"
            ? BIT_MODE_64
            : BIT_MODE_8;
    Memory.setBitMode(val);
}
function blinkAssemble() {
    ASSEMBLE_BUTTON_E.style.borderColor = "#ff5400";
    ASSEMBLE_BUTTON_E.style.color = "#ff5400";
    setTimeout(() => {
        ASSEMBLE_BUTTON_E.style.borderColor = "";
        ASSEMBLE_BUTTON_E.style.color = "";
    }, 500);
}
function updateRamRender(objects, source) {
    if (!lastRamTable) return;
    for (let q in objects) {
        const id = Number(q);
        const element_e =
            lastRamTable.children[Math.floor(id / 10) + 1].children[
                (id % 10) + 1
            ];
        element_e.innerText = getStringInt16(objects[q]).padStart(
            ntoDisplay_n,
            "0"
        );
        element_e.classList.add(source == 0 ? "userChanged" : "processChanged");
    }
}
function updateStatusRegister(zero_b, n_b, v_b, c_b) {
    STATUS_REGISTER_E.innerHTML =
        "Z:" +
        (zero_b ? "I" : "0") +
        " N:" +
        (n_b ? "I" : "0") +
        " V:" +
        (v_b ? "I" : "0") +
        " C:" +
        (c_b ? "I" : "0");
}
function download(filename, text) {
    //https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
    var element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
function getDTNow() {
    let date = new Date();
    return `${date.getFullYear()}${date
        .getMonth()
        .toString()
        .padStart(2, "0")}${date
        .getDate()
        .toString()
        .padStart(2, "0")}_${date.getHours()}${date.getMinutes()}`;
}
SAVE_FILE_BUTTON_E.onclick = () => {
    download("smallhtmls_" + getDTNow() + ".miniasm", editor.getValue());
};
LOAD_FILE_BUTTON_E.onchange = async () => {
    let file = LOAD_FILE_BUTTON_E.files[0];
    if (!file) return;
    editor.setValue(await file.text());
};
function setStyle(text_color, background_color, theme) {
    document.documentElement.style.setProperty("--text-color", text_color);
    document.documentElement.style.setProperty(
        "--background-color",
        background_color
    );
    monaco.editor.setTheme(theme);
}
DARK_MODE_TOGGLE_E.onclick = () => {
    if (DARK_MODE_TOGGLE_E.getAttribute("checked") === "true") {
        DARK_MODE_TOGGLE_E.setAttribute("checked", "false");
        // LIGHT MODE
        setStyle("black", "white", "vs-light");
    } else {
        // DARK MODE
        DARK_MODE_TOGGLE_E.setAttribute("checked", "true");
        setStyle("white", "#222225", "vs-dark");
    }
};
for (let key_s in MINIMASHINE_ASM_DECODE_TABLE_S) {
    const val = MINIMASHINE_ASM_DECODE_TABLE_S[key_s];
    const key_i = BigInt(key_s);
    const desc_s = CODE_DESCRIPTION_S[key_s];
    const line_e = document.createElement("tr");
    line_e.className = "strucTableInstrc";
    const key_e = document.createElement("td");
    const val_e = document.createElement("td");
    const desc_e = document.createElement("td");
    key_e.innerText = val;
    val_e.innerText =
        "0x" +
        key_i.toString(16).padStart(4, "0") +
        " | " +
        getStringInt16(key_i);
    desc_e.innerText = desc_s ? desc_s : "";
    line_e.appendChild(key_e);
    line_e.appendChild(val_e);
    line_e.appendChild(desc_e);
    STRUC_TABLE_BODY_E.appendChild(line_e);
}

Array.from(document.getElementsByClassName("fscButton")).forEach((e) => {
    e.onclick = () => {
        if (document.fullscreenElement == null) {
            e.parentElement.requestFullscreen();
            HEADER_E.style.display = "none";
        } else {
            document.exitFullscreen();
        }
    };
});
