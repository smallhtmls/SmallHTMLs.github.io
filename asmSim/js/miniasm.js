function buildOpcode(primary, secondary) {
    return (primary << 8n) | secondary;
}

export const MINIASM_ASSEMBLE_BUTTON_TITLE_MLO = {
    en: "Assemble (Ctrl+B)",
    de: "Assemblieren (Strg+B)",
};

export const REGISTER = {
    AX: 0b000n,
    BX: 0b011n,
    CX: 0b001n,
    DX: 0b010n,
    SP: 0b100n,
    BP: 0b101n,
    SI: 0b110n,
    DI: 0b111n,
};

export const OPCODE = {
    STOP_SYMBOL: 0x00n, // NOT INTELx86
    MOV_VAL_ACC: 0xb8n, // INTELx86 mov ax, <op1>
    MOV_MEM_ACC: 0xa1n, // INTELx86 mov ax, [<addr>]
    MOV_ACC_MEM: 0xa3n, // INTELx86 mov [<addr>], ax
    ADD_ACC_MEM: 0x0306n, // INTELx86 add ax, [<addr>]
    SUB_ACC_MEM: 0x2b06n, // INTELx86 sub ax, [<addr>]
    MUL_ACC_MEM: 0xf726n, // INTELx86 mul word [<addr>]
    DIV_ACC_MEM: 0xf736n, // INTELx86 div word [<addr>]
    MOD_ACC_MEM: 0xff01n,

    ADD_ACC_VAL: 0x83c0n, // INTELx86 add ax, <op1>
    SUB_ACC_VAL: 0x83e8n, // INTELx86 sub ax, <op1>
    MUL_ACC_VAL: 0x6bc0n, // INTELx86 imul ax, <op1>
    DIV_ACC_VAL: 0xffd4n, // NOT INTELx86
    MOD_ACC_VAL: 0xffd5n, // NOT INTELx86
    DIU_ACC_VAL: 0xffe0n, // NOT INTELx86
    MOU_ACC_VAL: 0xffe1n, // NOT INTELx86
    MUH_ACC_VAL: 0xffe2n, //
    MHU_ACC_VAL: 0xffe3n,
    CMP_ACC_VAL: 0x83f8n, // INTELx86 cmp ax, <op1>

    AND_ACC_VAL: 0x83e0n, // INTELx86 add ax, <op1>
    AOR_ACC_VAL: 0x83c8n, // INTELx86 or ax, <op1>
    XOR_ACC_VAL: 0x83f0n, // INTELx86 xor ax, <op1>
    SHL_ACC_VAL: 0xc1e0n, // INTELx86 shl ax, <op1>
    SHR_ACC_VAL: 0xc1e8n, // INTELx86 shr ax, <op1>
    SRA_ACC_VAL: 0xc1f8n, // INTELx86 sar ax, <op1>

    AND_ACC_MEM: 0x2606n, // INTELx86 and ax, [8]
    AOR_ACC_MEM: 0x0b06n, // INTELx86 or ax, [8]
    XOR_ACC_MEM: 0x3306n, // INTELx86 xor ax, [8]
    NOT_ACC_ACC: 0xf7d0n, // INTELx86 not ax
    SHL_ACC_MEM: 0xffe9n, // NOT INTELx86
    SHR_ACC_MEM: 0xffc0n, // NOT INTELx86
    SRA_ACC_MEM: 0xffc1n, // NOT INTELx86

    DIU_ACC_MEM: 0xffd6n, // NOT INTELx86
    MOU_ACC_MEM: 0xffd7n, // NOT INTELx86
    MUH_ACC_MEM: 0xffd8n, // NOT INTELx86
    MHU_ACC_MEM: 0xffd9n, // NOT INTELx86

    CMP_ACC_MEM: 0x3b06n, // INTELx86 cmp
    JMP_MEM_NUL: 0xff26n, // INTELx86 ax,
    JLT_MEM_NUL: 0xfff4n,
    JGT_MEM_NUL: 0xfff5n,
    JLE_MEM_NUL: 0xfff6n,
    JGE_MEM_NUL: 0xfff7n,
    JEQ_MEM_NUL: 0xfff8n,
    JNE_MEM_NUL: 0xfff9n,
    JOV_MEM_NUL: 0xf0f0n,
    JOC_MEM_NUL: 0xf0f1n,
    CON_TIN_UE0: 0x0001n,
    MOV_CRY_ACC: 0x0002n,
    CAL_LTO_STP: 0x0003n,
    RET_NTO_STP: 0x0004n,
    PUS_HTO_STA: 0x0005n,
    POP_FRM_STA: 0x0006n,
    RES_ERV_ADR: 0x0007n,
    REL_EAS_ADR: 0x0008n,
    //
    MOV_SP_MEM: buildOpcode(0x89n, 0b01_000_100n),
    MOV_MEM_SP: buildOpcode(0x8bn, 0b01_000_100n),
    MOV_VAL_BX: 0xbb00n,
    MOV_MEM_BX: buildOpcode(0x8bn, 0b00_011_110n),
    MOV_BX_MEM: buildOpcode(0x89n, 0b00_011_110n),
    XCHG_ACC_BX: buildOpcode(0x87n, 0b11_000_011n),
};
export const CODE_DESCRIPTION_S_OLD = {
    //

    //
    [OPCODE.ADD_ACC_VAL]: "acc = acc + op1",
    [OPCODE.SUB_ACC_VAL]: "acc = acc - op1",
    [OPCODE.DIV_ACC_VAL]: "acc = acc / op1",
    [OPCODE.MOD_ACC_VAL]: "acc <(Remainder)= acc / op1",
    //
    [OPCODE.MUH_ACC_MEM]: "(Should work! Not tested!)", // DONE
    [OPCODE.MHU_ACC_MEM]: " (Should work! Not tested!)", // DONE
};
export const CODE_DESCRIPTION_S = { en: {}, de: {} };
CODE_DESCRIPTION_S.de = {
    // MEMORY
    [OPCODE.MOV_CRY_ACC]:
        "Lädt das Carry-Flag in den acc (0/1) – noch nicht getestet!",
    [OPCODE.MOV_MEM_ACC]: "Lädt den Wert einer Speicherzelle in den acc",
    [OPCODE.MOV_VAL_ACC]: "Lädt einen Wert in den acc",
    [OPCODE.MOV_ACC_MEM]: "Speichert den Wert des acc in einer Speicherzelle",
    // MATH
    [OPCODE.ADD_ACC_MEM]: "acc = acc + [mem]",
    [OPCODE.SUB_ACC_MEM]: "acc = acc - [mem]",
    [OPCODE.MUL_ACC_MEM]: "acc = acc * [mem]",
    [OPCODE.DIV_ACC_MEM]: "acc = acc / [mem]",
    [OPCODE.MOD_ACC_MEM]: "acc <(Rest)= acc / [mem]",
    //
    [OPCODE.ADD_ACC_VAL]: "acc = acc + op1",
    [OPCODE.SUB_ACC_VAL]: "acc = acc - op1",
    [OPCODE.MUL_ACC_VAL]: "acc = acc * op1",
    [OPCODE.DIV_ACC_VAL]: "acc = acc / op1",
    [OPCODE.MOD_ACC_VAL]: "acc <(Rest)= acc / op1",

    [OPCODE.DIU_ACC_VAL]: "acc = acc vorzeichenlos / op1", // DONE
    [OPCODE.MOU_ACC_VAL]: "acc <(Rest der vorzeichenlosen Division)= acc / op1", // DONE
    [OPCODE.MUH_ACC_VAL]: "acc = (acc * op1) < obere 16 Bit von 32 Bit", // DONE
    [OPCODE.MHU_ACC_VAL]:
        "acc = (acc vorzeichenlos * op1) < obere 16 Bit von 32 Bit", // DONE
    [OPCODE.CMP_ACC_VAL]:
        "Vergleicht den acc mit einem Wert und speichert das Ergebnis in den Flags (acc - op1)", // DONE
    [OPCODE.DIU_ACC_MEM]: "acc = acc vorzeichenlos / [mem]", // DONE
    [OPCODE.MOU_ACC_MEM]:
        "acc <(Rest der vorzeichenlosen Division)= acc / [mem]", // DONE
    [OPCODE.MUH_ACC_MEM]: "acc = (acc * [mem]) < obere 16 Bit von 32 Bit", // DONE
    [OPCODE.MHU_ACC_MEM]:
        "acc = (acc vorzeichenlos * [mem]) < obere 16 Bit von 32 Bit", // DONE
    [OPCODE.AND_ACC_VAL]: "UND-Operation der Bits von acc und op1", // DONE
    [OPCODE.AOR_ACC_VAL]: "ODER-Operation der Bits von acc und op1", // DONE
    [OPCODE.XOR_ACC_VAL]: "Exklusiv-ODER-Operation der Bits von acc und op1", // DONE
    [OPCODE.SHL_ACC_VAL]: "Verschiebt alle Bits von acc um op1 nach links", // DONE
    [OPCODE.SHR_ACC_VAL]: "Verschiebt alle Bits von acc um op1 nach rechts", // DONE
    [OPCODE.SRA_ACC_VAL]:
        "Verschiebt alle Bits von acc um op1 nach rechts und erhält das Vorzeichen", // DONE
    [OPCODE.AND_ACC_MEM]: "UND-Operation der Bits von acc und [mem]", // DONE
    [OPCODE.AOR_ACC_MEM]: "ODER-Operation der Bits von acc und [mem]", // DONE
    [OPCODE.XOR_ACC_MEM]: "Exklusiv-ODER-Operation der Bits von acc und [mem]", // DONE
    [OPCODE.SHL_ACC_MEM]: "Verschiebt alle Bits von acc um [mem] nach links", // DONE
    [OPCODE.SHR_ACC_MEM]: "Verschiebt alle Bits von acc um [mem] nach rechts", // DONE
    [OPCODE.SRA_ACC_MEM]:
        "Verschiebt alle Bits von acc um [mem] nach rechts und erhält das Vorzeichen", // DONE
    [OPCODE.NOT_ACC_ACC]: "Invertiert alle Bits im acc", // DONE
    [OPCODE.CMP_ACC_MEM]:
        "Vergleicht den acc mit einem Wert und speichert das Ergebnis in den Flags (acc - [mem])", // DONE
    [OPCODE.JMP_MEM_NUL]: "Springt zur Adresse", // DONE
    [OPCODE.JLT_MEM_NUL]:
        "Springt zur Adresse, wenn kleiner als (nicht Null- und Negativ-Flag)", // DONE
    [OPCODE.JGT_MEM_NUL]:
        "Springt zur Adresse, wenn größer als (nicht Null- und kein Negativ-Flag)", // DONE
    [OPCODE.JLE_MEM_NUL]:
        "Springt zur Adresse, wenn kleiner oder gleich (Null- oder Negativ-Flag)", // DONE
    [OPCODE.JGE_MEM_NUL]:
        "Springt zur Adresse, wenn größer oder gleich (Null- oder kein Negativ-Flag)", // DONE
    [OPCODE.JEQ_MEM_NUL]: "Springt zur Adresse, wenn gleich (Null-Flag)", // DONE
    [OPCODE.JNE_MEM_NUL]: "Springt zur Adresse, wenn ungleich (kein Null-Flag)", // DONE
    [OPCODE.JOC_MEM_NUL]:
        "Springt zur Adresse (op1), wenn das Carry-Flag gesetzt ist", // DONE
    [OPCODE.JOV_MEM_NUL]:
        "Springt zur Adresse (op1), wenn das Overflow-Flag gesetzt ist", // DONE
    [OPCODE.CON_TIN_UE0]: "Ignoriert die Instruktion! – KEINE Operation", // DONE
    [OPCODE.STOP_SYMBOL]: "Stoppt das Programm und setzt den PC zurück", // DONE
    [OPCODE.CAL_LTO_STP]:
        "Speichert den nächsten PC auf dem Stack und springt zur angegebenen Adresse",
    [OPCODE.RET_NTO_STP]:
        "Entnimmt eine Adresse vom Stack und setzt den PC darauf",
    [OPCODE.PUS_HTO_STA]: "Legt den Wert des acc auf den Stack und sp -= 1",
    [OPCODE.POP_FRM_STA]: "Holt einen Wert vom Stack in den acc und sp += 1",
    [OPCODE.RES_ERV_ADR]:
        "Verschiebt den Stackpointer nach oben um den Wert (sp -= op1)",
    [OPCODE.REL_EAS_ADR]:
        "Verschiebt den Stackpointer nach unten um den Wert (sp += op1)",
    [OPCODE.MOV_VAL_BX]: "Lädt einen Wert in das bx-Register",
    [OPCODE.MOV_BX_MEM]:
        "Speichert den Wert des bx-Registers in einer Speicherzelle",
    [OPCODE.MOV_MEM_BX]: "Lädt den Wert einer Speicherzelle in den acc",
    [OPCODE.XCHG_ACC_BX]: "Tauscht die Werte von acc und bx",
    [OPCODE.MOV_MEM_SP]:
        "Lädt einen Wert in den acc. Speicheradresse ist Stackpointer - op1",
    [OPCODE.MOV_SP_MEM]:
        "Speichert den Wert des acc im Speicher. Speicheradresse ist Stackpointer - op1",
};

