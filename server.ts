import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in secrets/environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Chat with Nexus AI
app.post("/api/nexus", async (req, res) => {
  try {
    const { message, history, erpData } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAIClient();

    // Prepare system instructions with current ERP context
    const systemInstruction = `You are Nexus AI, the advanced AI command center for Cloud ERP.
You have real-time access to the company's active ERP data state, metrics, and processes. 
Here is the current state of the Cloud ERP:
${JSON.stringify(erpData, null, 2)}

Your tone is professional, sophisticated, and analytical (like a top-tier business consultant combined with a cutting-edge systems engineer).
Keep responses clear, concise, and focused on business value or system operations.
You can help users analyze metrics, suggest actions to address low stock, evaluate workflows, write comments, or simulate production planning.
If the user asks to perform an action (like "New Workflow", "Hire Employee", "Create Invoice"), respond in character explaining that you have processed/simulated the request on the server, and outline the exact business impacts or next steps.

Never expose raw code, database paths, or API structures. Answer elegantly, using clear bullet points where helpful.`;

    // Map history to the required format if provided
    const chatHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    }));

    // Start a chat session or send a single generate content request
    // We can use single-turn generateContent with system instruction and messages to keep it simple and robust
    const contents = [
      ...chatHistory,
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in /api/nexus:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred while communicating with Nexus AI.",
      isConfigError: error.message?.includes("GEMINI_API_KEY") 
    });
  }
});

// 2. API: Generate Executive Strategic Report
app.post("/api/generate-report", async (req, res) => {
  try {
    const { erpData } = req.body;
    const ai = getAIClient();

    const systemInstruction = `You are the Principal Chief Operations Officer & AI Strategist for Cloud ERP.
Your task is to generate a highly professional, comprehensive Executive Operations Report based on the current ERP database.
Analyze the metrics (Revenue, Expenses, Net Profit, Inventory, Activities, and Workflows) in depth.
Suggest 3 high-impact strategic optimizations, highlight any risks (e.g., specific low stock items or alerts), and write with professional corporate composure.
Use clean Markdown formatting, using sections like:
# Executive Operations & Intelligence Report
## 1. Financial Performance Analysis
## 2. Supply Chain & Inventory Diagnostics
## 3. Operations & Personnel Capacity
## 4. Key Risks & Alerts
## 5. Strategic Optimization Recommendations

Keep the output elegant, highly readable, and structured.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze this current ERP state and generate the executive report: ${JSON.stringify(erpData)}`,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({ report: response.text });
  } catch (error: any) {
    console.error("Error in /api/generate-report:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred while generating the report.",
      isConfigError: error.message?.includes("GEMINI_API_KEY") 
    });
  }
});

// 3. API: Generate Automated Workflow Plan
app.post("/api/generate-workflow", async (req, res) => {
  try {
    const { description, erpData } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Workflow description is required." });
    }

    const ai = getAIClient();

    const systemInstruction = `You are the Lead Systems Architect of Cloud ERP.
The user wants to design an automated workflow/pipeline for the ERP. 
Based on their prompt, generate a fully structured workflow plan.
The response must be in JSON format matching the schema:
{
  "name": "string (name of the workflow)",
  "trigger": "string (event triggering this workflow)",
  "steps": [
    {
      "id": "string",
      "action": "string",
      "department": "string",
      "agent": "string (human/AI/system)"
    }
  ],
  "estimatedImpact": "string (estimated impact on revenue/operations)"
}
Return ONLY valid JSON. No markdown backticks, no text wrappers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `User request: "${description}". Active ERP context: ${JSON.stringify(erpData)}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const result = JSON.parse(response.text.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/generate-workflow:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred while generating the workflow.",
      isConfigError: error.message?.includes("GEMINI_API_KEY") 
    });
  }
});

// Serve frontend with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Cloud ERP] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
