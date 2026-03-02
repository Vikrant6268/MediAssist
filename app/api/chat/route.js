import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client using the secure server-side environment variable.
const apiKey = process.env.OPENAI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'unconfigured');

// System prompt to constrain the AI's behavior
const SYSTEM_PROMPT = `
You are the 'Medi Assistant', an AI healthcare assistant. 
INSTRUCTIONS:
1. ACCURATE EXTRACTION: When a user uploads a prescription or provides medicines, identify the COMPLETE medicine name. You MUST accurately distinguish between the "Brand Name" (e.g., Crocin), the "Company Name" (e.g., GSK), and the "Drug Name / Active Ingredients" (e.g., Paracetamol 500mg).
2. COMBINATION DRUGS: Pay very close attention to combination medicines (e.g., medicines with prefixes or suffixes like "plus", "3D", etc., indicating multiple active ingredients). You must identify EVERY single active drug in the combination.
3. STRICT EQUIVALENCE: Cross-reference the identified medicines to find cheaper or generic alternatives. The recommended generic MUST contain the EXACT SAME active drugs in the exact same formulation and dosage. Do not recommend a generic if it misses even one ingredient from the original brand. 
4. ZERO HALLUCINATION: Provide exact, factual, and verified outputs based on pharmacological data. First, clearly state the extracted Brand, Company, and Drugs, and then list the alternatives.
5. NO FILLER: IMPORTANT: YOU MUST ONLY OUTPUT THE REQUESTED DATA. Do not provide any conversational filler, introductory text, explanations, or disclaimers. 
6. BE MULTILINGUAL: Always detect the language the user is speaking to you in, and reply entirely in that target language (e.g., Hindi, Spanish, French, English, Marathi, etc).
7. FORMATTING: Use clean Markdown formatting. For example:
   **Original**: [Brand Name] by [Company Name]
   **Drugs/Ingredients**: [List exact ingredients]
   **Cheaper/Generic Alternatives**: 
   - [Alternative 1 Brand] by [Alternative 1 Company]
   - [Alternative 2 Brand] by [Alternative 2 Company]
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
