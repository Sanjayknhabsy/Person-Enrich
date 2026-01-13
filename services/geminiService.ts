
import { GoogleGenAI } from "@google/genai";
import { LeadResult } from "../types";

export const fetchLeadData = async (companyName: string, isRetry: boolean = false): Promise<Partial<LeadResult>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `Role: Elite B2B Lead Intelligence Researcher.
Region: India.
Objective: Find ONE real decision-maker for "${companyName}" with a verified Indian mobile number.

RULES:
1. DATA INTEGRITY: You MUST find unique data. Do not hallucinate or repeat numbers from other companies.
2. PERSISTENCE: If this is a RETRY, search broader. Look for specific mobile numbers on LinkedIn, RocketReach, SignalHire, or recent press releases.
3. 3-LEVEL ESCALATION: 
   - Primary: CEO/Founder/Managing Director.
   - Secondary: Head of Operations/VP Product/CMO.
   - Tertiary: Sales Director/Head of Partnerships.
4. CONTACT FORMAT: 10-digit mobile only. No spaces, no prefix.
5. NO FAKES: If NO mobile is found after checking 3 people, return empty string for phone fields.

Output Format: JSON ONLY.
{
  "personName": "string",
  "designation": "string",
  "phoneNumber": "string",
  "altPhoneNumber": "string",
  "sourceLink": "string",
  "linkedinProfile": "string"
}`;

  const prompt = isRetry 
    ? `URGENT RETRY for "${companyName}". Previous search failed. Find a different decision maker and their 10-digit Indian mobile number. Search LinkedIn deeply. JSON only.`
    : `Extract decision-maker lead for "${companyName}". Verify Indian mobile. JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const groundingLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Source",
        uri: chunk.web?.uri || ""
      }))
      .filter((link: any) => link.uri !== "") || [];

    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    return {
      ...parsedData,
      companyName,
      groundingLinks,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
