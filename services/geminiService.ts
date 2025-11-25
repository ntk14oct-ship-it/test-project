import { GoogleGenAI } from "@google/genai";
import { PeaLocationResult, GroundingChunk } from "../types";

const API_KEY = process.env.API_KEY;

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
คุณคือผู้ช่วยอัจฉริยะสำหรับ "เจ้าหน้าที่สำรวจของการไฟฟ้าส่วนภูมิภาค (กฟภ.)" หรือ PEA
หน้าที่ของคุณคือการวิเคราะห์ข้อความหรือคำถามของผู้ใช้ เพื่อระบุ "พื้นที่สังกัด" และ "จังหวัด" ของสถานที่ที่ถูกกล่าวถึง

เป้าหมายหลัก:
1. วิเคราะห์ชื่อสถานที่, ตำบล, อำเภอ, หรือจุดสังเกต (Landmark) จากข้อความ
2. ระบุว่าสถานที่นั้นอยู่ในเขตความรับผิดชอบของ "การไฟฟ้าส่วนภูมิภาคสาขาใด" (PEA Office) และ "จังหวัดใด"
3. หากข้อมูลไม่ชัดเจน ให้ประมาณการจากบริบททางภูมิศาสตร์ที่ใกล้ที่สุด

รูปแบบการตอบกลับ (Response Format):
คุณต้องตอบกลับโดยเริ่มด้วย JSON Block เสมอ ตามโครงสร้างนี้:

\`\`\`json
{
  "officeName": "ชื่อสำนักงานการไฟฟ้า (เช่น การไฟฟ้าส่วนภูมิภาคอำเภอปากช่อง)",
  "province": "ชื่อจังหวัด",
  "district": "ชื่ออำเภอ (ถ้าทราบ)",
  "confidence": "High" | "Medium" | "Low",
  "reasoning": "คำอธิบายสั้นๆ ว่าทำไมถึงระบุเป็นที่นี่",
  "suggestedAction": "คำแนะนำสำหรับเจ้าหน้าที่สำรวจ (เช่น ตรวจสอบมิเตอร์, ลงพื้นที่สำรวจไลน์สายส่ง)"
}
\`\`\`

หลังจาก JSON Block คุณสามารถอธิบายเพิ่มเติมสั้นๆ ได้ถ้าจำเป็น
`;

export const analyzePeaLocation = async (
  userQuery: string,
  userLocation?: { lat: number; lng: number }
): Promise<{ text: string; result: PeaLocationResult | null; mapLinks: string[] }> => {
  if (!API_KEY) {
    throw new Error("API Key not found. Please set process.env.API_KEY");
  }

  try {
    const toolConfig: any = {};
    
    // Add location bias if available
    if (userLocation) {
      toolConfig.retrievalConfig = {
        latLng: {
          latitude: userLocation.lat,
          longitude: userLocation.lng
        }
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Efficient and capable model
      contents: userQuery,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleMaps: {} }], // Use Google Maps Grounding
        toolConfig: toolConfig,
        temperature: 0.3, // Low temperature for factual accuracy
      },
    });

    const fullText = response.text || "";
    
    // Extract JSON from the response
    const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);
    let structuredResult: PeaLocationResult | null = null;

    if (jsonMatch && jsonMatch[1]) {
      try {
        structuredResult = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from model response", e);
      }
    }

    // Extract Map Links from Grounding Metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    const mapLinks: string[] = [];
    
    chunks.forEach((chunk) => {
      if (chunk.maps?.uri) {
        mapLinks.push(chunk.maps.uri);
      }
    });

    return {
      text: fullText.replace(/```json[\s\S]*?```/, '').trim(), // Return text without the JSON block for display
      result: structuredResult,
      mapLinks: mapLinks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};