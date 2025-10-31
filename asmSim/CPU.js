const CONFIG = {
    MEMORY_SIZE: 50000n,
};

const BIT_MODE_8 = 2n ** 8n - 1n;
const BIT_MODE_16 = 2n ** 16n - 1n;
const BIT_MODE_32 = 2n ** 32n - 1n;
const BIT_MODE_64 = 2n ** 64n - 1n;

const STATE_READ = 0x1;
const STATE_WRITE = 0x0;

const FLAG_ZERO = 0x0;
const FLAG_NEGATIVE = 0x1;
const FLAG_OVERFLOW = 0x2;
const FLAG_CARRIER = 0x3;

const STEP_LOAD_INSTRUCTION = 0;
const STEP_LOAD_DATA = 1;
const STEP_TRANSLATE_INSTRUCTION = 2;
const STEP_EXECUTE = 3;

const BIG_INT_SIGN_BIT = 1n << 63n;
const FILTER16BIT = 0b111_1111_1111_1111n | BIG_INT_SIGN_BIT;
const FILTER_15th_BIT = 1n << 15n;

function decode(key_i) {
    return MINIMASHINE_ASM_DECODE_TABLE_S[key_i];
}
const toSigned = (x) => (x & 0x8000n ? x - 0x10000n : x);
/**
 * The CPU
 */
