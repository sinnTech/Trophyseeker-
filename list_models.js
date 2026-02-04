
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
    process.exit(1);
}

async function run() {
    let output = '';
    for (const version of ['v1beta', 'v1']) {
        output += `--- ${version} ---\n`;
        const ai = new GoogleGenAI({ apiKey, apiVersion: version });
        try {
            const models = await ai.models.list();
            for await (const m of models) {
                output += `${m.name}\n`;
            }
        } catch (e) {
            output += `Error: ${e.message}\n`;
        }
    }
    fs.writeFileSync('models_list.txt', output);
}

run();
