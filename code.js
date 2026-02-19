var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
    throw new Error("Not a frame");
}
var frame = selectedNode;
function randomWord() {
    var words = ["Alpha", "Beta", "Gamma", "Delta"];
    return words[Math.floor(Math.random() * words.length)];
}
function replaceText(node_1) {
    return __awaiter(this, arguments, void 0, function (node, texts) {
        var _i, _a, child;
        if (texts === void 0) { texts = []; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(node.type === "TEXT")) return [3 /*break*/, 2];
                    return [4 /*yield*/, figma.loadFontAsync(node.fontName)];
                case 1:
                    _b.sent();
                    console.log(node);
                    node.characters = randomWord();
                    _b.label = 2;
                case 2:
                    if (!("children" in node)) return [3 /*break*/, 6];
                    _i = 0, _a = node.children;
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    child = _a[_i];
                    return [4 /*yield*/, replaceText(child, texts)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function previewWithRandomText(frame) {
    return __awaiter(this, void 0, void 0, function () {
        var clone, bytes, image;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clone = frame.clone();
                    return [4 /*yield*/, replaceText(clone)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, clone.exportAsync({
                            format: "PNG",
                            constraint: { type: "WIDTH", value: 400 }
                        })];
                case 2:
                    bytes = _a.sent();
                    clone.remove();
                    figma.ui.postMessage({
                        type: "PREVIEW",
                        image: figma.base64Encode(bytes)
                    });
                    image = figma.base64Encode(bytes);
                    console.log(image);
                    return [2 /*return*/];
            }
        });
    });
}
previewWithRandomText(selectedNode);
