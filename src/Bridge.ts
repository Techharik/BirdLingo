figma.showUI(__html__, { width: 320, height: 180 });

let textNodes: TextNode[] = [];
let clone: FrameNode | null = null;
let originalFrame: FrameNode | null = null;

figma.ui.onmessage = async (msg) => {

    // STEP 1 — Collect all text
    if (msg.type === "START_TRANSLATION") {

        const selection = figma.currentPage.selection;

        if (!selection.length || selection[0].type !== "FRAME") {
            figma.notify("Select a frame first");
            return;
        }

        originalFrame = selection[0] as FrameNode;
        clone = originalFrame.clone();

        clone.x = originalFrame.x + originalFrame.width + 100;
        clone.name = originalFrame.name + " (Translated)";

        textNodes = [];

        function collect(node: SceneNode) {
            if (node.type === "TEXT") textNodes.push(node);
            if ("children" in node) node.children.forEach(collect);
        }

        collect(clone);

        figma.ui.postMessage({
            type: "NEED_TRANSLATION",
            texts: textNodes.map(n => n.characters)
        });
    }

    // STEP 2 — Apply translated text + Smart Resize
    if (msg.type === "TRANSLATED_TEXTS" && clone && originalFrame) {

        for (let i = 0; i < textNodes.length; i++) {

            const node = textNodes[i];

            // 🔹 Load fonts safely
            if (node.fontName === figma.mixed) {
                const segments = node.getStyledTextSegments(["fontName"]);
                for (const segment of segments) {
                    await figma.loadFontAsync(segment.fontName);
                }
            } else {
                await figma.loadFontAsync(node.fontName as FontName);
            }

            // 🔹 Store original size
            const originalWidth = node.width;
            const originalHeight = node.height;

            // 🔹 Apply translation
            node.characters = msg.texts[i];

            // 🔹 Try height resize first
            node.textAutoResize = "HEIGHT";
            await new Promise(r => setTimeout(r, 0));

            let isOverflowing = detectOverflow(node);

            // 🔹 If still overflow → allow width expansion
            if (isOverflowing) {
                node.textAutoResize = "WIDTH_AND_HEIGHT";
                await new Promise(r => setTimeout(r, 0));
                isOverflowing = detectOverflow(node);
            }

            // 🔹 If STILL overflow → shrink font
            if (isOverflowing && typeof node.fontSize === "number") {
                let attempts = 0;

                while (isOverflowing && attempts < 5) {
                    node.fontSize = node.fontSize * 0.95;
                    await new Promise(r => setTimeout(r, 0));
                    isOverflowing = detectOverflow(node);
                    attempts++;
                }
            }
            console.log(isOverflowing)
            // 🔹 Final visual state
            node.fills = [{
                type: "SOLID",
                color: isOverflowing
                    ? { r: 1, g: 0, b: 0 }   // red if still broken
                    : { r: 0, g: 0, b: 0 }   // normal
            }];
        }

        figma.notify("Smart Localization Complete ✅");
    }
};


// 🔥 Real Overflow Detection
function detectOverflow(node: TextNode): boolean {

    const bounds = node.absoluteBoundingBox;
    const parentBounds = node.parent?.absoluteBoundingBox;

    if (!bounds || !parentBounds) return false;

    return (
        bounds.height > parentBounds.height ||
        bounds.width > parentBounds.width
    );
}