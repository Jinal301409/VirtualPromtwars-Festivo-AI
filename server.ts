import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize GoogleGenAI client securely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please ensure the secret is set.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to call Gemini with transient 503 retry and fallback models
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
    responseSchema?: any;
  }
) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    // Up to 2 attempts per model
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {
          temperature: params.temperature ?? 0.7,
        };
        if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
        if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
        if (params.responseSchema) config.responseSchema = params.responseSchema;

        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config,
        });

        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt + 1} with model ${model} failed:`, err?.message || err);
        // Wait 800ms before retrying
        await new Promise((res) => setTimeout(res, 800));
      }
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

// 1. Endpoint: Generate Full Structured Event Plan
app.post('/api/plan-event', async (req, res) => {
  try {
    const { name, type, date, location, guestCount, budgetINR, theme, preferences } = req.body;

    if (!name || !type || !date || !budgetINR) {
      return res.status(400).json({ error: 'Missing required fields: name, type, date, and budgetINR are required.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are Festivo AI, a world-class luxury and community event director and master financial planner specializing in Indian and global celebrations (weddings, milestone birthdays, cultural utsavs, corporate galas, and community festivals).
You craft deeply personalized, realistic, culturally nuanced, and budget-optimized event plans.
Always quote realistic Indian Rupee (INR) cost allocations that sum exactly to 100% of the total budget of ₹${budgetINR.toLocaleString('en-IN')}.
Make timeline milestones realistic relative to the event date (${date}).
For catering, suggest authentic regional delicacies, live interactive counters, and themed beverages.
Provide high-value money-saving ideas with concrete rupee savings and honest trade-offs.
Provide potential risks and mitigation strategies tailored to the event type and location (${location || 'India'}).`;

    const userPrompt = `Create a comprehensive, personalized event blueprint for:
- Event Name: ${name}
- Event Type: ${type}
- Event Date: ${date}
- Location: ${location || 'India'}
- Guest Count: ${guestCount || 100}
- Total Budget: ₹${budgetINR.toLocaleString('en-IN')} INR
- Desired Theme / Aesthetic: ${theme || 'Elegant and memorable'}
- Specific Preferences & Requirements: ${preferences || 'Balanced experience with good food and memorable entertainment'}`;

    const response = await callGeminiWithFallback(ai, {
      contents: userPrompt,
      systemInstruction: systemPrompt,
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptAndTheme: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                tagline: { type: Type.STRING },
                description: { type: Type.STRING },
                aestheticVibe: { type: Type.STRING },
              },
              required: ['title', 'tagline', 'description', 'aestheticVibe'],
            },
            decorationAndColorPalette: {
              type: Type.OBJECT,
              properties: {
                primaryColors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      hex: { type: Type.STRING },
                      usage: { type: Type.STRING },
                    },
                    required: ['name', 'hex', 'usage'],
                  },
                },
                decorElements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                lightingStyle: { type: Type.STRING },
                flowerSuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['primaryColors', 'decorElements', 'lightingStyle', 'flowerSuggestions'],
            },
            venueAndCatering: {
              type: Type.OBJECT,
              properties: {
                venueTypes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                seatingLayout: { type: Type.STRING },
                cateringStyle: { type: Type.STRING },
                signatureDishes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                beverageIdeas: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['venueTypes', 'seatingLayout', 'cateringStyle', 'signatureDishes', 'beverageIdeas'],
            },
            activitiesAndEntertainment: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  timeSlot: { type: Type.STRING },
                  targetAudience: { type: Type.STRING },
                },
                required: ['title', 'description', 'timeSlot', 'targetAudience'],
              },
            },
            moneySavingIdeas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tip: { type: Type.STRING },
                  estimatedSavings: { type: Type.STRING },
                  tradeOff: { type: Type.STRING },
                },
                required: ['tip', 'estimatedSavings', 'tradeOff'],
              },
            },
            budgetEstimates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  percentage: { type: Type.NUMBER },
                  allocatedAmountINR: { type: Type.NUMBER },
                  rationale: { type: Type.STRING },
                },
                required: ['category', 'percentage', 'allocatedAmountINR', 'rationale'],
              },
            },
            planningMilestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  daysBeforeEvent: { type: Type.INTEGER },
                  milestoneTitle: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  priority: { type: Type.STRING },
                },
                required: ['daysBeforeEvent', 'milestoneTitle', 'description', 'category', 'priority'],
              },
            },
            vendorChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  serviceTitle: { type: Type.STRING },
                  suggestedQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  priority: { type: Type.STRING },
                },
                required: ['category', 'serviceTitle', 'suggestedQuestions'],
              },
            },
            risksAndPracticalTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING },
                  mitigation: { type: Type.STRING },
                },
                required: ['risk', 'mitigation'],
              },
            },
          },
          required: [
            'conceptAndTheme',
            'decorationAndColorPalette',
            'venueAndCatering',
            'activitiesAndEntertainment',
            'moneySavingIdeas',
            'budgetEstimates',
            'planningMilestones',
            'vendorChecklist',
            'risksAndPracticalTips',
          ],
        },
    });

    const rawJson = response.text ? response.text.trim() : '{}';
    const parsedData = JSON.parse(rawJson);

    // Compute milestone due dates relative to event date
    const targetDate = new Date(date);
    const enrichedMilestones = (parsedData.planningMilestones || []).map((m: any, idx: number) => {
      const milestoneDate = new Date(targetDate);
      milestoneDate.setDate(milestoneDate.getDate() - (m.daysBeforeEvent || 0));
      const y = milestoneDate.getFullYear();
      const mo = String(milestoneDate.getMonth() + 1).padStart(2, '0');
      const d = String(milestoneDate.getDate()).padStart(2, '0');

      return {
        id: `m-ai-${Date.now()}-${idx}`,
        daysBeforeEvent: m.daysBeforeEvent || 0,
        dueDate: isNaN(milestoneDate.getTime()) ? date : `${y}-${mo}-${d}`,
        milestoneTitle: m.milestoneTitle,
        description: m.description,
        category: m.category || 'General',
        priority: (['High', 'Medium', 'Low'].includes(m.priority) ? m.priority : 'Medium') as 'High' | 'Medium' | 'Low',
        completed: false,
      };
    });

    // Enrich budget items with IDs and actual spent trackers
    const enrichedBudget = (parsedData.budgetEstimates || []).map((b: any, idx: number) => {
      const allocated = b.allocatedAmountINR || Math.round((budgetINR * (b.percentage || 10)) / 100);
      return {
        id: `b-ai-${Date.now()}-${idx}`,
        category: b.category,
        percentage: b.percentage || 10,
        allocatedAmountINR: allocated,
        actualSpentINR: 0,
        rationale: b.rationale || '',
      };
    });

    // Enrich vendor checklist
    const enrichedVendors = (parsedData.vendorChecklist || []).map((v: any, idx: number) => {
      // Find matching budget estimate for initial price guidance
      const matchingBudget = enrichedBudget.find((b: any) =>
        b.category.toLowerCase().includes(v.category.toLowerCase()) ||
        v.category.toLowerCase().includes(b.category.toLowerCase())
      );
      const estCost = matchingBudget ? Math.round(matchingBudget.allocatedAmountINR * 0.8) : 0;

      return {
        id: `v-ai-${Date.now()}-${idx}`,
        category: v.category,
        serviceTitle: v.serviceTitle,
        vendorName: '',
        contactPerson: '',
        phoneOrEmail: '',
        estimatedCostINR: estCost,
        finalCostINR: 0,
        status: 'Not Contacted' as const,
        suggestedQuestions: v.suggestedQuestions || [],
        notes: '',
        completed: false,
      };
    });

    const enrichedActivities = (parsedData.activitiesAndEntertainment || []).map((a: any, idx: number) => ({
      id: `act-ai-${Date.now()}-${idx}`,
      title: a.title,
      description: a.description,
      timeSlot: a.timeSlot,
      targetAudience: a.targetAudience,
    }));

    const fullPlan = {
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      input: {
        name,
        type,
        date,
        location,
        guestCount: Number(guestCount) || 100,
        budgetINR: Number(budgetINR),
        theme,
        preferences,
      },
      conceptAndTheme: parsedData.conceptAndTheme,
      decorationAndColorPalette: parsedData.decorationAndColorPalette,
      venueAndCatering: parsedData.venueAndCatering,
      activitiesAndEntertainment: enrichedActivities,
      moneySavingIdeas: parsedData.moneySavingIdeas || [],
      budgetEstimates: enrichedBudget,
      planningMilestones: enrichedMilestones,
      vendorChecklist: enrichedVendors,
      risksAndPracticalTips: parsedData.risksAndPracticalTips || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.json({ success: true, plan: fullPlan });
  } catch (error: any) {
    console.error('Error generating event plan with Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate event plan using Gemini AI. Please verify your connection or try again.',
    });
  }
});

