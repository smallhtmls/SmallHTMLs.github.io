export const JAVA_ASSEMBLE_BUTTON_TITLE_MLO = {
    en: "Build (Ctrl+B)",
    de: "Übersetzen (Strg+B)",
};

const TOKEN_START = 0x00;
let iota = 1;
const PARAM_CURLY_OPEN = iota++; // 1
const PARAM_CURLY_CLOSE = iota++; // 2
const PARAM_SQUARE_OPEN = iota++; // 3
const PARAM_SQUARE_CLOSE = iota++; // 4
const PARAM_ROUND_OPEN = iota++; // 5
const PARAM_ROUND_CLOSE = iota++; // 6
const PARAM_END = iota++; // 7
const PARAM_SAP = iota++; // 8
const PARAM_COMMA = iota++; // 9
const PARAM_PUBLIC = iota++; // 10
const PARAM_PRIVATE = iota++; // 11
const PARAM_PROTECTED = iota++; // 12
const PARAM_STATIC = iota++; // 13
const PARAM_CLASS = iota++; // 14

const DATATYPE_VOID = iota++; //15
const DATATYPE_INT = iota++; // 16
const DATATYPE_LONG = iota++; // 17
const DATATYPE_STRING = iota++; // 18
const DATATYPE_BOOLEAN = iota++; // 19

const OPERATOR_SET = iota++; // 20
const OPERATOR_ADD = iota++; // 21
const OPERATOR_SUB = iota++; // 22
const OPERATOR_ADDSET = iota++; // 23
const OPERATOR_SUBSET = iota++; // 24
const OPERATOR_GT = iota++; // 25
const OPERATOR_LT = iota++; // 26
const OPERATOR_GE = iota++; // 27
const OPERATOR_LE = iota++; // 28
const OPERATOR_EQUAL = iota++; // 29
const OPERATOR_ARROW = iota++; // 30
const OPERATOR_MULTIPLY = iota++; // 31

const INLINE_COMMENT = "//";
const START_COMMENT = "/*";
const END_COMMENT = "*/";
const STRING_SYMBOL = '"';
const CHAR_SYMBOL = "'";

function getInverseBracket(bracket) {
    switch (bracket) {
        case PARAM_ROUND_OPEN:
            return PARAM_ROUND_CLOSE;
        case PARAM_SQUARE_OPEN:
            return PARAM_SQUARE_CLOSE;
        case PARAM_CURLY_OPEN:
            return PARAM_CURLY_CLOSE;
        case OPERATOR_GT:
            return OPERATOR_LT;
    }
}

const JAVA_TOKENS = {
    [PARAM_PUBLIC]: "public",
    [PARAM_PRIVATE]: "private",
    [PARAM_PROTECTED]: "protected",
    [PARAM_STATIC]: "static",
    [PARAM_CLASS]: "class",
    [OPERATOR_ARROW]: "->",
    [PARAM_CURLY_OPEN]: "{",
    [PARAM_CURLY_CLOSE]: "}",
    [PARAM_SQUARE_OPEN]: "[",
    [PARAM_SQUARE_CLOSE]: "]",
    [PARAM_ROUND_OPEN]: "(",
    [PARAM_ROUND_CLOSE]: ")",
    [PARAM_END]: ";",
    [PARAM_SAP]: ".",
    [PARAM_COMMA]: ",",
    [DATATYPE_BOOLEAN]: "boolean ",
    [DATATYPE_VOID]: "void ",
    [DATATYPE_INT]: "int ",
    [DATATYPE_LONG]: "long ",
    [DATATYPE_STRING]: "String ",
    [OPERATOR_ADD]: "+",
    [OPERATOR_SET]: "=",
    [OPERATOR_SUB]: "-",
    [OPERATOR_ADDSET]: "+=",
    [OPERATOR_SUBSET]: "-=",
    [OPERATOR_EQUAL]: "==",
    [OPERATOR_GT]: ">",
    [OPERATOR_LT]: "<",
    [OPERATOR_GE]: ">=",
    [OPERATOR_LE]: "<=",
    [OPERATOR_MULTIPLY]: "*",
};
let operatorOrder = [
    PARAM_CURLY_OPEN,
    PARAM_SQUARE_OPEN,
    PARAM_ROUND_OPEN,
    PARAM_SAP,
    OPERATOR_MULTIPLY,
    OPERATOR_ADD,
    OPERATOR_EQUAL,
    OPERATOR_ADDSET,
    OPERATOR_SET,
    OPERATOR_ARROW,
];
const JAVA_ATTRIBUTE = [PARAM_PUBLIC, PARAM_PRIVATE, PARAM_PROTECTED, PARAM_STATIC];