class CPU {
    execute() {
        let iq = (v) => this.currentInstruction_i == v;
        let calcDat_i;
        switch (this.currentInstruction_i) {
            // MATH
            case ADD_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(calcDat_i + this.accumulator_i);
                break;
            case SUB_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i - calcDat_i);
                break;
            case MUL_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i * calcDat_i);
                break;
            case DIV_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i / calcDat_i);
                break;
            case MOD_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i % calcDat_i);
                break;
            //
            case ADD_ACC_VAL:
                this.setAccu(this.accumulator_i + this.instructionData_i);
                break;
            case SUB_ACC_VAL:
                this.setAccu(this.accumulator_i - this.instructionData_i);
                break;
            case MUL_ACC_VAL:
                calcDat_i = toSigned(this.instructionData_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i * calcDat_i);
                break;
            case DIV_ACC_VAL:
                calcDat_i = toSigned(this.instructionData_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i / calcDat_i);
                break;
            case MOD_ACC_VAL:
                calcDat_i = toSigned(this.instructionData_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i % calcDat_i);
                break;
            case SUB_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(
                    ((this.accumulator_i & 0xffffn) - (calcDat_i & 0xffffn)) &
                        0xffffn
                );
                break;

            case MUH_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i *= this.accumulator_i;
                this.setAccu(calcDat_i >> 16n, true);
                break;
            case MUH_ACC_VAL:
                calcDat_i = this.instructionData_i;
                calcDat_i *= this.accumulator_i;
                console.log(calcDat_i.toString(2));
                this.setAccu(calcDat_i >> 16n, true);
                break;
            case MHU_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                calcDat_i *= this.accumulator_i;
                this.setAccu(calcDat_i >> 16n, true);
                break;
            case MHU_ACC_VAL:
                calcDat_i = this.instructionData_i;
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                calcDat_i *= this.accumulator_i;
                this.setAccu(calcDat_i >> 16n, true);
                break;
            case DIU_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i / calcDat_i, true);
                break;
            case DIU_ACC_VAL:
                calcDat_i = this.instructionData_i;
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i / calcDat_i, true);
                break;
            case MOU_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i % calcDat_i, true);
                break;
            case MOU_ACC_VAL:
                calcDat_i = this.instructionData_i;
                calcDat_i = toSigned(calcDat_i);
                this.accumulator_i = toSigned(this.accumulator_i);
                this.setAccu(this.accumulator_i % calcDat_i, true);
                break;
            // BOOL OPERATION
            case NOT_ACC_ACC:
                this.setAccu(~this.accumulator_i);
                break;
            case AND_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i & calcDat_i);
                break;
            case AND_ACC_VAL:
                this.setAccu(this.accumulator_i & this.instructionData_i);
                break;
            case AOR_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i | calcDat_i);
                break;
            case AOR_ACC_VAL:
                this.setAccu(this.accumulator_i | this.instructionData_i);
                break;
            case XOR_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i ^ calcDat_i);
                break;
            case XOR_ACC_VAL:
                this.setAccu(this.accumulator_i ^ this.instructionData_i);
                break;
            case SHL_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i << calcDat_i);
                break;
            case SHL_ACC_VAL:
                this.setAccu(this.accumulator_i << this.instructionData_i);
                break;
            case SHR_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                this.setAccu(this.accumulator_i >> calcDat_i);
                break;
            case SHR_ACC_VAL:
                this.setAccu(this.accumulator_i >> this.instructionData_i);
                break;
            case SRA_ACC_MEM:
                calcDat_i = this.ram.read(Number(this.instructionData_i));
                if (calcDat_i & FILTER_15th_BIT) {
                    this.accumulator_i |= ~0xffff;
                }
                this.setAccu(this.accumulator_i >> calcDat_i);
                break;
            case SRA_ACC_VAL:
                if (calcDat_i & FILTER_15th_BIT) {
                    this.accumulator_i |= ~0xffff;
                }
                this.setAccu(this.accumulator_i >> this.instructionData_i);
                break;
            // MEMORY
            case MOV_MEM_ACC:
                this.setAccu(this.ram.read(Number(this.instructionData_i)));
                break;
            //
            case MOV_VAL_ACC:
                this.setAccu(this.instructionData_i);
                break;
            case MOV_ACC_MEM:
                this.ram.write(
                    Number(this.instructionData_i),
                    this.accumulator_i
                );
                break;
            case MOV_CRY_ACC:
                this.setAccu(this.statusRegister[FLAG_CARRIER] ? 1n : 0n);
                break;
            // CONTROL
            case STOP_SYMBOL:
                setInstructionData(0n);
                this.instructionData_i = 0n;
                this.step_n = 0;
                this.prgCounter_n = 0;
                PROG_COUNTER_E.innerHTML = Math.floor(this.prgCounter_n);
                break;
            case CON_TIN_UE0:
                break;
            case CMP_ACC_MEM:
                calcDat_i = this.accumulator_i;
                calcDat_i -= this.ram.read(Number(this.instructionData_i));
                this.setStatusRegister(FLAG_ZERO, calcDat_i == 0);
                this.setStatusRegister(FLAG_NEGATIVE, calcDat_i < 0);
                break;
            case CMP_ACC_VAL:
                calcDat_i = this.accumulator_i;
                calcDat_i -= this.instructionData_i;
                this.setStatusRegister(FLAG_ZERO, calcDat_i == 0);
                this.setStatusRegister(FLAG_NEGATIVE, calcDat_i < 0);
                break;
            case JLT_MEM_NUL:
                if (
                    !this.statusRegister[FLAG_ZERO] &&
                    this.statusRegister[FLAG_NEGATIVE]
                )
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case JLE_MEM_NUL:
                if (
                    this.statusRegister[FLAG_ZERO] ||
                    this.statusRegister[FLAG_NEGATIVE]
                )
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case JGT_MEM_NUL:
                if (
                    !this.statusRegister[FLAG_ZERO] &&
                    !this.statusRegister[FLAG_NEGATIVE]
                )
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case JGE_MEM_NUL:
                if (
                    this.statusRegister[FLAG_ZERO] ||
                    !this.statusRegister[FLAG_NEGATIVE]
                )
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case JNE_MEM_NUL:
                if (this.statusRegister[FLAG_ZERO])
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case JEQ_MEM_NUL:
                if (this.statusRegister[FLAG_ZERO])
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case JOV_MEM_NUL:
                if (this.statusRegister[FLAG_OVERFLOW])
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case JOC_MEM_NUL:
                if (this.statusRegister[FLAG_CARRIER])
                    this.setProgramCounter(Number(this.instructionData_i));
                break;
            case JMP_MEM_NUL:
                this.setProgramCounter(Number(this.instructionData_i));
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
        this.statusRegister = [false, false, false, false];
        this.setStatusRegister(FLAG_ZERO, false);
    }
    setStatusRegister(flag_i, val_b) {
        if (this.statusRegister[flag_i] != val_b) {
            this.statusRegister[flag_i] = val_b;
            updateStatusRegister(
                this.statusRegister[0],
                this.statusRegister[1],
                this.statusRegister[2],
                this.statusRegister[3]
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
        this.prgCounter_n = 0;
        this.step_n = 0;
        this.intervalNumber = null;
        PROG_COUNTER_E.innerHTML = Math.floor(this.prgCounter_n);
    }
    run() {
        if (this.intervalNumber != null) return;
        this.intervalNumber = setInterval(() => {
            this.step();
            if (this.currentInstruction_i == STOP_SYMBOL) {
                clearInterval(this.intervalNumber);
                this.intervalNumber = null;
            }
        }, 1);
    }
    step() {
        do {
            this.smallStep();
        } while (this.step_n != 0);
        console.log("Finshed Step:", this.prgCounter_n);
    }
    smallStep() {
        switch (this.step_n) {
            case STEP_LOAD_INSTRUCTION:
                this.currentInstruction_i = this.ram.read(this.prgCounter_n, 2);
                setInstructionDisplay(this.currentInstruction_i);
                this.incProgramCounter();
                break;
            case STEP_LOAD_DATA:
                this.instructionData_i = this.ram.read(
                    this.prgCounter_n,
                    this.ram.byteCount_i
                );
                setInstructionData(this.instructionData_i);
                this.incProgramCounter();
                break;
            case STEP_TRANSLATE_INSTRUCTION:
                const instr_s = decode(this.currentInstruction_i);
                if (instr_s == undefined) {
                    alert("Undefined Opcode! Resetting!");
                    this.stop();
                }
                setInstructionDisplay(instr_s);
                break;
            case STEP_EXECUTE:
                this.execute();
                this.step_n = -1;
                break;
        }
        this.step_n++;
    }
    setAccu(accu_i, isUnsigned = false) {
        this.setStatusRegister(
            isUnsigned ? FLAG_CARRIER : FLAG_OVERFLOW,
            accu_i > 0xffffn / 2n || accu_i < -(0xffffn / 2n)
        );
        this.accumulator_i = accu_i & 0xffffn;
        setAccuDisplay(this.accumulator_i);
    }
}

function isIn(val_i, bitMode_i) {
    return val_i >= -bitMode_i / 2n && val_i <= bitMode_i / 2n;
}
/**
 * The Ram storage
 */
class RAM {
    constructor() {
        this.bitMode = 0n;
        this.bitCount_i = 0n;
        this.storage = Array.from(
            { length: Number(CONFIG.MEMORY_SIZE / 2n) },
            (m) => 0n
        );
    }
    write(addr_n, data_i) {
        setControlBus(STATE_WRITE);
        setAddressBus(addr_n);
        setDataBus(this.bitCount_i, data_i);
        this.storage[addr_n] = data_i;
        updateRamRender({ [addr_n]: data_i }, 1);
    }
    read(addr_n, bytesToRead_i) {
        setControlBus(STATE_READ, bytesToRead_i);
        setAddressBus(addr_n);
        const data_i = this.storage[Math.floor(addr_n)];
        setDataBus(bytesToRead_i, data_i);
        return data_i;
    }
    setBitMode(bitMode) {
        switch (bitMode) {
            case BIT_MODE_8:
                this.bitCount_i = 8n;
                break;
            case BIT_MODE_16:
                this.bitCount_i = 16n;
                break;
            case BIT_MODE_32:
                this.bitCount_i = 32n;
                break;
            case BIT_MODE_64:
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
            CONFIG.MEMORY_SIZE,
            (addr, bytesTLoad) => {
                return this.storage[addr];
            },
            (i, b) => {
                this.storage[i] = b;
                return { [i]: b };
            }
        );
    }
    translateMinimashineAsmKey(val_s, line_n) {
        val_s = val_s.trim().toUpperCase();
        for (const key in MINIMASHINE_ASM_DECODE_TABLE_S) {
            if (MINIMASHINE_ASM_DECODE_TABLE_S[key] === val_s)
                return BigInt(key);
        }
        alert("Opcode not found for: " + val_s + " in line: " + line_n);
        return 0n;
    }
    translateMinimashineAsmValue(val_s, line_n) {
        if (val_s == undefined) return 0n;
        const val = BigInt(val_s);
        if (val == undefined && val == null) {
            alert("Val not a number in line: " + line_n);
            return 0n;
        }
        if (!isIn(val, this.bitMode)) {
            alert(
                "Val not in range 0.." + this.bitMode + " in line: " + line_n
            );
            return 0n;
        }
        return val;
    }
    translateMinimashineAsm(text_s) {
        let tag_address_m = {};
        const line_as = text_s.split("\n");
        let index_n = 0;
        let memAddr_n = 0;
        for (let line_s of line_as) {
            line_s = line_s.trim();
            if (line_s.endsWith(":")) {
                const tag = line_s.slice(0, line_s.length - 1);
                tag_address_m[tag] = BigInt(memAddr_n);
                //memAddr_n += 2;
                continue;
            }
            if (line_s == "" || line_s.startsWith(";")) continue;
            memAddr_n += 2;
        }
        memAddr_n = 0;
        for (let line_s of line_as) {
            line_s = line_s.trim();
            if (line_s == "" || line_s.startsWith(";")) continue;
            const cols_as = line_s.split(" ");
            const key_s = cols_as[0].trim();
            let val_s = cols_as[1];
            if (val_s) val_s = val_s.trim();
            if (key_s.endsWith(":")) {
                // this.storage[memAddr_n++] = CON_TIN_UE0;
                //this.storage[memAddr_n++] = 0n;
                continue;
            }
            let key_i = this.translateMinimashineAsmKey(key_s, index_n);
            let val_i = 0n;
            console.log(tag_address_m);
            if (tag_address_m[val_s]) {
                val_i = tag_address_m[val_s];
            } else {
                val_i = this.translateMinimashineAsmValue(val_s, index_n);
            }
            index_n++;
            this.storage[memAddr_n++] = key_i;
            this.storage[memAddr_n++] = val_i;
        }
        this.render();
    }
}
const Memory = new RAM();
const Processor = new CPU(Memory);
Memory.setBitMode(BIT_MODE_16);
//updateMem();
function assemble() {
    switch (ASSEMBLE_SELECT_E.value) {
        case "mini@asm":
            Memory.translateMinimashineAsm(editor.getValue().trim());
            break;
    }
}
