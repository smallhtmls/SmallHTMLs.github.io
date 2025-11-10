const DEFAULT_MINIASM = `LOADI 7
ADDI 52
SUBI 5
MULI 10
ORI 2
SUB 0
DIVI 9
ADD 1
XORI 4`;

const STOP_SYMBOL = 0x00n; // NOT INTELx86
const MOV_VAL_ACC = 0xb8n; // INTELx86 mov ax, <number>
const MOV_MEM_ACC = 0xa1n; // INTELx86 mov ax, [<addr>]
const MOV_ACC_MEM = 0xa3n; // INTELx86 mov [<addr>], ax
const ADD_ACC_MEM = 0x0306n; // INTELx86 add ax, [<addr>]
const SUB_ACC_MEM = 0x2b06n; // INTELx86 sub ax, [<addr>]
const MUL_ACC_MEM = 0xf726n; // INTELx86 mul word [<addr>]
const DIV_ACC_MEM = 0xf736n; // INTELx86 div word [<addr>]
const MOD_ACC_MEM = 0xff01n;

const ADD_ACC_VAL = 0x83c0n; // INTELx86 add ax, <number>
const SUB_ACC_VAL = 0x83e8n; // INTELx86 sub ax, <number>
const MUL_ACC_VAL = 0x6bc0n; // INTELx86 imul ax, <number>
const DIV_ACC_VAL = 0xffd4n; // NOT INTELx86
const MOD_ACC_VAL = 0xffd5n; // NOT INTELx86
const DIU_ACC_VAL = 0xffe0n; // NOT INTELx86
const MOU_ACC_VAL = 0xffe1n; // NOT INTELx86
const MUH_ACC_VAL = 0xffe2n; //
const MHU_ACC_VAL = 0xffe3n;
const CMP_ACC_VAL = 0x83f8n; // INTELx86 cmp ax, <number>

const AND_ACC_VAL = 0x83e0n; // INTELx86 add ax, <number>
const AOR_ACC_VAL = 0x83c8n; // INTELx86 or ax, <number>
const XOR_ACC_VAL = 0x83f0n; // INTELx86 xor ax, <number>
const SHL_ACC_VAL = 0xc1e0n; // INTELx86 shl ax, <number>
const SHR_ACC_VAL = 0xc1e8n; // INTELx86 shr ax, <number>
const SRA_ACC_VAL = 0xc1f8n; // INTELx86 sar ax, <number>

const AND_ACC_MEM = 0x2606n; // INTELx86 and ax, [8]
const AOR_ACC_MEM = 0x0b06n; // INTELx86 or ax, [8]
const XOR_ACC_MEM = 0x3306n; // INTELx86 xor ax, [8]
const NOT_ACC_ACC = 0xf7d0n; // INTELx86 not ax
const SHL_ACC_MEM = 0xffe9n; // NOT INTELx86
const SHR_ACC_MEM = 0xffc0n; // NOT INTELx86
const SRA_ACC_MEM = 0xffc1n; // NOT INTELx86

const DIU_ACC_MEM = 0xffd6n; // NOT INTELx86
const MOU_ACC_MEM = 0xffd7n; // NOT INTELx86
const MUH_ACC_MEM = 0xffd8n; // NOT INTELx86
const MHU_ACC_MEM = 0xffd9n; // NOT INTELx86

const CMP_ACC_MEM = 0x3b06n; // INTELx86 cmp
const JMP_MEM_NUL = 0xff26n; // INTELx86 ax,
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
    [DIV_ACC_MEM]: "Fix?", // DONE
    [DIV_ACC_VAL]: "Fix?", // DONE
    [MOV_CRY_ACC]: "Not yet tested!",
    [DIU_ACC_VAL]: "", // DONE
    [MOU_ACC_VAL]: "", // DONE
    [MUH_ACC_VAL]: "", // DONE
    [MHU_ACC_VAL]: "", // DONE
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
