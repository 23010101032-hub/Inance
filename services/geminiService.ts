
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

/**
 * Initialize Gemini client strictly using process.env.API_KEY.
 */
const getAiClient = () => {
  // Use process.env.API_KEY directly as per the specified coding guidelines.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function getFinancialTip(): Promise<string> {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Give me one concise, professional financial tip for today. Keep it under 150 characters.',
      config: {
        systemInstruction: "You are a world-class financial advisor for the app Inance. Your tips are practical and encouraging.",
        temperature: 0.7,
      },
    });
    
    return response.text || "Save at least 20% of your income every month to build a strong safety net.";
  } catch (error) {
    return "The best time to start investing was yesterday; the second best time is today.";
  }
}

export async function analyzeExpensesAndGetTip(transactions: Transaction[], currency: string): Promise<string> {
  try {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return "Start logging your expenses to get personalized saving insights!";

    // Group by category for analysis
    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const summaryStr = Object.entries(categoryTotals)
      .map(([cat, total]) => `${cat}: ${currency}${total}`)
      .join(', ');

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these expenses and give one punchy, personalized saving tip: ${summaryStr}. Keep it under 100 characters and be specific.`,
      config: {
        systemInstruction: "You are an expert financial analyst for Inance. You look at spending data and find one key area to save money today. Be direct and helpful.",
        temperature: 0.5,
      },
    });

    return response.text?.trim() || "Consider reducing spending in your top category to boost your savings.";
  } catch (error) {
    return "Consistency in tracking is the first step to financial freedom.";
  }
}
