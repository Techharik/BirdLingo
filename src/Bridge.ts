figma.showUI(__html__, { width: 320, height: 180 });

let textNodes: TextNode[] = [];
let clone: FrameNode | null = null;
let originalFrame: FrameNode | null = null;

figma.ui.onmessage = async (msg) => {

    // STEP 1 — Collect all text nodes
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

    // STEP 2 — Apply translation + Smart Resize
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

            // 🔹 Store original dimensions
            const originalHeight = node.height;
            const originalWidth = node.width;
            const originalFontSize =
                typeof node.fontSize === "number" ? node.fontSize : null;

            // 🔹 Apply translated text
            node.characters = msg.texts[i];

            // 🔹 Try height resize first
            node.textAutoResize = "HEIGHT";
            await new Promise(r => setTimeout(r, 0));

            let overflow =
                node.height > originalHeight;

            // 🔹 If still constrained, try width expansion
            if (overflow) {
                node.textAutoResize = "WIDTH_AND_HEIGHT";
                await new Promise(r => setTimeout(r, 0));

                overflow =
                    node.height > originalHeight ||
                    node.width > originalWidth;
            }

            // 🔹 If STILL too big → shrink font
            if (overflow && originalFontSize) {

                let attempts = 0;

                while (
                    attempts < 6 &&
                    (node.height > originalHeight ||
                        node.width > originalWidth)
                ) {
                    node.fontSize = node.fontSize * 0.95;
                    await new Promise(r => setTimeout(r, 0));
                    attempts++;
                }

                overflow =
                    node.height > originalHeight ||
                    node.width > originalWidth;
            }

            console.log("Overflow:", node.name, overflow);

            // 🔹 Final visual indicator
            node.fills = [{
                type: "SOLID",
                color: overflow
                    ? { r: 1, g: 0, b: 0 }  // red if broken
                    : { r: 0, g: 0, b: 0 }  // normal
            }];
        }

        figma.notify("Smart Localization Complete ✅");
    }
};