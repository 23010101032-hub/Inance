import { GoogleGenAI } from "@google/genai";

/**
 * Initialize Gemini client strictly using process.env.API_KEY.
 * The shim in index.html ensures this doesn't throw a ReferenceError.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export async function getFinancialTip(): Promise<string> {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Give me one concise, professional financial tip or smart investing advice for today. Keep it under 150 characters.',
      config: {
        systemInstruction: "You are a world-class financial advisor. Your tips are practical, encouraging, and highly specific to personal finance management.",
        temperature: 0.7,
      },
    });
    
    return response.text || "Save at least 20% of your income every month to build a strong safety net.";
  } catch (error) {
    console.error("Error fetching financial tip:", error);
    return "The best time to start investing was yesterday; the second best time is today.";
  }
}