export class Iterator {
    constructor(tks) {
        this.index = 0;
        this.storeIndex = 0;
        this.tokens = tks;
    }

    store() {
        this.storeIndex = this.index;
    }
    load() {
        this.index = this.storeIndex;
    }
    inc() {
        return this.index++;
    }
    dec() {
        return this.index--;
    }
    get() {
        return this.tokens[this.index];
    }
    getSubsetStoreToCurrent() {
        const rt = [];
        for (let i = this.storeIndex; i <= this.index; i++) {
            rt.push(this.tokens[i]);
        }
        return rt;
    }
    isAccess() {
        const tok = this.get();
        return tok === PARAM_PUBLIC || tok === PARAM_PRIVATE || tok === PARAM_PROTECTED;
    }
    isDt() {
        const tok = this.get();
        return tok === DATATYPE_BOOLEAN || tok === DATATYPE_INT || tok === DATATYPE_LONG || tok === DATATYPE_VOID || tok === DATATYPE_STRING;
    }
    isInside() {
        return this.index >= 0 && this.index < this.tokens.length;
    }
    isTerminator() {
        const c = this.get();
        return c === PARAM_END || c === PARAM_CURLY_CLOSE || c === PARAM_ROUND_CLOSE || c === PARAM_SQUARE_CLOSE || c === PARAM_COMMA;
    }
    skipTerminalSymbols(inc = true) {
        const currChar = this.get();
        if (currChar !== PARAM_CURLY_OPEN && currChar !== PARAM_ROUND_OPEN && currChar !== PARAM_SQUARE_OPEN) return false;
        const inverse = getInverseBracket(currChar);
        this.inc();
        while (this.get() != inverse) {
            this.skipTerminalSymbols(false);
            this.inc();
        }
        if (inc) this.inc();
        return true;
    }
    isOperator() {
        return operatorOrder.indexOf(this.get()) !== -1;
    }
    error(name) {
        throw name;
    }
    length() {
        return this.tokens.length;
    }
    show(msg = "Tokens:") {
        console.log(msg, this.tokens, "\n", JSON.stringify(this.tokens));
    }
}
class OperatorIterator extends Iterator {
    constructor(set) {
        super(set);
    }

    replaceHereToStore(obj) {
        this.tokens.splice(this.index, this.storeIndex - this.index);
        this.tokens[this.index] = obj;
    }
    set(token) {
        this.tokens[this.index] = token;
    }
    getAndRemove() {
        return this.tokens.splice(this.index, 1)[0];
    }
    getPos() {
        return this.index;
    }
    loadPos(pos) {
        this.index = pos;
    }
    posZero() {
        this.index = 0;
    }
}

