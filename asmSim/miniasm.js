const DEFAULT_MINIASM = `LOADI 7
ADDI 52
SUBI 5
MULI 10
ORI 2
SUB 0
DIVI 9
ADD 1
XORI 4`;

const STOP_SYMBOL = 0x00n;
const MOV_VAL_ACC = 0xb8n;
const MOV_MEM_ACC = 0xa1n;
const MOV_ACC_MEM = 0xa3n;
const ADD_ACC_MEM = 0x0306n;
const SUB_ACC_MEM = 0x2b06n;
const MUL_ACC_MEM = 0xf726n;
const DIV_ACC_MEM = 0xf736n;
const MOD_ACC_MEM = 0xff01n;

const ADD_ACC_VAL = 0xffd1n;
const SUB_ACC_VAL = 0xffd2n;
const MUL_ACC_VAL = 0xffd3n;
const DIV_ACC_VAL = 0xffd4n;
const MOD_ACC_VAL = 0xffd5n;
const DIU_ACC_VAL = 0xffe0n;
const MOU_ACC_VAL = 0xffe1n;
const MUH_ACC_VAL = 0xffe2n;
const MHU_ACC_VAL = 0xffe3n;
const CMP_ACC_VAL = 0xffe4n;

const AND_ACC_VAL = 0xffc2n;
const AOR_ACC_VAL = 0xffc3n;
const XOR_ACC_VAL = 0xffc4n;
const SHL_ACC_VAL = 0xffc6n;
const SHR_ACC_VAL = 0xffc7n;
const SRA_ACC_VAL = 0xffc8n;

const AND_ACC_MEM = 0xffe5n;
const AOR_ACC_MEM = 0xffe6n;
const XOR_ACC_MEM = 0xffe7n;
const NOT_ACC_ACC = 0xffe8n;
const SHL_ACC_MEM = 0xffe9n;
const SHR_ACC_MEM = 0xffc0n;
const SRA_ACC_MEM = 0xffc1n;

const DIU_ACC_MEM = 0xffd6n;
const MOU_ACC_MEM = 0xffd7n;
const MUH_ACC_MEM = 0xffd8n;
const MHU_ACC_MEM = 0xffd9n;

const CMP_ACC_MEM = 0xfff2n;
const JMP_MEM_NUL = 0xfff3n;
const JLT_MEM_NUL = 0xfff4n;
const JGT_MEM_NUL = 0xfff5n;
const JLE_MEM_NUL = 0xfff6n;
const JGE_MEM_NUL = 0xfff7n;
const JEQ_MEM_NUL = 0xfff8n;
const JNE_MEM_NUL = 0xfff9n;
const JOV_MEM_NUL = 0xf0f0n;
const JOC_MEM_NUL = 0xf0f1n;
const CON_TIN_UE0 = 0x0001n;
const MOV_CRY_ACC = 0x0002n;

const CODE_DESCRIPTION_S = {
    [MOV_CRY_ACC]: "Not yet tested!",
    [DIU_ACC_VAL]: "Not yet fixed!", // DONE
    [MOU_ACC_VAL]: "Not yet fixed!", // DONE
    [MUH_ACC_VAL]: "Not yet fixed!", // DONE
    [MHU_ACC_VAL]: "Not yet fixed!", // DONE
    [DIU_ACC_MEM]: "Not yet fixed!", // DONE
    [MOU_ACC_MEM]: "Not yet fixed!", // DONE
    [MUH_ACC_MEM]: "Not yet fixed!", // DONE
    [MHU_ACC_MEM]: "Not yet fixed!", // DONE
};

const MINIMASHINE_ASM_DECODE_TABLE_S = {
    // MEMORY
    [MOV_VAL_ACC]: "LOADI", // DONE | CHECK
    [MOV_MEM_ACC]: "LOAD", // DONE | CHECK
    [MOV_ACC_MEM]: "STORE", // DONE | CHECK
    [MOV_CRY_ACC]: "LOADC", //DONE |
    // MATH
    [ADD_ACC_MEM]: "ADD", // DONE
    [SUB_ACC_MEM]: "SUB", // DONE
    [MUL_ACC_MEM]: "MUL", // DONE
    [DIV_ACC_MEM]: "DIV", // DONE
    [MOD_ACC_MEM]: "MOD", // DONE
    //
    [ADD_ACC_VAL]: "ADDI", // DONE
    [SUB_ACC_VAL]: "SUBI", // DONE
    [MUL_ACC_VAL]: "MULI", // DONE
    [DIV_ACC_VAL]: "DIVI", // DONE
    [MOD_ACC_VAL]: "MODI", // DONE
    [DIU_ACC_VAL]: "DIVUI", // DONE
    [MOU_ACC_VAL]: "MODUI", // DONE
    [MUH_ACC_VAL]: "MULHI", //DONE
    [MHU_ACC_VAL]: "MULHUI", // DONE
    [CMP_ACC_VAL]: "CMPI", // DONE
    [DIU_ACC_MEM]: "DIVU", // DONE
    [MOU_ACC_MEM]: "MODU", // DONE
    [MUH_ACC_MEM]: "MULH", // DONE
    [MHU_ACC_MEM]: "MULHU", // DONE
    [AND_ACC_VAL]: "ANDI", //DONE
    [AOR_ACC_VAL]: "ORI", //DONE
    [XOR_ACC_VAL]: "XORI", // DONE
    [SHL_ACC_VAL]: "SHLI", //DONE
    [SHR_ACC_VAL]: "SHRI", //DONE
    [SRA_ACC_VAL]: "SHRAI", //DONE
    [AND_ACC_MEM]: "AND", // DONE
    [AOR_ACC_MEM]: "OR", //DONE
    [XOR_ACC_MEM]: "XOR", // DONE
    [SHL_ACC_MEM]: "SHL", // DONE
    [SHR_ACC_MEM]: "SHR", // DONE
    [SRA_ACC_MEM]: "SHRA", // DONE
    [NOT_ACC_ACC]: "NOT", // DONE
    [CMP_ACC_MEM]: "CMP", // DONE
    [JMP_MEM_NUL]: "JMP", // DONE
    [JLT_MEM_NUL]: "JLT", // DONE
    [JGT_MEM_NUL]: "JGT", // DONE
    [JLE_MEM_NUL]: "JLE", // DONE
    [JGE_MEM_NUL]: "JGE", // DONE
    [JEQ_MEM_NUL]: "JEQ", // DONE
    [JNE_MEM_NUL]: "JNE", // DONE
    [JOC_MEM_NUL]: "JOC", // DONE
    [JOV_MEM_NUL]: "JOV", // DONE
    [CON_TIN_UE0]: "NOOP", // DONE
    [STOP_SYMBOL]: "HOLD", // DONE
};
