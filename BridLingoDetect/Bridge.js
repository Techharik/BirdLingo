(function() {
  "use strict";
  figma.showUI(__html__, { width: 320, height: 180 });
  let textNodes = [];
  let clone = null;
  let originalFrame = null;
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "START_TRANSLATION") {
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
      clone.x = originalFrame.x + originalFrame.width + 100;
      clone.name = originalFrame.name + " (Translated)";
      textNodes = [];
      collect2(clone);
      figma.ui.postMessage({
        type: "NEED_TRANSLATION",
        texts: textNodes.map((n) => n.characters)
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
        node.width;
        node.height;
        node.characters = msg.texts[i];
        node.textAutoResize = "HEIGHT";
        await new Promise((r) => setTimeout(r, 0));
        let isOverflowing = detectOverflow(node);
        if (isOverflowing) {
          node.textAutoResize = "WIDTH_AND_HEIGHT";
          await new Promise((r) => setTimeout(r, 0));
          isOverflowing = detectOverflow(node);
        }
        if (isOverflowing && typeof node.fontSize === "number") {
          let attempts = 0;
          while (isOverflowing && attempts < 5) {
            node.fontSize = node.fontSize * 0.95;
            await new Promise((r) => setTimeout(r, 0));
            isOverflowing = detectOverflow(node);
            attempts++;
          }
        }
        node.fills = [{
          type: "SOLID",
          color: isOverflowing ? { r: 1, g: 0, b: 0 } : { r: 0, g: 0, b: 0 }
          // normal
        }];
      }
      figma.notify("Smart Localization Complete ✅");
    }
  };
  function detectOverflow(node) {
    var _a;
    const bounds = node.absoluteBoundingBox;
    const parentBounds = (_a = node.parent) == null ? void 0 : _a.absoluteBoundingBox;
    if (!bounds || !parentBounds) return false;
    return bounds.height > parentBounds.height || bounds.width > parentBounds.width;
  }
})();
