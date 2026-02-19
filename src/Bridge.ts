figma.showUI(__html__, { width: 500, height: 600 });

figma.ui.onmessage = async (msg) => {

    if (msg.type === "EXTRACT_KEYS") {

        const selection = figma.currentPage.selection;

        if (!selection.length || selection[0].type !== "FRAME") {
            figma.notify("Select a frame");
            return;
        }

        const frame = selection[0] as FrameNode;

        const result: { key: string; text: string }[] = [];

        function collect(node: SceneNode, frameName: string) {

            if (node.type === "TEXT") {

                const key = `${sanitize(frameName)}.${sanitize(node.name)}`;

                result.push({
                    key,
                    text: node.characters
                });
            }

            if ("children" in node) {
                node.children.forEach(child => collect(child, frameName));
            }
        }

        collect(frame, frame.name);

        figma.ui.postMessage({
            type: "KEYS_RESULT",
            data: result
        });
    }

    // When UI sends cleaned keys + selected languages
    if (msg.type === "GENERATE_JSON") {

        const { items, languages } = msg;

        // items = cleaned list from UI

        figma.ui.postMessage({
            type: "START_DOWNLOAD",
            items,
            languages
        });
    }
};

function sanitize(name: string) {
    return name.trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");
}
