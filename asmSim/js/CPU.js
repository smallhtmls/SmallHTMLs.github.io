import {
    setAccuDisplay,
    setInstructionDisplay,
    setInstructionData,
    blinkAssemble,
    initDisplay,
    updateStatusRegister,
    setStackPointer,
    setBasePointer,
    setBXRegister,
    setMessageBox,
    MESSAGE_BOX_STATUS,
} from "./display.js";
import {
    ASSEMBLE_BUTTON_E,
    ASSEMBLE_SELECT_E,
    PROG_COUNTER_E,
    SAVE_FILE_BUTTON_E,
} from "./elements.js";
import { initEditor, editor } from "./editor.js";
import { compileJava } from "./java.js";
import { MINIMASHINE_ASM_DECODE_TABLE_S, OPCODE, REGISTER } from "./miniasm.js";

import { RAM } from "./RAM.js";
import { BIT_MODE } from "./const.js";
import { printBin } from "./util.js";
import { setCPUSpeedUpdateCallback } from "./headerbar.js";
import { OPTIONS } from "./options.js";

const INT16_MIN = -0x8000n; // -32768
const INT16_MAX = 0x7fffn; //  32767

/**
 * Set if the cmp has equal values
 */
const FLAG_ZERO = 0x0;
/**
 * Set if the cmp has acc greater than the value
 */
const FLAG_NEGATIVE = 0x1;
const FLAG_OVERFLOW = 0x2;
const FLAG_CARRIER = 0x3;

const STEP_LOAD_INSTRUCTION = 0;
const STEP_LOAD_DATA = 1;
const STEP_TRANSLATE_INSTRUCTION = 2;
const STEP_EXECUTE = 3;

const UNSIGNED_MANIPULATION = 0xffff_ffff_ffff_0000n;
const BIG_INT_SIGN_BIT = 1n << 63n;
const FILTER16BIT = 0b111_1111_1111_1111n | BIG_INT_SIGN_BIT;
const FILTER_15th_BIT = 1n << 15n;

function decode(key_i) {
    return MINIMASHINE_ASM_DECODE_TABLE_S[key_i];
}
const toSigned = (x) => (x & 0x8000n ? x - 0x10000n : x);
const toUnsigned = (x) => (x < 0n ? x + 0x10000n : x);

/**
 * The CPU
 */
