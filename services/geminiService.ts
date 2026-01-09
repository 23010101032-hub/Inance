
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client strictly using process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialTip(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Give me one concise, professional financial tip or smart investing advice for today. Keep it under 150 characters.',
      config: {
        systemInstruction: "You are a world-class financial advisor. Your tips are practical, encouraging, and highly specific to personal finance management.",
        temperature: 0.7,
      },
    });
    // Use .text property directly
    return response.text || "Save at least 20% of your income every month to build a strong safety net.";
  } catch (error) {
    console.error("Error fetching financial tip:", error);
    return "The best time to start investing was yesterday; the second best time is today.";
  }
}
