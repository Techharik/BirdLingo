import { LingoDotDevEngine } from "lingo.dev/sdk";
const lingoDotDev = new LingoDotDevEngine({
    apiKey: import.meta.env.VITE_LINGODOTDEV_API_KEY,
});

window.onload = () => {
    parent.postMessage({ pluginMessage: { type: "UI_READY" } }, "*");
};


window.onmessage = async (event) => {
    const msg = event.data.pluginMessage;
    console.log(msg, 'msg')
    if (msg.type === "TRANSLATE") {

        const translatedTexts = [];

        for (const text of msg.texts) {
            const result = await lingoDotDev.localizeText(text, {
                sourceLocale: "en",
                targetLocale: "es",
            });
            translatedTexts.push(result);
        }

        parent.postMessage(
            { pluginMessage: { type: "TRANSLATED", texts: translatedTexts } },
            "*"
        );
    }
    if (msg.type === "PREVIEW") {
        document.body.innerHTML =
            `<img src="data:image/png;base64,${msg.image}" width="100%" />`;
    }
};