CODE_DESCRIPTION_S.en = {
    // MEMORY
    [OPCODE.MOV_CRY_ACC]: "Load Carry Flag to acc (0/1) - Not yet tested!",
    [OPCODE.MOV_MEM_ACC]: "Loads the value of a storage cell to the acc",
    [OPCODE.MOV_VAL_ACC]: "Loads a value to the acc",
    [OPCODE.MOV_ACC_MEM]: "Stores the value of the acc into a storage cell",
    // MATH
    [OPCODE.ADD_ACC_MEM]: "acc = acc + [mem]",
    [OPCODE.SUB_ACC_MEM]: "acc = acc - [mem]",
    [OPCODE.MUL_ACC_MEM]: "acc = acc * [mem]",
    [OPCODE.DIV_ACC_MEM]: "acc = acc / [mem]",
    [OPCODE.MOD_ACC_MEM]: "acc <(Remainder)= acc / [mem]",
    //
    [OPCODE.ADD_ACC_VAL]: "acc = acc + op1",
    [OPCODE.SUB_ACC_VAL]: "acc = acc - op1",
    [OPCODE.MUL_ACC_VAL]: "acc = acc * op1",
    [OPCODE.DIV_ACC_VAL]: "acc = acc / op1",
    [OPCODE.MOD_ACC_VAL]: "acc <(Remainder)= acc / op1",

    [OPCODE.DIU_ACC_VAL]: "acc = acc unsigned/ op1", // DONE
    [OPCODE.MOU_ACC_VAL]: "acc <(Remainder of unsigned divide)= acc / op1", // DONE
    [OPCODE.MUH_ACC_VAL]: "acc = (acc * op1) < Upper 16 bits of 32 bit", //DONE
    [OPCODE.MHU_ACC_VAL]: "acc = (acc unsigned* op1) < Upper 16 bits of 32 bit", // DONE
    [OPCODE.CMP_ACC_VAL]:
        "Compares the acc with a value to store in flags (acc - op1)", // DONE
    [OPCODE.DIU_ACC_MEM]: "acc = acc unsigned/ [mem]", // DONE
    [OPCODE.MOU_ACC_MEM]: "acc <(Remainder of unsigned divide)= acc / [mem]", // DONE
    [OPCODE.MUH_ACC_MEM]: "acc = (acc * [mem]) < Upper 16 bits of 32 bit", // DONE
    [OPCODE.MHU_ACC_MEM]:
        "acc = (acc unsigned* [mem]) < Upper 16 bits of 32 bit", // DONE
    [OPCODE.AND_ACC_VAL]: "and operation of bits with acc and op1", // DONE
    [OPCODE.AOR_ACC_VAL]: "or operation of bits with acc and op1", //DONE
    [OPCODE.XOR_ACC_VAL]: "Exclusive or operation of bits with acc and op1", // DONE
    [OPCODE.SHL_ACC_VAL]: "Shifts all bits of acc to the left by op1", // DONE
    [OPCODE.SHR_ACC_VAL]: "Shifts all bits of acc to the right by op1", // DONE
    [OPCODE.SRA_ACC_VAL]:
        "Shifts all bits of acc to the right by op1 and keeps the sign", // DONE
    [OPCODE.AND_ACC_MEM]: "and operation of bits with acc and [mem]", // DONE
    [OPCODE.AOR_ACC_MEM]: "or operation of bits with acc and [mem]", //DONE
    [OPCODE.XOR_ACC_MEM]: "Exclusive or operation of bits with acc and [mem]", // DONE
    [OPCODE.SHL_ACC_MEM]: "Shifts all bits of acc to the left by [mem]", // DONE
    [OPCODE.SHR_ACC_MEM]: "Shifts all bits of acc to the right by [mem]", // DONE
    [OPCODE.SRA_ACC_MEM]:
        "Shifts all bits of acc to the right by [mem] and keeps the sign ", // DONE
    [OPCODE.NOT_ACC_ACC]: "Inverts all bits in acc", // DONE
    [OPCODE.CMP_ACC_MEM]:
        "Compares the acc with a value to store in flags (acc - [mem])", // DONE
    [OPCODE.JMP_MEM_NUL]: "Jumps to address", // DONE
    [OPCODE.JLT_MEM_NUL]:
        "Jumps to address if less than (not zero and negative flag)", // DONE
    [OPCODE.JGT_MEM_NUL]:
        "Jumps to address if greater than (not zero and not negative flag)", // DONE
    [OPCODE.JLE_MEM_NUL]:
        "Jumps to address if less or equal (zero or negative flag)", // DONE
    [OPCODE.JGE_MEM_NUL]:
        "Jumps to address if greater or equal (zero or not negative flag)", // DONE
    [OPCODE.JEQ_MEM_NUL]: "Jumps to address if equal (zero flag)", // DONE
    [OPCODE.JNE_MEM_NUL]: "Jumps to address if not equal (no zero flag)", // DONE
    [OPCODE.JOC_MEM_NUL]: "Jumps to address (op1) if carry flag is set", // DONE
    [OPCODE.JOV_MEM_NUL]: "Jumps to address (op1) if overflow flag is set", // DONE
    [OPCODE.CON_TIN_UE0]: "Ignore instruction! - NO OPeration", // DONE
    [OPCODE.STOP_SYMBOL]: "Stops the program, and clears the pc", // DONE
    [OPCODE.CAL_LTO_STP]:
        "Stores the next pc on the stack and jumps to the address given",
    [OPCODE.RET_NTO_STP]: "Pops a address from the stack and set the pc to it.",
    [OPCODE.PUS_HTO_STA]:
        "Pushes the value of the acc to the stack and sp -= 1",
    [OPCODE.POP_FRM_STA]: "Pop the value from the stack to the acc and sp += 1",
    [OPCODE.RES_ERV_ADR]: "Moves the sp up by the values (sp -= op1)",
    [OPCODE.REL_EAS_ADR]: "Moves the sp down by the value (sp += op1)",
    [OPCODE.MOV_VAL_BX]: "Loads a value to the bx register",
    [OPCODE.MOV_BX_MEM]:
        "Stores the value of the bx register into a storage cell",
    [OPCODE.MOV_MEM_BX]: "Loads the value of a storage cell to the acc",
    [OPCODE.XCHG_ACC_BX]: "XChanges the values in the acc and the bx register",
    [OPCODE.MOV_MEM_SP]:
        "Loads a value to acc. Memory address is stackpointer - op1",
    [OPCODE.MOV_SP_MEM]:
        "Stores the value of acc to memory. Memory address is stackpointer - op1",
};

