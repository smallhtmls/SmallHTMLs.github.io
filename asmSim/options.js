import { getURIParams, setURIParams } from "./util.js";
import { encodeUnit, decodeUnit } from "./util.js";
export class Options {
    static default = {
        darkMode: "false",
        lang: "mini-asm",
        memSize: "5k",
        regs: "",
        mobile: "",
    };
    /**
     * @type {string}
     */
    regs;
    constructor() {
        for (let key in Options.default) {
            this[key] = Options.default[key];
        }
        this.load();
    }
    load() {
        let a = getURIParams();
        for (let key in a) {
            this[key] = a[key];
        }
    }
    save() {
        let params_m = {};
        console.log(this, Options.default);
        for (const key in this) {
            if (this[key] === Options.default[key]) continue;
            params_m[key] = this[key];
        }
        setURIParams(params_m);
    }
    getDarkMode() {
        return this.darkMode === "true";
    }

    setDarkMode(val) {
        this.darkMode = val.toString();
        this.save();
    }
    setLang(lang) {
        this.lang = lang;
        this.save();
    }
    getLang() {
        return this.lang;
    }
    setMemSize(memSize) {
        this.memSize = encodeUnit(memSize);
    }
    getMemSize() {
        return BigInt(Math.floor(decodeUnit(this.memSize)));
    }
    setSP(has) {
        this._setReg("sp", has);
    }
    setBP(has) {
        this._setReg("bp", has);
    }
    setBX(has) {
        this._setReg("bx", has);
    }
    /**
     *
     * @param {string} reg
     * @param {boolean} has
     */
    _setReg(reg, has) {
        if (has && !this._hasReg(reg)) {
            this.regs += reg;
            this.save();
        }
        if (!has && this._hasReg(reg)) {
            this.regs = this.regs.replace(reg, "");
            this.save();
        }
    }
    setLegacyMobile(k) {
        this.mobile = k ? "legacy" : "";
        this.save();
    }
    getMobileMode() {
        return this.mobile;
    }
    _hasReg(reg) {
        return this.regs.indexOf(reg) !== -1;
    }
    hasSP() {
        return this._hasReg("sp");
    }
    hasBP() {
        return this._hasReg("bp");
    }
    hasBX() {
        return this._hasReg("bx");
    }
}
export const OPTIONS = new Options();
