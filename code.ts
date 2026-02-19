
figma.showUI(__html__, { width: 400, height: 300 });

const selection = figma.currentPage.selection;

if (selection.length === 0) {
    figma.notify("Please select a frame.");
    figma.closePlugin();
}

// Only take first selected node
const selectedNode = selection[0];

if (selectedNode.type !== "FRAME") {
    figma.notify("Please select a FRAME.");
    figma.closePlugin();
    throw new Error("Not a frame");

}
const frame = selectedNode as FrameNode;

function randomWord() {
    const words = ["Alpha", "Beta", "Gamma", "Delta"];
    return words[Math.floor(Math.random() * words.length)];
}

async function replaceText(node: SceneNode, texts: string[] = []) {

    if (node.type === "TEXT") {
        await figma.loadFontAsync(node.fontName as FontName);
        node.characters = randomWord();
    }
    if ("children" in node) {
        for (const child of node.children) {
            replaceText(child, texts);
        }
    }

}


async function previewWithRandomText(frame: FrameNode) {
    const clone = frame.clone();

    await replaceText(clone);

    const bytes = await clone.exportAsync({
        format: "PNG",
        constraint: { type: "WIDTH", value: 400 }
    });

    clone.remove();

    figma.ui.postMessage({
        type: "PREVIEW",
        image: figma.base64Encode(bytes)
    });
    let image = figma.base64Encode(bytes)
    console.log(image)
}


previewWithRandomText(selectedNode)