class CPU {
    #getRegisterByRMFactor(isMemory, register) {
        if (isMemory)
            return {
                get: () => this.ram.read(Number(this.instructionData_i)),
                set: (s) => this.ram.write(Number(this.instructionData_i)),
            };
        switch (register) {
            case REGISTER.AX:
                return this.axAccess;
        }
        return {
            get: () => {
                throw "Not a register!";
            },
            set: (s) => {
                throw "Not a register!";
            },
        };
    }
    execute() {
        let iq = (v) => this.currentInstruction_i == v;
        let calcDat_i;

        switch (this.currentInstruction_i) {
            // MATH
            case OPCODE.ADD_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(calcDat_i + this.accumulator_i);
                break;
            case OPCODE.SUB_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i - calcDat_i);
                break;
            case OPCODE.MUL_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i * calcDat_i));
                break;
            case OPCODE.DIV_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i / calcDat_i));
                break;
            case OPCODE.MOD_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i % calcDat_i));
                break;
            //
            case OPCODE.ADD_ACC_VAL:
                this.setAccu(this.accumulator_i + this.instructionData_i);
                break;
            case OPCODE.SUB_ACC_VAL:
                this.setAccu(this.accumulator_i - this.instructionData_i);
                break;
            case OPCODE.MUL_ACC_VAL:
                calcDat_i = toSigned(this.instructionData_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i * calcDat_i));
                break;
            case OPCODE.DIV_ACC_VAL:
                calcDat_i = toSigned(this.instructionData_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i / calcDat_i));
                break;
            case OPCODE.MOD_ACC_VAL:
                calcDat_i = toSigned(this.instructionData_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i % calcDat_i));
                break;
            // END OF SIMPLE MATH
            case OPCODE.MUH_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                calcDat_i *= this.accumulator_i;
                calcDat_i = toUnsigned(calcDat_i);
                this.setAccu(calcDat_i >> 16n, false);
                break;
            case OPCODE.MUH_ACC_VAL:
                calcDat_i = this.instructionData_i;
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                calcDat_i *= this.accumulator_i;
                calcDat_i = toUnsigned(calcDat_i);
                this.setAccu(calcDat_i >> 16n, false);
                break;
            case OPCODE.MHU_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i *= this.accumulator_i;
                this.setAccu(calcDat_i >> 16n, true);
                break;
            case OPCODE.MHU_ACC_VAL:
                calcDat_i = this.instructionData_i;
                calcDat_i *= this.accumulator_i;
                this.setAccu(calcDat_i >> 16n, true);
                break;
            case OPCODE.DIU_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i / calcDat_i, true);
                break;
            case OPCODE.DIU_ACC_VAL:
                calcDat_i = this.instructionData_i;
                this.setAccu(this.accumulator_i / calcDat_i, true);
                break;
            case OPCODE.MOU_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i % calcDat_i, true);
                break;
            case OPCODE.MOU_ACC_VAL:
                calcDat_i = this.instructionData_i;
                this.setAccu(this.accumulator_i % calcDat_i, true);
                break;
            // BOOL OPERATION
            case OPCODE.NOT_ACC_ACC:
                this.setAccu(~this.accumulator_i);
                break;
            case OPCODE.AND_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i & calcDat_i);
                break;
            case OPCODE.AND_ACC_VAL:
                this.setAccu(this.accumulator_i & this.instructionData_i);
                break;
            case OPCODE.AOR_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i | calcDat_i);
                break;
            case OPCODE.AOR_ACC_VAL:
                this.setAccu(this.accumulator_i | this.instructionData_i);
                break;
            case OPCODE.XOR_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i ^ calcDat_i);
                break;
            case OPCODE.XOR_ACC_VAL:
                this.setAccu(this.accumulator_i ^ this.instructionData_i);
                break;
            case OPCODE.SHL_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i << calcDat_i));
                break;
            case OPCODE.SHL_ACC_VAL:
                calcDat_i = this.instructionData_i;
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i << calcDat_i));
                break;
            case OPCODE.SRA_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i >> calcDat_i));
                break;
            case OPCODE.SRA_ACC_VAL:
                calcDat_i = this.instructionData_i;
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(toUnsigned(this.accumulator_i >> calcDat_i));
                break;
            case OPCODE.SHR_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i >> calcDat_i);
                break;
            case OPCODE.SHR_ACC_VAL:
                this.setAccu(this.accumulator_i >> this.instructionData_i);
                break;
            // MEMORY
            case OPCODE.MOV_MEM_ACC:
                this.setAccu(this.ram.read(Number(this.instructionData_i)));
                break;
            //
            case OPCODE.MOV_VAL_ACC:
                this.setAccu(this.instructionData_i);
                break;
            case OPCODE.MOV_ACC_MEM:
                this.ram.write(
                    Number(this.instructionData_i),
                    this.accumulator_i,
                );
                break;
            case OPCODE.MOV_CRY_ACC:
                this.setAccu(this.statusRegister[FLAG_CARRIER] ? 1n : 0n);
                break;
            case OPCODE.MOV_MEM_BX:
                this.bxAccess.set(
                    this.ram.read(Number(this.instructionData_i)),
                );
                break;
            //
            case OPCODE.MOV_VAL_BX:
                this.bxAccess.set(this.instructionData_i);
                break;
            case OPCODE.MOV_BX_MEM:
                this.ram.write(
                    Number(this.instructionData_i),
                    this.bxAccess.get(),
                );
                break;
            // CONTROL
            case OPCODE.STOP_SYMBOL:
                setInstructionData(0n);
                this.instructionData_i = 0n;
                this.step_n = 0;
                this.prgCounter_n = 0;
                setMessageBox(
                    MESSAGE_BOX_STATUS.FINE,
                    "Program ausgeführt... ",
                );
                PROG_COUNTER_E.innerHTML = Math.floor(this.prgCounter_n);
                break;
            case OPCODE.CON_TIN_UE0:
                break;
            case OPCODE.CMP_ACC_MEM:
                calcDat_i = this.accumulator_i;
                calcDat_i -= this.ram.read(Number(this.instructionData_i));
                this.setStatusRegister(FLAG_ZERO, calcDat_i == 0);
                this.setStatusRegister(FLAG_NEGATIVE, calcDat_i < 0);
                break;
            case OPCODE.CMP_ACC_VAL:
                calcDat_i = this.accumulator_i;
                calcDat_i -= this.instructionData_i;
                this.setStatusRegister(FLAG_ZERO, calcDat_i == 0);
                this.setStatusRegister(FLAG_NEGATIVE, calcDat_i < 0);
                break;
            case OPCODE.JLT_MEM_NUL:
                if (
                    !this.statusRegister[FLAG_ZERO] &&
                    this.statusRegister[FLAG_NEGATIVE]
                )
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case OPCODE.JLE_MEM_NUL:
                if (
                    this.statusRegister[FLAG_ZERO] ||
                    this.statusRegister[FLAG_NEGATIVE]
                )
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case OPCODE.JGT_MEM_NUL:
                if (
                    !this.statusRegister[FLAG_ZERO] &&
                    !this.statusRegister[FLAG_NEGATIVE]
                )
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case OPCODE.JGE_MEM_NUL:
                if (
                    this.statusRegister[FLAG_ZERO] ||
                    !this.statusRegister[FLAG_NEGATIVE]
                )
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case OPCODE.JNE_MEM_NUL:
                if (!this.statusRegister[FLAG_ZERO])
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case OPCODE.JEQ_MEM_NUL:
                if (this.statusRegister[FLAG_ZERO])
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case OPCODE.JOV_MEM_NUL:
                if (this.statusRegister[FLAG_OVERFLOW])
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case OPCODE.JOC_MEM_NUL:
                if (this.statusRegister[FLAG_CARRIER])
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case OPCODE.JMP_MEM_NUL:
                this.setProgramCounter(Number(this.instructionData_i));
                break;
            //
            //
            //
            case OPCODE.POP_FRM_STA:
                calcDat_i = this.spAccess.get() + 1n;
                if (calcDat_i > this.ram.maxAddr()) {
                    break;
                }
                this.setAccu(this.ram.read(Number(calcDat_i - 1n)));
                this.spAccess.set(calcDat_i);
                break;
            case OPCODE.PUS_HTO_STA:
                calcDat_i = this.spAccess.get() - 1n;
                if (calcDat_i < 0n) {
                    break;
                }
                this.ram.write(Number(calcDat_i), this.axAccess.get());
                this.spAccess.set(calcDat_i);
                break;
            case OPCODE.CAL_LTO_STP:
                calcDat_i = this.spAccess.get() - 1n;
                if (calcDat_i < 0n) {
                    break;
                }
                this.ram.write(Number(calcDat_i), BigInt(this.prgCounter_n));
                this.setProgramCounter(Number(this.instructionData_i));
                this.spAccess.set(calcDat_i);
                break;
            case OPCODE.RET_NTO_STP:
                calcDat_i = this.spAccess.get() + 1n;
                if (calcDat_i > this.ram.maxAddr()) {
                    break;
                }
                this.setProgramCounter(
                    Number(this.ram.read(Number(calcDat_i - 1n))),
                );
                this.spAccess.set(calcDat_i);
                break;
            case OPCODE.RES_ERV_ADR:
                this.spAccess.set(this.spAccess.get() - this.instructionData_i);
                break;
            case OPCODE.REL_EAS_ADR:
                this.spAccess.set(this.spAccess.get() + this.instructionData_i);
                break;
            case OPCODE.MOV_MEM_SP:
                this.setAccu(
                    this.ram.read(
                        Number(this.spAccess.get() - this.instructionData_i),
                    ),
                );
                break;
            case OPCODE.MOV_SP_MEM:
                this.ram.write(
                    Number(this.spAccess.get() - this.instructionData_i),
                    this.accumulator_i,
                );
            // BX Register
            case OPCODE.XCHG_ACC_BX:
                let bx = this.bxAccess.get();
                let ax = this.axAccess.get();
                this.bxAccess.set(ax);
                this.axAccess.set(bx);
                break;
        }
    }

    /**
     * @type {RAM}
     */
    ram = null;
    /**
     * @type {bigint}
     */
    instructionData_i = 0n;
    /**
     *@type {bigint}
     */
    currentInstruction_i = 0n;
    /**
     *
     * @param {RAM} ram
     */
    constructor(ram) {
        this.ram = ram;
        this.prgCounter_n = 0;
        this.step_n = 0;
        this.currentInstruction_i = 0n;
        this.instructionData_i = 0n;
        this.basePointer = 0n;
        this.stackPointer = 0n;
        this.bxRegister_i = 0n;
        this.statusRegister = [false, false, false, false];
        this.axAccess = {
            get: () => this.accumulator_i,
            set: (s) => this.setAccu(s),
        };
        this.bpAccess = {
            get: () => this.basePointer,
            set: (s) => {
                this.basePointer = s & 0xffffn;
                setBasePointer(this.basePointer);
            },
        };
        this.spAccess = {
            get: () => this.stackPointer,
            set: (s) => {
                this.stackPointer = s & 0xffffn;
                setStackPointer(this.stackPointer);
            },
        };
        this.bxAccess = {
            get: () => this.bxRegister_i,
            set: (s_i) => {
                this.bxRegister_i = s_i;
                setBXRegister(s_i);
            },
        };
        this.axAccess.set(0n);
        this.bxAccess.set(0n);
        this.bpAccess.set(this.ram.maxAddr());
        this.spAccess.set(this.ram.maxAddr());

        this.setStatusRegister(FLAG_ZERO, false);
    }
    setStatusRegister(flag_i, val_b) {
        if (this.statusRegister[flag_i] != val_b) {
            this.statusRegister[flag_i] = val_b;
            updateStatusRegister(
                this.statusRegister[0],
                this.statusRegister[1],
                this.statusRegister[2],
                this.statusRegister[3],
            );
        }
    }
    incProgramCounter() {
        this.prgCounter_n++;
        PROG_COUNTER_E.innerHTML = Math.floor(this.prgCounter_n);
    }
    setProgramCounter(addr_n) {
        this.prgCounter_n = addr_n;
        PROG_COUNTER_E.innerHTML = addr_n;
    }
    stop() {
        clearInterval(this.intervalNumber);
        this.intervalNumber = null;
    }
    clear() {
        this.prgCounter_n = 0;
        this.step_n = 0;
        this.stop();
        this.axAccess.set(0n);
        this.spAccess.set(this.ram.maxAddr());
        this.bpAccess.set(this.ram.maxAddr());
        PROG_COUNTER_E.innerHTML = Math.floor(this.prgCounter_n);
    }
    run() {
        if (this.intervalNumber != null) return;
        this.intervalNumber = setInterval(() => {
            this.step();
            if (this.currentInstruction_i === OPCODE.STOP_SYMBOL) {
                this.stop();
                setMessageBox(MESSAGE_BOX_STATUS.FINE, "Program ausgeführt!");
            }
        }, OPTIONS.getCPUSpeed());
    }
    updateSpeed() {
        if (this.intervalNumber == null) return;
        this.stop();
        this.run();
    }
    step() {
        do {
            this.smallStep();
        } while (this.step_n != 0);
        console.log("Finshed Step:", this.prgCounter_n);
    }
    smallStep() {
        try {
            switch (this.step_n) {
                case STEP_LOAD_INSTRUCTION:
                    this.currentInstruction_i = this.ram.read(
                        this.prgCounter_n,
                        2n,
                    );
                    setInstructionDisplay(this.currentInstruction_i);
                    this.incProgramCounter();
                    break;
                case STEP_LOAD_DATA:
                    this.instructionData_i = this.ram.read(
                        this.prgCounter_n,
                        this.ram.byteCount_i,
                    );
                    setInstructionData(this.instructionData_i);
                    this.incProgramCounter();
                    break;
                case STEP_TRANSLATE_INSTRUCTION:
                    const instr_s = decode(this.currentInstruction_i);
                    if (instr_s == undefined) {
                        alert("Undefined Opcode! Resetting!");
                        this.clear();
                    }
                    setInstructionDisplay(instr_s);
                    break;
                case STEP_EXECUTE:
                    this.execute();
                    this.step_n = -1;
                    break;
            }
        } catch (e) {
            setMessageBox(MESSAGE_BOX_STATUS.ERROR, "Execution Error: " + e);
            this.stop();
            this.step_n = -1;
        }
        this.step_n++;
    }
    setAccu(accu_i, isUnsigned = false) {
        this.setStatusRegister(
            isUnsigned ? FLAG_CARRIER : FLAG_OVERFLOW,
            accu_i > BIT_MODE[16],
        );
        this.accumulator_i = accu_i & 0xffffn;
        setAccuDisplay(this.accumulator_i);
    }
}

