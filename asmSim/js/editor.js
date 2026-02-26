import {
    ASMOP_LABEL,
    ASMOP_NOOP,
    ASMOP_NUM,
    ASMOP_NUM_LABEL,
    MINIMASHINE_ASM_DECODE_TABLE_S,
    MINIMASHINE_ASM_OPERATOR_AMOUNT,
} from "./miniasm.js";
import { getKeyByValue, getLangKey } from "./util.js";

const IDENT = "[A-Za-z_][A-Za-z0-9_\\-\\.@#$%/]*";
const NUMBER =
    "[+-]?(?:0[xX][0-9A-Fa-f_]+|0[bB][01_]+|0[oO][0-7_]+|[0-9][0-9_]*)";

const OPCODES = Object.values(MINIMASHINE_ASM_DECODE_TABLE_S)
    .map((v) => (typeof v === "string" ? v : v.join("|")))
    .join("|");
const MINI_ASM_LANG_ID_S = "mini-asm";

const EDITOR_LANGS = {
    de: {
        mini_asm_warn_asmop_num: "Befehl erwartet eine Zahl und keine Addresse",
        mini_asm_warn_asmop_label:
            "Befehl nutzt meistens Marker anstatt eine feste Zahl",
        mini_asm_warn_asmop_noop: "Befehl benötigt keine weiteren Werte",
    },
    en: {
        mini_asm_warn_asmop_num:
            "Instruction usually doesn't use addresses but numbers instead",
        mini_asm_warn_asmop_label:
            "Instruction usually uses label instead of fixed number",
        mini_asm_warn_asmop_noop: "Instruction doesn't need another value",
    },
};

export let editor;
let currentLangType_s;

