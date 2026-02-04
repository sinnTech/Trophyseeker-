
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key.trim()] = val.join('=').trim();
    return acc;
}, {});

const apiKey = env.VITE_GEMINI_API_KEY;

async function run() {
    let output = '';
    for (const v of ['v1', 'v1beta']) {
        output += `--- ${v} ---\n`;
        const ai = new GoogleGenAI({ apiKey, apiVersion: v });
        try {
            const models = await ai.models.list();
            for await (const m of models) {
                output += `${m.name}\n`;
            }
        } catch (e) {
            output += `${v}_ERR: ${e.message}\n`;
        }
    }
    fs.writeFileSync('CLEAN_MODELS.txt', output);
}

run();
