import express from "express"
import cors from "cors"
import 'dotenv/config'
import { LingoDotDevEngine } from "lingo.dev/sdk";

const app = express();

app.use(cors());
app.use(express.json());

const lingo = new LingoDotDevEngine({
    apiKey: process.env.VITE_LINGODOTDEV_API_KEY
});

app.post("/translate", async (req, res) => {
    console.log('Hitting api', req.body?.language)
    try {
        const { texts, language } = req.body;

        const translated = [];

        for (const text of texts) {
            const result = await lingo.localizeText(text, {
                sourceLocale: "en",
                targetLocale: language,
            });
            translated.push(result);
        }

        res.json({ texts: translated });
        console.log('completed')

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Translation failed" });
    }
});
app.post("/translateObj", async (req, res) => {
    console.log('Hitting api', req.body?.lang)
    try {
        const { obj, lang } = req.body;
        console.log(obj, lang)

        const translated = [];

        // const content = await JSON.parse(obj)
        // console.lof(content)
        const result = await lingo.localizeObject(obj, {
            sourceLocale: "en",
            targetLocale: lang,
        });
        translated.push(result);


        res.json({ texts: translated });
        console.log('completed')

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Translation failed" });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
