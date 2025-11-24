import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a response for the Agricultural Policy Assistant.
 */
export const getPolicyAdvice = async (userQuery: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: `You are an expert agricultural policy assistant for the 'Minhe Supply and Marketing Smart Platform' in Harbin, Shuangcheng District.
        
        Current Year: 2025.
        
        Your instructions:
        1. Explain 2025 agricultural policies, subsidies (Corn, Rice, Soybeans), and regulations.
        2. ALWAYS provide official reference links (e.g., http://www.moa.gov.cn/ or local government sites).
        3. Keep answers professional, encouraging, and formatted with bullet points.
        4. Focus on: Planting subsidies, Drone usage, and Market price protection.
        
        If the query is unrelated to agriculture, politely redirect.`,
      },
    });

    return response.text || "抱歉，无法获取2025年最新政策，请稍后重试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "系统繁忙，智能助手暂时离线。";
  }
};

/**
 * Generates an image for a product using Gemini Nano Banana (gemini-2.5-flash-image).
 */
export const generateProductImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
            { text: prompt + " High quality, photorealistic, agricultural product photography, clean lighting." }
        ]
      },
      config: {
         // Note: responseMimeType is not supported for image models
      }
    });

    // Check all parts for the image
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};
