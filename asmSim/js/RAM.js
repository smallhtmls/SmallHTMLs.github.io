import { BIT_MODE, STATE_READ, STATE_WRITE } from "./const.js";
import {
    setDataBus,
    setControlBus,
    setAddressBus,
    renderRamTable,
    updateRamRender,
    setMessageBox,
    MESSAGE_BOX_STATUS,
} from "./display.js";
import { MESSAGE_BOX_E } from "./elements.js";
import { MINIMASHINE_ASM_DECODE_TABLE_S } from "./miniasm.js";
import { OPTIONS } from "./options.js";
import { isIn } from "./util.js";
/**
 * The Ram storage
 */
export class RAM {
    constructor() {
        this.bitMode = 0n;
        this.bitCount_i = 0n;
        this.storage = Array.from(
            { length: Number(OPTIONS.getMemSize() / 2n) },
            (m) => 0n,
        );
    }
    write(addr_n, data_i) {
        setControlBus(STATE_WRITE);
        setAddressBus(addr_n);
        setDataBus(this.bitCount_i, data_i);
        this.storage[addr_n] = data_i;
        updateRamRender({ [addr_n]: data_i }, 1);
    }
    read(addr_n, bytesToRead_i = 2n) {
        setControlBus(STATE_READ, bytesToRead_i);
        setAddressBus(addr_n);
        const data_i = this.storage[Math.floor(addr_n)];
        if (data_i === undefined || data_i === null)
            throw "Address: " + addr_n + " not part of your memory!";
        setDataBus(bytesToRead_i * 8n, data_i);
        return data_i;
    }
    setBitMode(bitMode) {
        switch (bitMode) {
            case BIT_MODE[8]:
                this.bitCount_i = 8n;
                break;
            case BIT_MODE[16]:
                this.bitCount_i = 16n;
                break;
            case BIT_MODE[32]:
                this.bitCount_i = 32n;
                break;
            case BIT_MODE[64]:
                this.bitCount_i = 64n;
                break;
            default:
                return false;
        }
        setDataBus(this.bitCount_i, 0n);
        this.byteCount_i = this.bitCount_i / 8n;
        this.render();
        this.bitMode = bitMode;
    }
    render() {
        renderRamTable(
            this.bitCount_i,
            OPTIONS.getMemSize(),
            (addr, bytesTLoad) => {
                return this.storage[addr];
            },
            (i, b) => {
                this.storage[i] = b;
                return { [i]: b };
            },
        );
    }
    translateMinimashineAsmKey(val_s, line_n) {
        val_s = val_s.trim().toUpperCase();
        for (const key in MINIMASHINE_ASM_DECODE_TABLE_S) {
            const t = MINIMASHINE_ASM_DECODE_TABLE_S[key];
            if (
                t === val_s ||
                (typeof t !== "string" && t.indexOf(val_s) !== -1)
            )
                return BigInt(key);
        }
        alert("Opcode not found for: " + val_s + " in line: " + line_n);
        return 0n;
    }
    translateMinimashineAsmValue(val_s, line_n) {
        if (val_s == undefined) return 0n;
        const val = BigInt(val_s);
        if (val == undefined && val == null) {
            throw "Assemble Error: Val not a number in line: " + line_n;
        }
        if (!isIn(val, this.bitMode)) {
            throw (
                "Assemble Error: " +
                "Val not in range 0.." +
                this.bitMode +
                " in line: " +
                line_n
            );
        }
        return val;
    }
    translateMinimashineAsm(text_s) {
        let line_for_error_n = 0;
        try {
            let tag_address_m = {};
            let vars_val_m = {};
            const line_as = text_s.split("\n");
            let index_n = 0;
            let memAddr_n = 0;
            for (let line_s of line_as) {
                line_for_error_n++;
                if (
                    line_s == "" ||
                    line_s.startsWith(";") ||
                    line_s.startsWith("#")
                )
                    continue;
                line_s = line_s.split(";")[0].split("#")[0];
                const indx = line_s.indexOf(":");
                if (indx !== -1) {
                    const tag_s = line_s.substr(0, indx);
                    let context_s = line_s.substr(indx + 1).trim();
                    if (context_s.length === 0) {
                        // No context => Jump Point
                        tag_address_m[tag_s] = BigInt(memAddr_n);
                    } else if (context_s.toUpperCase().startsWith("WORD")) {
                        vars_val_m[tag_s] = parseInt(
                            context_s.substr("WORD".length).trim(),
                        );
                    }
                    continue;
                }
                memAddr_n += 2;
            }
            console.log(tag_address_m);
            for (let var_s in vars_val_m) {
                memAddr_n++;
                this.storage[memAddr_n] = BigInt(vars_val_m[var_s]);
                tag_address_m[var_s] = BigInt(memAddr_n);
            }
            memAddr_n = 0;
            line_for_error_n = 0;
            for (let line_s of line_as) {
                line_for_error_n++;
                line_s = line_s.trim();
                if (
                    line_s == "" ||
                    line_s.startsWith(";") ||
                    line_s.startsWith("#")
                )
                    continue;
                line_s = line_s.split(";")[0].split("#")[0];
                const cols_as = line_s.split(" ");
                const key_s = cols_as[0].trim();
                let val_s = cols_as[1];
                if (val_s) val_s = val_s.trim();
                if (key_s.endsWith(":")) {
                    continue;
                }
                let key_i = this.translateMinimashineAsmKey(key_s, index_n);
                let val_i = 0n;
                if (val_i !== undefined && val_i.length !== 0) {
                    if (tag_address_m[val_s] !== undefined) {
                        val_i = tag_address_m[val_s];
                    } else {
                        val_i = this.translateMinimashineAsmValue(
                            val_s,
                            index_n,
                        );
                    }
                }
                index_n++;
                this.storage[memAddr_n++] = key_i;
                this.storage[memAddr_n++] = val_i;
            }
            this.render();
        } catch (e) {
            setMessageBox(
                MESSAGE_BOX_STATUS.ERROR,
                e + " in line: " + line_for_error_n,
            );
        }
    }
    maxAddr() {
        return BigInt(this.storage.length - 1);
    }
}