export const MINIMASHINE_ASM_DECODE_TABLE_S = {
    // MEMORY
    [OPCODE.MOV_VAL_ACC]: "LOADI", // DONE | CHECK
    [OPCODE.MOV_MEM_ACC]: "LOAD", // DONE | CHECK
    [OPCODE.MOV_ACC_MEM]: "STORE", // DONE | CHECK
    [OPCODE.MOV_CRY_ACC]: "LOADC", //DONE |
    // MATH
    [OPCODE.ADD_ACC_MEM]: "ADD", // DONE
    [OPCODE.SUB_ACC_MEM]: "SUB", // DONE
    [OPCODE.MUL_ACC_MEM]: "MUL", // DONE
    [OPCODE.DIV_ACC_MEM]: "DIV", // DONE
    [OPCODE.MOD_ACC_MEM]: "MOD", // DONE
    //
    [OPCODE.ADD_ACC_VAL]: "ADDI", // DONE
    [OPCODE.SUB_ACC_VAL]: "SUBI", // DONE
    [OPCODE.MUL_ACC_VAL]: "MULI", // DONE
    [OPCODE.DIV_ACC_VAL]: "DIVI", // DONE
    [OPCODE.MOD_ACC_VAL]: "MODI", // DONE
    [OPCODE.DIU_ACC_VAL]: "DIVUI", // DONE
    [OPCODE.MOU_ACC_VAL]: "MODUI", // DONE
    [OPCODE.MUH_ACC_VAL]: "MULHI", //DONE
    [OPCODE.MHU_ACC_VAL]: "MULHUI", // DONE
    [OPCODE.CMP_ACC_VAL]: "CMPI", // DONE
    [OPCODE.DIU_ACC_MEM]: "DIVU", // DONE
    [OPCODE.MOU_ACC_MEM]: "MODU", // DONE
    [OPCODE.MUH_ACC_MEM]: "MULH", // DONE
    [OPCODE.MHU_ACC_MEM]: "MULHU", // DONE
    [OPCODE.AND_ACC_VAL]: "ANDI", //DONE
    [OPCODE.AOR_ACC_VAL]: "ORI", //DONE
    [OPCODE.XOR_ACC_VAL]: "XORI", // DONE
    [OPCODE.SHL_ACC_VAL]: "SHLI", //DONE
    [OPCODE.SHR_ACC_VAL]: "SHRI", //DONE
    [OPCODE.SRA_ACC_VAL]: "SHRAI", //DONE
    [OPCODE.AND_ACC_MEM]: "AND", // DONE
    [OPCODE.AOR_ACC_MEM]: "OR", //DONE
    [OPCODE.XOR_ACC_MEM]: "XOR", // DONE
    [OPCODE.SHL_ACC_MEM]: "SHL", // DONE
    [OPCODE.SHR_ACC_MEM]: "SHR", // DONE
    [OPCODE.SRA_ACC_MEM]: "SHRA", // DONE
    [OPCODE.NOT_ACC_ACC]: "NOT", // DONE
    [OPCODE.CMP_ACC_MEM]: "CMP", // DONE
    [OPCODE.JMP_MEM_NUL]: ["JMP", "JUMP"], // DONE
    [OPCODE.JLT_MEM_NUL]: "JLT", // DONE
    [OPCODE.JGT_MEM_NUL]: "JGT", // DONE
    [OPCODE.JLE_MEM_NUL]: "JLE", // DONE
    [OPCODE.JGE_MEM_NUL]: "JGE", // DONE
    [OPCODE.JEQ_MEM_NUL]: "JEQ", // DONE
    [OPCODE.JNE_MEM_NUL]: "JNE", // DONE
    [OPCODE.JOC_MEM_NUL]: "JOC", // DONE
    [OPCODE.JOV_MEM_NUL]: "JOV", // DONE
    [OPCODE.CON_TIN_UE0]: "NOOP", // DONE
    [OPCODE.STOP_SYMBOL]: "HOLD", // DONE
    [OPCODE.CAL_LTO_STP]: ["CALL", "JSR"],
    [OPCODE.RET_NTO_STP]: ["RETURN", "RTS"],
    [OPCODE.PUS_HTO_STA]: "PUSH",
    [OPCODE.POP_FRM_STA]: "POP",
    [OPCODE.RES_ERV_ADR]: "RSV",
    [OPCODE.REL_EAS_ADR]: "REL",
    [OPCODE.MOV_VAL_BX]: "LOADBI",
    [OPCODE.MOV_BX_MEM]: "STOREB",
    [OPCODE.MOV_MEM_BX]: "LOADB",
    [OPCODE.XCHG_ACC_BX]: "XCHG",
    [OPCODE.MOV_MEM_SP]: "GETSTACK",
    [OPCODE.MOV_SP_MEM]: "SETSTACK",
};

