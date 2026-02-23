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
        const originalHeight = node.height;
        const originalWidth = node.width;
        const originalFontSize = typeof node.fontSize === "number" ? node.fontSize : null;
        node.characters = msg.texts[i];
        node.textAutoResize = "HEIGHT";
        await new Promise((r) => setTimeout(r, 0));
        let overflow = node.height > originalHeight;
        if (overflow) {
          node.textAutoResize = "WIDTH_AND_HEIGHT";
          await new Promise((r) => setTimeout(r, 0));
          overflow = node.height > originalHeight || node.width > originalWidth;
        }
        if (overflow && originalFontSize) {
          let attempts = 0;
          while (attempts < 6 && (node.height > originalHeight || node.width > originalWidth)) {
            node.fontSize = node.fontSize * 0.95;
            await new Promise((r) => setTimeout(r, 0));
            attempts++;
          }
          overflow = node.height > originalHeight || node.width > originalWidth;
        }
        console.log("Overflow:", node.name, overflow);
        node.fills = [{
          type: "SOLID",
          color: overflow ? { r: 1, g: 0, b: 0 } : { r: 0, g: 0, b: 0 }
          // normal
        }];
      }
      figma.notify("Smart Localization Complete ✅");
    }
  };
})();