const isString = 1;
const isComment = 2;
const isName = 3;
function tokenJava(txt) {
    let rt = [TOKEN_START];
    let type = 0;
    for (let i = 0; i < txt.length; i++) {
        if (txt.startsWith(INLINE_COMMENT, i)) {
            while (txt[i] != "\n" && i < txt.length) i++;
            continue;
        }
        if (txt.startsWith(START_COMMENT, i)) {
            while (!txt.endsWith(END_COMMENT, i) && i < txt.length) i++;
            continue;
        }
        if (txt[i] === STRING_SYMBOL) {
            let start = i;
            i++;
            while (txt[i] !== STRING_SYMBOL && i < txt.length) i++;
            rt.push(txt.substr(start, i - start));
            continue;
        }
        if (txt[i] === " " || txt[i] === "\t" || txt[i] === "\n" || txt[i] === "\r") {
            rt.push("");
            continue;
        }
        let longest = 0;

        for (let q in JAVA_TOKENS) {
            const p = JAVA_TOKENS[q];
            if (txt.startsWith(p, i)) {
                if (longest === 0 || JAVA_TOKENS[longest].length < p.length) {
                    longest = q;
                }
            }
        }
        if (longest) {
            rt.push(Number(longest));
            i += JAVA_TOKENS[longest].length - 1;
            continue;
        }
        if (rt[rt.length - 1].constructor.name !== "String" || rt[rt.length - 1][0] === STRING_SYMBOL) {
            rt.push("");
        }
        type = isName;
        rt[rt.length - 1] += txt[i];
    }
    rt = rt.filter(v => !(v.constructor.name === "String" && v.length === 0));
    return rt;
}
class Container {
    constructor() {
        this.children = [];
    }
    compile(it) {
        while (it.isInside()) {
            if (it.get() === TOKEN_START || JAVA_ATTRIBUTE.indexOf(it.get()) != -1) {
                it.inc();
                continue;
            }
            if (it.get() === PARAM_CURLY_OPEN) {
                it.inc();
                console.log("DT Body");
                this.children.push(new Container().compile(it));
                continue;
            }
            if (it.get() === PARAM_CLASS) {
                console.log("DT Class");
                this.children.push(new JavaClass(it).compile(it));
                continue;
            }
            it.store();
            if (it.isDt() || it.get().constructor.name === "String") {
                it.inc();
                if (it.get().constructor.name === "String") {
                    it.inc();
                    if (it.get() === PARAM_ROUND_OPEN) {
                        console.log("DT Method");
                        this.children.push(new JavaMethod().compile(it));
                    } else {
                        console.log("DT Variable");
                        this.children.push(new JavaVariable().compile(it));
                    }
                    continue;
                }
            }
            it.load();
            if (it.get() === PARAM_CURLY_CLOSE) return this;
            this.children.push(new OperatorSequence().compile(it, false));
            it.inc();
        }
        return this;
    }
    show(depth) {
        let rt = "";
        for (let o of this.children) {
            if (o && o.show) {
                rt += o.show(depth + 2);
            }
        }
        return rt;
    }
}
class JavaClass extends Container {
    constructor() {
        super();
        this.name = "";
        this.access = 0;
        this.isStatic = false;
    }
    compile(it) {
        it.store();
        while (it.isAccess() || it.get() === PARAM_STATIC) {
            it.dec();
            if (it.isAccess()) this.access = it.get();
            if (it.get() === PARAM_STATIC) this.isStatic = true;
        }
        it.load();
        it.inc();
        if (it.get().constructor.name !== "String") it.error("No Class Name");
        this.name = it.get();
        it.inc();
        it.inc();
        return super.compile(it);
    }
    show(depth) {
        return "".padStart(depth, "#") + "Class: " + this.name + "\n" + super.show(depth);
    }
}
class OperatorVariable {
    constructor(nmb) {
        this.nmb = nmb;
    }
    toString() {
        return "OperatorVar(" + this.nmb + ")";
    }
    show(depth) {
        return "".padStart(depth, "#") + "Variable: " + this.name + "\n" + super.show(depth);
    }
}
class InlineContainer extends Container {
    constructor() {
        super();
    }
    compile(it) {
        it.inc();
        return super.compile(it);
    }
    show(depth) {
        return "".padStart(depth, "#") + " Inline: \n" + super.show(depth);
    }
}
class MethodCall {
    constructor() {
        this.attributes = [];
        this.callName = null;
    }
    compile(it) {
        it.dec();
        it.dec();
        this.callName = it.get();
        it.inc();
        while (it.isInside() && it.get() != PARAM_ROUND_CLOSE) {
            it.inc();
            this.attributes.push(new OperatorSequence().compile(it));
        }
        return this;
    }
    show(depth) {
        let rt = "".padStart(depth, "#") + " Call " + this.callName + " => \n";
        for (let o of this.attributes) {
            if (o && o.show) rt += o.show(depth + 2);
        }
        return rt;
    }
}
class Operator {
    constructor(operator) {
        this.operator = operator;
        this.left = null;
        this.right = null;
    }
    setRight(right) {
        this.right = right;
    }
    setLeft(left) {
        this.left = left;
    }
    show(depth) {
        return "".padStart(depth, "#") + " (" + this.left + ") " + JAVA_TOKENS[this.operator] + " (" + this.right + ") \n";
    }
}
class OperatorSequence {
    constructor(isArrayNotation = false) {
        this.isArrayNotation = isArrayNotation;
        this.boxes = [];
        this.result = null;
    }
    compile(it) {
        if (it.isTerminator()) return this;
        it.store(); // The Store is now the start of the operator
        while (it.isInside() && !it.isTerminator()) {
            it.skipTerminalSymbols(false);
            it.inc();
        }
        console.warn(it.get());
        let i = 0;
        let subset = it.getSubsetStoreToCurrent();
        let opIt = new OperatorIterator(subset);
        opIt.show("Subset: ");
        for (const operator of operatorOrder) {
            opIt.posZero();
            while (opIt.isInside()) {
                if (opIt.get() !== operator) {
                    opIt.inc();
                    continue;
                }
                let pos = opIt.getPos();
                switch (operator) {
                    case PARAM_CURLY_OPEN:
                        this.boxes.push(new InlineContainer().compile(opIt));
                        opIt.store();
                        opIt.loadPos(pos);
                        opIt.replaceHereToStore(new OperatorVariable(this.boxes.length - 1));
                        break;
                    case PARAM_SQUARE_OPEN:
                    case PARAM_ROUND_OPEN:
                        opIt.dec();
                        let isParam = typeof opIt.get() === "string";
                        opIt.inc();
                        opIt.inc();
                        if (isParam && operator === PARAM_ROUND_OPEN) {
                            this.boxes.push(new MethodCall().compile(opIt));
                            pos--;
                        } else this.boxes.push(new OperatorSequence(operator === PARAM_SQUARE_OPEN).compile(opIt));
                        opIt.store();
                        opIt.loadPos(pos);
                        opIt.replaceHereToStore(new OperatorVariable(this.boxes.length - 1));
                        break;
                    default:
                        const op = new Operator(operator);
                        opIt.dec();
                        if (!opIt.isOperator()) {
                            op.setLeft(opIt.getAndRemove());
                        }
                        opIt.inc();
                        if (!opIt.isOperator()) {
                            op.setRight(opIt.getAndRemove());
                        }
                        this.boxes.push(op);
                        opIt.dec();
                        opIt.set(new OperatorVariable(this.boxes.length - 1));
                }
                opIt.show();
                opIt.inc();
            }
        }
        if (opIt.length() > 2) throw "Not two params left!";
        opIt.loadPos(0);
        this.result = opIt.get();
        return this;
    }
    show(depth) {
        let rt = "".padStart(depth, "#") + " Operations: \n";
        for (let o of this.boxes) {
            if (o && o.show) rt += o.show(depth + 2);
        }
        rt += "".padStart(depth, "#") + " Results in: " + this.result + "\n";
        return rt;
    }
    mkHelp() {
        return "$" + this.helperVars.length;
    }
}
class JavaVariable {
    constructor() {
        this.name = null;
        this.type = null;
        this.isStatic = false;
        this.access = 0;
        this.setup = null;
    }
    compile(it, endComma = false) {
        it.store();
        it.dec();
        this.name = it.get();
        it.dec();
        this.type = it.get();
        it.dec();
        while (it.isAccess() || it.get() === PARAM_STATIC) {
            it.dec();
            if (it.isAccess()) this.access = it.get();
            if (it.get() === PARAM_STATIC) this.isStatic = true;
        }
        it.load();
        if (!endComma && it.get() === PARAM_END) return this;
        if (endComma && it.get() === PARAM_SAP) return this;
        if (it.get() === OPERATOR_SET) {
            it.dec();
            this.setup = new OperatorSequence().compile(it);
            console.log("END VAR SETUP!", it.get());
            return this;
        }
        throw "Var not ;";
    }
    show(depth) {
        return "".padStart(depth, "#") + " Variable: " + this.name + this.setup ? " => \n" + this.setup.show(depth + 2) : "";
    }
}
class JavaMethod extends Container {
    constructor() {
        super();
        this.name = null;
        this.type = null;
        this.isStatic = false;
        this.access = 0;
    }
    compile(it) {
        it.store();
        it.dec();
        this.name = it.get();
        it.dec();
        this.type = it.get();
        it.dec();
        while (it.isAccess() || it.get() === PARAM_STATIC) {
            if (it.isAccess()) this.access = it.get();
            if (it.get() === PARAM_STATIC) this.isStatic = true;
            it.dec();
        }
        it.load();
        while (it.isInside() && !it.isTerminator()) {
            it.inc();
            it.skipTerminalSymbols();
        }
        it.inc();
        it.inc();
        return super.compile(it);
    }
    show(depth) {
        return "".padStart(depth, "#") + "Method: " + this.name + "\n" + super.show(depth);
    }
}

function strcJava(tokens) {
    console.log("Tokens:", tokens);
    let it = new Iterator(tokens);
    return new Container().compile(it);
}
function buildMethodJava(cls, mth) {}
function cpJava(strct) {
    let rt = "";
    //Find Main
    for (const o of strct.children) {
        for (const innerClass of o.children) {
            buildMethodJava(innerClass);
        }
    }
    return rt + "\nHOLD";
}

export function compileJava(txt) {
    let tokens = tokenJava(txt);
    let structo = strcJava(tokens);
    console.log(structo.show(0), structo);
    let result = cpJava(structo);
    console.log(result);
}
