(function() {
  "use strict";
  figma.showUI(__html__, { width: 600, height: 400 });
  let textNodes = [];
  let clone = null;
  let originalFrame = null;
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "TRANSLATE_FRAME") {
      let collect2 = function(node) {
        if (node.type === "TEXT") textNodes.push(node);
        if ("children" in node) node.children.forEach(collect2);
      };
      const selection = figma.currentPage.selection;
      if (!selection.length || selection[0].type !== "FRAME") {
        figma.notify("Select a frame first");
        return;
      }
      originalFrame = selection[0];
      clone = originalFrame.clone();
      textNodes = [];
      collect2(clone);
      figma.ui.postMessage({
        type: "SEND_TO_BACKEND",
        texts: textNodes.map((n) => n.characters),
        language: msg.language
      });
    }
    if (msg.type === "TRANSLATED_TEXTS" && clone && originalFrame) {
      for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        if (node.fontName === figma.mixed) {
          const segments = node.getStyledTextSegments(["fontName"]);
          for (const segment of segments) {
            await figma.loadFontAsync(segment.fontName);
          }
        } else {
          await figma.loadFontAsync(node.fontName);
        }
        node.characters = msg.texts[i];
      }
      clone.name = `${originalFrame.name} (${msg.language})`;
      figma.notify("Translation complete ✅");
    }
  };
})();
