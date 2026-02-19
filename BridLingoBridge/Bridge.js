(function() {
  "use strict";
  figma.showUI(__html__, { width: 500, height: 600 });
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "EXTRACT_KEYS") {
      let collect2 = function(node, frameName) {
        if (node.type === "TEXT") {
          const key = `${sanitize(frameName)}.${sanitize(node.name)}`;
          result.push({
            key,
            text: node.characters
          });
        }
        if ("children" in node) {
          node.children.forEach((child) => collect2(child, frameName));
        }
      };
      const selection = figma.currentPage.selection;
      if (!selection.length || selection[0].type !== "FRAME") {
        figma.notify("Select a frame");
        return;
      }
      const frame = selection[0];
      const result = [];
      collect2(frame, frame.name);
      figma.ui.postMessage({
        type: "KEYS_RESULT",
        data: result
      });
    }
    if (msg.type === "GENERATE_JSON") {
      const { items, languages } = msg;
      figma.ui.postMessage({
        type: "START_DOWNLOAD",
        items,
        languages
      });
    }
  };
  function sanitize(name) {
    return name.trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");
  }
})();
