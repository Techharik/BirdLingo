

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
const clone = frame.clone();


async function collectTextNodes(node: SceneNode, list: TextNode[] = []) {
    if (node.type === "TEXT") {
        list.push(node);
    }

    if ("children" in node) {
        for (const child of node.children) {
            await collectTextNodes(child, list);
        }
    }

    return list;
}

figma.ui.onmessage = async (msg) => {
    if (msg.type === "UI_READY") {
        console.log('hi')
        const textNodes = await collectTextNodes(clone);

        figma.ui.postMessage({
            type: "TRANSLATE",
            texts: textNodes.map(n => n.characters)
        });
    }

    if (msg.type === "TRANSLATED") {
        const textNodes = await collectTextNodes(clone);

        for (let i = 0; i < textNodes.length; i++) {
            const node = textNodes[i];

            await figma.loadFontAsync(node.fontName as FontName);
            node.characters = msg.texts[i];
        }

        const bytes = await clone.exportAsync({
            format: "PNG",
            constraint: { type: "WIDTH", value: 400 }
        });

        clone.remove();

        figma.ui.postMessage({
            type: "PREVIEW",
            image: figma.base64Encode(bytes)
        });
    }
};