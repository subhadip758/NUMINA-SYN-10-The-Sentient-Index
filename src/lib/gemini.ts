import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeSentiment(text: string): Promise<number> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the sentiment of the following text regarding environmental sustainability. 
      Return a single number between 0 and 1, where 0 is deeply pessimistic/unstable and 1 is highly optimistic/sustainable.
      Text: "${text}"
      ONLY return the number.`,
    });

    const score = parseFloat(response.text?.trim() || "0.5");
    return isNaN(score) ? 0.5 : score;
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    return 0.5;
  }
}