const Memory = new RAM();
const currentProcessor = new CPU(Memory);
window.Processor = currentProcessor;

Memory.setBitMode(BIT_MODE[16]);
//updateMem();
function assemble() {
    switch (ASSEMBLE_SELECT_E.value) {
        case "mini-asm":
            editor.setValue(editor.getValue().replace("HOLD", "HALT"));
            Memory.translateMinimashineAsm(editor.getValue().trim());
            break;
        case "java":
            let miniasm = compileJava(editor.getValue().trim());
            Memory.translateMinimashineAsm("");
    }
}
ASSEMBLE_BUTTON_E.addEventListener("click", assemble);
initEditor(blinkAssemble, initDisplay);

document.addEventListener("keydown", (e) => {
    if (!e.ctrlKey) return;
    let preventDefault = true;
    switch (e.key) {
        case "e":
            ASSEMBLE_BUTTON_E.click();
            setTimeout(() => {
                currentProcessor.run();
            }, 200);
        case "b":
            ASSEMBLE_BUTTON_E.click();
            break;
        case "r":
            currentProcessor.run();
            break;
        case "m":
            currentProcessor.step();
            break;
        case "q":
            currentProcessor.smallStep();
            break;
        case "y":
            currentProcessor.clear();
            break;
        case "s":
            SAVE_FILE_BUTTON_E.click();
            break;
        default:
            preventDefault = false;
    }
    if (preventDefault) {
        e.preventDefault();
    }
});
setCPUSpeedUpdateCallback(() => {
    currentProcessor.updateSpeed();
});