export const ASMOP_NOOP = 0;
export const ASMOP_NUM = 1;
export const ASMOP_LABEL = 2;
export const ASMOP_NUM_LABEL = 3;

export const MINIMASHINE_ASM_OPERATOR_AMOUNT = {
    // MEMORY
    [OPCODE.MOV_VAL_ACC]: ASMOP_NUM, // DONE | CHECK
    [OPCODE.MOV_MEM_ACC]: ASMOP_NUM_LABEL, // DONE | CHECK
    [OPCODE.MOV_ACC_MEM]: ASMOP_NUM_LABEL, // DONE | CHECK
    [OPCODE.MOV_CRY_ACC]: ASMOP_NOOP, //DONE |
    // MATH
    [OPCODE.ADD_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.SUB_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.MUL_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.DIV_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.MOD_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    //
    [OPCODE.ADD_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.SUB_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.MUL_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.DIV_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.MOD_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.DIU_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.MOU_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.MUH_ACC_VAL]: ASMOP_NUM, //DONE
    [OPCODE.MHU_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.CMP_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.DIU_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.MOU_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.MUH_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.MHU_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.AND_ACC_VAL]: ASMOP_NUM, //DONE
    [OPCODE.AOR_ACC_VAL]: ASMOP_NUM, //DONE
    [OPCODE.XOR_ACC_VAL]: ASMOP_NUM, // DONE
    [OPCODE.SHL_ACC_VAL]: ASMOP_NUM, //DONE
    [OPCODE.SHR_ACC_VAL]: ASMOP_NUM, //DONE
    [OPCODE.SRA_ACC_VAL]: ASMOP_NUM, //DONE
    [OPCODE.AND_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.AOR_ACC_MEM]: ASMOP_NUM_LABEL, //DONE
    [OPCODE.XOR_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.SHL_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.SHR_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.SRA_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.NOT_ACC_ACC]: ASMOP_NOOP, // DONE
    [OPCODE.CMP_ACC_MEM]: ASMOP_NUM_LABEL, // DONE
    [OPCODE.JMP_MEM_NUL]: ASMOP_LABEL, // DONE
    [OPCODE.JLT_MEM_NUL]: ASMOP_LABEL, // DONE
    [OPCODE.JGT_MEM_NUL]: ASMOP_LABEL, // DONE
    [OPCODE.JLE_MEM_NUL]: ASMOP_LABEL, // DONE
    [OPCODE.JGE_MEM_NUL]: ASMOP_LABEL, // DONE
    [OPCODE.JEQ_MEM_NUL]: ASMOP_LABEL, // DONE
    [OPCODE.JNE_MEM_NUL]: ASMOP_LABEL, // DONE
    [OPCODE.JOC_MEM_NUL]: ASMOP_LABEL, // DONE
    [OPCODE.JOV_MEM_NUL]: ASMOP_LABEL, // DONE
    [OPCODE.CON_TIN_UE0]: ASMOP_NOOP, // DONE
    [OPCODE.STOP_SYMBOL]: ASMOP_NOOP, // DONE
    [OPCODE.CAL_LTO_STP]: ASMOP_LABEL,
    [OPCODE.RET_NTO_STP]: ASMOP_NOOP,
    [OPCODE.PUS_HTO_STA]: ASMOP_NOOP,
    [OPCODE.POP_FRM_STA]: ASMOP_NOOP,
    [OPCODE.RES_ERV_ADR]: ASMOP_NOOP,
    [OPCODE.REL_EAS_ADR]: ASMOP_NOOP,
    [OPCODE.MOV_VAL_BX]: ASMOP_NUM,
    [OPCODE.MOV_BX_MEM]: ASMOP_NUM_LABEL,
    [OPCODE.MOV_MEM_BX]: ASMOP_NUM_LABEL,
    [OPCODE.XCHG_ACC_BX]: ASMOP_NOOP,
    [OPCODE.MOV_MEM_SP]: ASMOP_NUM,
    [OPCODE.MOV_SP_MEM]: ASMOP_NUM,
};
