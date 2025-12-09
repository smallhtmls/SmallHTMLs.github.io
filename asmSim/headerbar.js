import { examples, loadEditorType } from "./display.js";
import {
    ASSEMBLE_SELECT_E,
    CHECKBOX_BASEPOINTER,
    CHECKBOX_BX_REGISTER,
    CHECKBOX_MOBILE_MODE_E,
    CHECKBOX_STACKPOINTER,
    DARK_MODE_TOGGLE_E,
    MAIN_E,
    MENU_URL_BUTTON_E,
} from "./elements.js";
import { OPTIONS } from "./options.js";
import { setClassVisible, setContextMenu, setStyle } from "./util.js";
function updateStyle(darkMode) {
    OPTIONS.setDarkMode(darkMode);
    if (!darkMode) {
        DARK_MODE_TOGGLE_E.setAttribute("checked", "false");
        // LIGHT MODE
        setStyle("black", "white", "vs-light");
    } else {
        // DARK MODE
        DARK_MODE_TOGGLE_E.setAttribute("checked", "true");
        setStyle("white", "#222225", "vs-dark");
    }
}

DARK_MODE_TOGGLE_E.onclick = () => {
    updateStyle(DARK_MODE_TOGGLE_E.getAttribute("checked") !== "true");
};

function updateSP(sp) {
    OPTIONS.setSP(sp);
    setClassVisible("stackp", OPTIONS.hasSP());
    if (!sp) {
        CHECKBOX_STACKPOINTER.setAttribute("checked", "false");
    } else {
        CHECKBOX_STACKPOINTER.setAttribute("checked", "true");
    }
}

function updateBP(sp) {
    OPTIONS.setBP(sp);

    setClassVisible("stackbasep", OPTIONS.hasBP());
    if (!sp) {
        CHECKBOX_BASEPOINTER.setAttribute("checked", "false");
    } else {
        CHECKBOX_BASEPOINTER.setAttribute("checked", "true");
    }
}
function updateBX(sp) {
    OPTIONS.setBX(sp);
    setClassVisible("bxRegister", OPTIONS.hasBX());
    if (!sp) {
        CHECKBOX_BX_REGISTER.setAttribute("checked", "false");
    } else {
        CHECKBOX_BX_REGISTER.setAttribute("checked", "true");
    }
}

CHECKBOX_STACKPOINTER.onclick = () => {
    updateSP(CHECKBOX_STACKPOINTER.getAttribute("checked") !== "true");
};
CHECKBOX_BASEPOINTER.onclick = () => {
    updateBP(CHECKBOX_BASEPOINTER.getAttribute("checked") !== "true");
};
CHECKBOX_BX_REGISTER.onclick = () => {
    updateBX(CHECKBOX_BX_REGISTER.getAttribute("checked") !== "true");
};

function closeContextMenu(e) {}

export function postInitHeader() {
    updateStyle(OPTIONS.getDarkMode());
    updateSP(OPTIONS.hasSP());
    updateBP(OPTIONS.hasBP());
    updateBX(OPTIONS.hasBX());
    updateMobile(OPTIONS.getMobileMode());
    ASSEMBLE_SELECT_E.value = OPTIONS.getLang();
    loadEditorType(OPTIONS.getLang());
}

export function updateMobile(mobileMode) {
    OPTIONS.setLegacyMobile(mobileMode);
    if (OPTIONS.getMobileMode() === "legacy") {
        CHECKBOX_MOBILE_MODE_E.setAttribute("checked", "true");
        if (MAIN_E.firstElementChild.id === "cpu") {
            const items = Array.from(MAIN_E.children);
            items.reverse().forEach((item) => MAIN_E.appendChild(item));
        }
    } else {
        CHECKBOX_MOBILE_MODE_E.setAttribute("checked", "false");
        if (MAIN_E.firstElementChild.id !== "cpu") {
            const items = Array.from(MAIN_E.children);
            items.reverse().forEach((item) => MAIN_E.appendChild(item));
        }
    }
}
CHECKBOX_MOBILE_MODE_E.onclick = () => {
    updateMobile(CHECKBOX_MOBILE_MODE_E.getAttribute("checked") !== "true");
};
