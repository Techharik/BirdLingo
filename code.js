figma.showUI(__html__, { width: 400, height: 300 });
var selection = figma.currentPage.selection;
if (selection.length === 0) {
    figma.notify("Please select a frame.");
    figma.closePlugin();
}
// Only take first selected node
var selectedNode = selection[0];
if (selectedNode.type !== "FRAME") {
    figma.notify("Please select a FRAME.");
    figma.closePlugin();
}
function getTextNodes(node, texts) {
    if (texts === void 0) { texts = []; }
    if (node.type === "TEXT") {
        texts.push(node.characters);
    }
    if ("children" in node) {
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            getTextNodes(child, texts);
        }
    }
    return texts;
}
var extractedTexts = getTextNodes(selectedNode);
figma.ui.postMessage({ type: "TEXT_RESULT", data: extractedTexts });
console.log("Extracted Texts:", extractedTexts);
