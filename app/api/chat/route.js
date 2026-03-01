import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client using the secure server-side environment variable.
const apiKey = process.env.OPENAI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'unconfigured');

// System prompt to constrain the AI's behavior
const SYSTEM_PROMPT = `
You are the 'Medi Assistant', an AI healthcare assistant. 
INSTRUCTIONS:
1. When a user uploads a prescription or provides medicines, identify the exact medicines.
2. Cross-reference the identified medicines with available pharmacological data to find completely equivalent generic or cheaper alternatives that have the exact same active ingredients and dosage formulas.
3. IMPORTANT: YOU MUST ONLY OUTPUT THE LIST OF GENERIC CHEAP ALTERNATIVES. Do not provide any conversational filler, introductory text, explanations, or disclaimers. Do not say "Here are the alternatives" or similar phrases. Provide JUST the short, formatted list.
4. BE MULTILINGUAL: Always detect the language the user is speaking to you in, and reply entirely in that target language (e.g., Hindi, Spanish, French, English).
5. FORMATTING: Use clean Markdown formatting with a simple list for the alternatives.
`;

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, fileName, message, mimeType, base64 } = body;

        // Check if the user has actually configured their API key in .env.local
        if (!apiKey || apiKey === 'your_secret_api_key_here') {
            return NextResponse.json(
                { reply: "⚠️ Please configure your API Key in the `.env.local` file to use the real AI." },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        if (action === 'extract') {
            const prompt = `${SYSTEM_PROMPT}\n\nThe user has uploaded a prescription file named: "${fileName}". Please analyze the attached image strictly to read the medicines on it, and provide generic alternatives. Ensure paragraph breaks are used. Remember to detect their language.`;

            let contents = [];
            if (base64 && mimeType) {
                contents = [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64
                        }
                    }
                ];
            } else {
                contents = [{ text: prompt }];
            }

            const result = await model.generateContent(contents);
            const response = await result.response;
            return NextResponse.json({ reply: response.text() });
        }

        if (action === 'chat') {
            // Handle follow-up Q&A
            const prompt = `${SYSTEM_PROMPT}\n\nThe user asks: "${message}"\nProvide a helpful, medically-sound response. Detect their language and respond entirely in the language they used. formatting with markdown headings and lists where appropriate.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return NextResponse.json({ reply: response.text() });
        }

        return NextResponse.json({ reply: "Action not recognized." }, { status: 400 });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { reply: "An error occurred while communicating with the AI. Please verify your API Key." },
            { status: 500 }
        );
    }
}