export function initEditor(onChange, onInit) {
    require.config({
        paths: {
            vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
        },
    });
    require(["vs/editor/editor.main"], function () {
        monaco.languages.register({ id: MINI_ASM_LANG_ID_S });
        monaco.languages.setMonarchTokensProvider(MINI_ASM_LANG_ID_S, {
            defaultToken: "invalid",

            tokenizer: {
                root: [
                    // Comment-only
                    [/^\s*([;#].*)$/, "comment"],

                    // Instruction with numeric operand
                    [
                        new RegExp(
                            `^(\\s*)(${OPCODES})(\\s+)(${NUMBER})(\\s*)([;#].*|)$`,
                        ),
                        [
                            "white",
                            "keyword", // opcode
                            "white",
                            "number", // immediate
                            "white",
                            "comment",
                        ],
                    ],
                    // Instruction with label operand
                    [
                        new RegExp(
                            `^(\\s*)(${OPCODES})(\\s+)(${IDENT})(\\s*)([;#].*|)$`,
                        ),
                        [
                            "white",
                            "keyword", // opcode
                            "white",
                            "regexp", // label ref
                            "white",
                            "comment",
                        ],
                    ],
                    [
                        new RegExp(`^(\\s*)(${OPCODES})(\\s*)([;#].*|)$`),
                        [
                            "white",
                            "keyword", // opcode only
                            "white",
                            "comment",
                        ],
                    ],
                    // label: WORD number
                    [
                        new RegExp(
                            `^(${IDENT})(:)(\\s*)(WORD)(\\s+)(${NUMBER})(\\s*)([;#].*|)$`,
                        ),
                        [
                            "regexp", // label
                            "delimiter", // :
                            "white",
                            "keyword", // WORD
                            "white",
                            "number",
                            "white",
                            "comment",
                        ],
                    ],

                    // label: WORD
                    [
                        new RegExp(
                            `^(${IDENT})(:)(\\s*)(WORD)(\\s*)([;#].*|)$`,
                        ),
                        [
                            "regexp",
                            "delimiter",
                            "white",
                            "keyword",
                            "white",
                            "comment",
                        ],
                    ],

                    [
                        new RegExp(`^(${IDENT})(:)(\\s*)(;.*|)$`),
                        ["regexp", "delimiter", "white", "comment"],
                    ],
                ],
            },
        });

        monaco.languages.registerCompletionItemProvider(MINI_ASM_LANG_ID_S, {
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const line_s = model.getLineContent(position.lineNumber);
                const beforeCursor = line_s
                    .slice(0, position.column - 1)
                    .trimStart();
                if (
                    beforeCursor.indexOf(";") != -1 ||
                    beforeCursor.indexOf("#") != -1
                )
                    return { suggestions: [] };
                const beforeCursorArr = beforeCursor.split(" ");
                if (beforeCursorArr[0].endsWith(":")) {
                    return {
                        suggestions: [
                            {
                                label: "WORD",
                                kind: monaco.languages.CompletionItemKind
                                    .Keyword,
                                insertText: "WORD",
                                documentation: "",
                                range: {
                                    startLineNumber: position.lineNumber,
                                    startColumn: word.startColumn,
                                    endLineNumber: position.lineNumber,
                                    endColumn: word.endColumn,
                                },
                            },
                        ],
                    };
                }
                console.log("error:", beforeCursorArr.length);
                if (beforeCursorArr.length > 1) {
                    return { suggestions: [] };
                }
                const completes = [];
                for (let z of Object.values(MINIMASHINE_ASM_DECODE_TABLE_S)) {
                    if (typeof z === "string") z = [z];
                    for (const k of z)
                        completes.push({
                            label: k,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: k,
                            documentation: "",
                            range: {
                                startLineNumber: position.lineNumber,
                                startColumn: word.startColumn,
                                endLineNumber: position.lineNumber,
                                endColumn: word.endColumn,
                            },
                        });
                }
                return {
                    suggestions: completes,
                };
            },
        });
        editor = monaco.editor.create(document.getElementById("editor"), {
            value: "",
            theme: "vs-light",
            language: MINI_ASM_LANG_ID_S,
            fontSize: 14,
            automaticLayout: true,
        });
        const model = editor.getModel();
        function computeWarnings(text) {
            const warnings = [];
            const lines = text.split("\n");
            if (currentLangType_s !== MINI_ASM_LANG_ID_S) {
                return [];
            }
            let langFy = EDITOR_LANGS[getLangKey()];
            lines.forEach((line, i) => {
                let line_as = line.split(" ").filter((a) => a);
                if (line_as.length === 0) return;
                let k = -1;
                const val_s = line_as[0];
                for (const key in MINIMASHINE_ASM_DECODE_TABLE_S) {
                    const t = MINIMASHINE_ASM_DECODE_TABLE_S[key];
                    if (
                        t === val_s ||
                        (typeof t !== "string" && t.indexOf(val_s) !== -1)
                    )
                        k = key;
                }
                let z = MINIMASHINE_ASM_OPERATOR_AMOUNT[k];
                if (z === undefined || z === ASMOP_NUM_LABEL) return;

                if (z === ASMOP_NUM && !/^([+-]|)\d+$/.test(line_as[1])) {
                    warnings.push({
                        severity: monaco.MarkerSeverity.Warning,
                        message: langFy["mini_asm_warn_asmop_num"],
                        startLineNumber: i + 1,
                        startColumn: 0 + 1,
                        endLineNumber: i + 1,
                        endColumn: 10 + 5,
                    });
                } else if (
                    z === ASMOP_LABEL &&
                    /^([+-]|)\d+$/.test(line_as[1])
                ) {
                    warnings.push({
                        severity: monaco.MarkerSeverity.Warning,
                        message: langFy["mini_asm_warn_asmop_label"],
                        startLineNumber: i + 1,
                        startColumn: 0 + 1,
                        endLineNumber: i + 1,
                        endColumn: 10 + 5,
                    });
                } else if (
                    z === ASMOP_NOOP &&
                    line_as.length > 1 &&
                    !(line_as[1].startsWith(";") || line_as[1].startsWith("#"))
                ) {
                    warnings.push({
                        severity: monaco.MarkerSeverity.Warning,
                        message: langFy["mini_asm_warn_asmop_noop"],
                        startLineNumber: i + 1,
                        startColumn: 0 + 1,
                        endLineNumber: i + 1,
                        endColumn: 10 + 5,
                    });
                }
            });
            return warnings;
        }
        function applyWarnings() {
            const text = editor.getValue();
            const markers = computeWarnings(text);

            monaco.editor.setModelMarkers(model, "mini-asm-warnings", markers);
        }

        editor.onDidChangeModelContent((event) => {
            onChange();
            applyWarnings();
        });
        onInit();
    });
}
export function setEditorLang(langId) {
    currentLangType_s = langId;
    monaco.editor.setModelLanguage(editor.getModel(), langId);
}
