let editor;
const LANG = "minimaschine.asm";
require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" } });
require(["vs/editor/editor.main"], function () {
    monaco.languages.register({ id: LANG });
    monaco.languages.setMonarchTokensProvider(LANG, {
        // Default token type
        defaultToken: "invalid",

        // Define token types
        tokenizer: {
            root: [
                [new RegExp("\\b(" + Object.values(MINIMASHINE_ASM_DECODE_TABLE_S).join("|") + ")\\b"), "keyword"],
                [/[A-Za-z0-9]*:/, "label"],
                [/[+-]?(?:0[xX][0-9A-Fa-f_]+|0[bB][01_]+|0[oO][0-7_]+|[0-9][0-9_]*)/, "number"],
                [/;.*$/, "comment"],
            ],
        },
    });
    const completes = [];
    for (let k of Object.values(MINIMASHINE_ASM_DECODE_TABLE_S)) {
        completes.push({
            label: k,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: k,
            documentation: "",
        });
    }
    monaco.languages.registerCompletionItemProvider(LANG, {
        provideCompletionItems: () => ({
            suggestions: completes,
        }),
    });
    editor = monaco.editor.create(document.getElementById("editor"), {
        value: DEFAULT_MINIASM,
        theme: "vs-light",
        language: LANG,
        fontSize: 14,
        automaticLayout: true,
    });
    editor.onDidChangeModelContent(event => {
        blinkAssemble();
    });
});