// 2. Endpoint: AI Event Advisor Chat / Specific Q&A
app.post('/api/ask-event-assistant', async (req, res) => {
  try {
    const { question, eventContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are Festivo AI Event Director. You are advising the organizer for the following event:
Event: ${eventContext?.input?.name || 'Celebration'} (${eventContext?.input?.type || 'Event'})
Date: ${eventContext?.input?.date || 'Upcoming'} in ${eventContext?.input?.location || 'India'}
Budget: ₹${eventContext?.input?.budgetINR?.toLocaleString('en-IN') || 'Flexible'}
Guests: ${eventContext?.input?.guestCount || 'Not specified'}
Theme: ${eventContext?.input?.theme || 'Custom'}

Provide direct, actionable, practical, culturally accurate advice.
Include estimated Indian Rupee figures when discussing costs, vendors, or trade-offs.
Keep your response concise, elegant, structured, and easy to read.`;

    const response = await callGeminiWithFallback(ai, {
      contents: question,
      systemInstruction: systemPrompt,
      temperature: 0.7,
    });

    const reply = response.text || 'I could not generate an answer at this time. Please try asking again.';
    return res.json({ success: true, answer: reply });
  } catch (error: any) {
    console.error('Error in ask-event-assistant:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to get answer from Gemini AI.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Festivo AI',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Production vs Dev serving with Vite middlewares
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Festivo AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
