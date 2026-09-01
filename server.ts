import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { getDb } from './src/db';
import { medicines, orders, users } from './src/db/schema';
import { eq, desc } from 'drizzle-orm';

dotenv.config();

// Catalog summary for Gemini context
const CATALOG_ITEMS = [
  { id: 'med-1', name: 'Paracetamol 650mg (Dolo)', generic: 'Paracetamol IP 650mg', category: 'Pain & Fever', price: 32, rx: false, dosage: '650 mg', uses: 'Fever, headache, bodyache' },
  { id: 'med-2', name: 'Albendazole 400mg', generic: 'Albendazole USP 400mg', category: 'Antibiotics', price: 25, rx: true, dosage: '400 mg', uses: 'Parasitic worms, deworming' },
  { id: 'med-3', name: 'Amoxicillin & Clavulanate 625mg', generic: 'Amoxicillin 500mg + Clavulanic Acid 125mg', category: 'Antibiotics', price: 145, rx: true, dosage: '625 mg', uses: 'Bacterial infections, respiratory, ENT' },
  { id: 'med-4', name: 'Cetirizine 10mg', generic: 'Cetirizine Hydrochloride IP 10mg', category: 'Pain & Fever', price: 28, rx: false, dosage: '10 mg', uses: 'Allergies, runny nose, sneezing, hives' },
  { id: 'med-5', name: 'Metformin SR 500mg', generic: 'Metformin Hydrochloride SR 500mg', category: 'Diabetes & Heart', price: 42, rx: true, dosage: '500 mg', uses: 'Type 2 diabetes, blood sugar control' },
  { id: 'med-6', name: 'Ranitidine 150mg (Rantac)', generic: 'Ranitidine Hydrochloride IP 150mg', category: 'Digestion & Acidity', price: 35, rx: false, dosage: '150 mg', uses: 'Acidity, heartburn, GERD, stomach ulcer' },
  { id: 'med-7', name: 'Amlodipine 5mg', generic: 'Amlodipine Besylate IP 5mg', category: 'Diabetes & Heart', price: 38, rx: true, dosage: '5 mg', uses: 'High blood pressure, hypertension, chest pain' },
  { id: 'med-8', name: 'Evion Vitamin E 400mg', generic: 'Tocopheryl Acetate IP 400mg', category: 'Skin & Hair', price: 78, rx: false, dosage: '400 mg', uses: 'Skin health, hair fall, antioxidant, muscle cramps' },
  { id: 'med-9', name: 'VB7 Hair Biotin Complex', generic: 'Biotin 10mg + Zinc + L-Cysteine + Minerals', category: 'Skin & Hair', price: 320, rx: false, dosage: '10 mg Biotin', uses: 'Hair fall, hair thinning, nail strength' },
  { id: 'med-10', name: 'Ciprofloxacin 500mg (Ciplox)', generic: 'Ciprofloxacin Hydrochloride IP 500mg', category: 'Antibiotics', price: 55, rx: true, dosage: '500 mg', uses: 'Typhoid, UTI, bacterial diarrhea' },
  { id: 'med-11', name: 'Iron + Folic Acid Complex (Orofer-XT)', generic: 'Ferrous Ascorbate 100mg + Folic Acid 1.5mg', category: 'Vitamins & Supplements', price: 185, rx: false, dosage: '100 mg elemental iron', uses: 'Anemia, low hemoglobin, pregnancy fatigue' },
  { id: 'med-12', name: 'Pantoprazole DSR (Pan-D)', generic: 'Pantoprazole 40mg + Domperidone SR 30mg', category: 'Digestion & Acidity', price: 198, rx: true, dosage: '40 mg / 30 mg', uses: 'Severe acidity, reflux, nausea with gas' },
  { id: 'med-13', name: 'Volini Fast Pain Relief Spray 55g', generic: 'Diclofenac Diethylamine + Methyl Salicylate + Menthol', category: 'Pain & Fever', price: 165, rx: false, dosage: '55 g Spray', uses: 'Joint pain, sprains, backache, muscle strain' },
  { id: 'med-14', name: 'Electral ORS Sachet 21.8g (Pack of 4)', generic: 'WHO Oral Rehydration Salts Formula IP', category: 'First Aid & Devices', price: 88, rx: false, dosage: '21.8 g Sachet for 1L', uses: 'Dehydration, diarrhea, heat exhaustion, sports recovery' },
  { id: 'med-15', name: 'Azithromycin 500mg (Azee-500)', generic: 'Azithromycin Dihydrate IP 500mg', category: 'Antibiotics', price: 118, rx: true, dosage: '500 mg', uses: 'Throat infection, tonsillitis, chest congestion' },
  { id: 'med-16', name: 'Benadryl DR Cough Syrup (100ml)', generic: 'Dextromethorphan HBr + Chlorpheniramine Maleate', category: 'Pain & Fever', price: 125, rx: false, dosage: '100 ml syrup', uses: 'Dry irritating cough, allergic cold' },
  { id: 'med-17', name: 'Vitamin D3 60K Softgel (Calcirol)', generic: 'Cholecalciferol IP 60,000 IU', category: 'Vitamins & Supplements', price: 210, rx: false, dosage: '60,000 IU Weekly', uses: 'Vitamin D deficiency, bone health, fatigue' },
  { id: 'med-18', name: 'Dettol Antiseptic Liquid 125ml', generic: 'Chloroxylenol 4.8% w/v Antiseptic Solution', category: 'First Aid & Devices', price: 72, rx: false, dosage: '125 ml Liquid', uses: 'First aid, wound disinfection, skin hygiene' },
];

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'MedyFay Healthcare API with Gemini 3.7 AI' });
  });

  // 1. AI Prescription Scanner / Vision OCR Endpoint
  app.post('/api/ai/prescriptions/analyze', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'Image base64 data is required.' });
      }

      // Clean base64 string if it contains data URI header
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

      const ai = getAiClient();
      const prompt = `You are an expert clinical pharmacist and prescription OCR specialist for MedyFay Pharmacy.
Analyze this medical prescription image thoroughly.
Identify:
1. Patient name or age (if visible, else 'Not Specified')
2. Doctor/Clinic name & specialization (if visible)
3. Diagnosed Condition or Symptoms mentioned
4. Prescribed Medicines list:
   - medicineName (e.g. Paracetamol, Pantoprazole, Azithromycin)
   - dosage (e.g. 650mg, 500mg, 10mg)
   - frequency (e.g. Twice daily, Once at bedtime, 1-0-1, OD, BD, TDS)
   - duration (e.g. 5 days, 1 month, SOS)
   - instructions (e.g. After food, Before breakfast on empty stomach)
   - matchedCatalogId: Find the closest matching medicine ID from the MedyFay Catalog below if present, otherwise null.
   - confidence: 'high' | 'medium' | 'low'
5. Key Pharmacist Precautions and Safety Advice for the patient.
6. Is valid doctor prescription: boolean

MedyFay Available Catalog Items for matching:
${JSON.stringify(CATALOG_ITEMS, null, 2)}

Return the output in strictly valid JSON matching this structure:
{
  "patientName": string,
  "doctorName": string,
  "diagnosis": string,
  "prescribedMedicines": [
    {
      "medicineName": string,
      "dosage": string,
      "frequency": string,
      "duration": string,
      "instructions": string,
      "matchedCatalogId": string | null,
      "confidence": "high" | "medium" | "low"
    }
  ],
  "pharmacistAdvice": string[],
  "warnings": string[],
  "isValidPrescription": boolean
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are a licensed pharmacist vision specialist. Extract prescription details with high accuracy and match with catalog medicines.',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      // Enhance with full catalog medicine details for matched items
      if (parsed.prescribedMedicines && Array.isArray(parsed.prescribedMedicines)) {
        parsed.prescribedMedicines = parsed.prescribedMedicines.map((item: any) => {
          if (item.matchedCatalogId) {
            const found = CATALOG_ITEMS.find((c) => c.id === item.matchedCatalogId);
            if (found) {
              return {
                ...item,
                catalogItem: found,
              };
            }
          }
          return item;
        });
      }

      return res.json({
        success: true,
        data: parsed,
      });
    } catch (error: any) {
      console.error('Error analyzing prescription with Gemini:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze prescription image.',
      });
    }
  });

  // 2. AI Pharmacist Interactive Chat Endpoint ("Dr. Medy")
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
      }

      const ai = getAiClient();

      const systemInstruction = `You are "Dr. Medy", the Chief AI Pharmacist for MedyFay Online Pharmacy.
Your role:
- Provide empathetic, accurate, evidence-based medication guidance, dosage timing (before/after food), side-effect management, and OTC recommendations.
- When recommending medicines for common ailments (fever, acidity, body pain, cough, allergies, supplements), explicitly recommend matching products from MedyFay's catalog and specify their IDs in a structured format.
- Always include helpful safety advice (e.g. avoid alcohol with antibiotics, take antacids 30 mins before breakfast, drink plenty of water with ORS).
- Always include a brief disclaimer: "I am an AI Pharmacist. For severe symptoms, pregnancy, or chronic conditions, please consult a physician."
- Keep your tone warm, reassuring, professional, and easily readable with bullet points and bold highlights.

Available MedyFay Catalog:
${JSON.stringify(CATALOG_ITEMS, null, 2)}

Format response as a JSON object with:
{
  "reply": string (markdown formatted helpful advice),
  "recommendedMedicineIds": string[] (array of catalog IDs like ["med-1", "med-6"] relevant to the query),
  "suggestedFollowUps": string[] (3 short follow-up questions user might ask)
}`;

      // Build conversation contents
      const contents: any[] = [];
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      // Attach full catalog data for suggested medicines
      const recommendedMedicines = (parsed.recommendedMedicineIds || [])
        .map((id: string) => CATALOG_ITEMS.find((c) => c.id === id))
        .filter(Boolean);

      return res.json({
        success: true,
        data: {
          reply: parsed.reply,
          recommendedMedicines,
          suggestedFollowUps: parsed.suggestedFollowUps || [],
        },
      });
    } catch (error: any) {
      console.error('Error in AI Chat:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate response.',
      });
    }
  });

  // 3. AI Drug-Drug Interaction & Cart Safety Checker
  app.post('/api/ai/safety-check', async (req, res) => {
    try {
      const { items } = req.body; // Array of { id, name, genericName, dosage }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.json({
          success: true,
          data: {
            safe: true,
            summary: 'Your cart is empty. No drug interactions to check.',
            interactions: [],
            precautions: [],
          },
        });
      }

      const ai = getAiClient();
      const prompt = `You are a clinical pharmacology safety engine for MedyFay Pharmacy.
Evaluate these medicines currently in the patient's cart for safety, drug-drug interactions, duplicate therapeutic classes, contraindications, and administration schedule:

Medicines in Cart:
${JSON.stringify(items, null, 2)}

Provide a safety review JSON with:
{
  "safe": boolean (true if no severe or moderate dangerous interactions found),
  "riskLevel": "None" | "Low" | "Moderate" | "High",
  "summary": string (1-2 sentence overall pharmacist verdict),
  "interactions": [
    {
      "medicinesInvolved": string[],
      "severity": "Mild" | "Moderate" | "Severe",
      "effect": string,
      "recommendation": string
    }
  ],
  "dosageScheduleTips": [
    {
      "medicineName": string,
      "bestTime": string (e.g. "Morning empty stomach", "After dinner", "As needed"),
      "dietTip": string (e.g. "Avoid milk within 1 hour", "Take with plenty of water")
    }
  ],
  "warnings": string[]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are a rigorous clinical pharmacology safety auditor. Protect patients from adverse drug combinations and overdose.',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({
        success: true,
        data: parsed,
      });
    } catch (error: any) {
      console.error('Error in AI Safety Check:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to complete safety check.',
      });
    }
  });

  // 4. AI Medicine Deep Explainer
  app.post('/api/ai/medicine-explain', async (req, res) => {
    try {
      const { medicineName, genericName, dosage, category } = req.body;

      const ai = getAiClient();
      const prompt = `Explain the medicine "${medicineName}" (Generic: ${genericName}, Dosage: ${dosage}, Category: ${category}) in simple, easy-to-understand language for a patient.
Return JSON with:
{
  "simplifiedExplanation": string (2 sentences how it works in the body),
  "bestTimeToTake": string (e.g. Before breakfast, with food),
  "foodsToAvoid": string[],
  "commonSideEffects": string[],
  "specialPrecautions": string[],
  "faq": [
    { "question": string, "answer": string }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({
        success: true,
        data: parsed,
      });
    } catch (error: any) {
      console.error('Error in AI Medicine Explainer:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to explain medicine.',
      });
    }
  });

  // 5. AI Symptom Search & Triage
  app.post('/api/ai/symptom-search', async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
      }

      const ai = getAiClient();
      const prompt = `A user is searching for medical assistance with symptoms: "${query}".
Available MedyFay Catalog:
${JSON.stringify(CATALOG_ITEMS, null, 2)}

Provide clinical symptom triage and matching catalog items.
Return JSON:
{
  "understanding": string (1 sentence summarizing the user's condition),
  "urgency": "Mild (OTC Care)" | "Moderate (Consult Doctor Soon)" | "Emergency (Seek Immediate Hospital Care)",
  "recommendedCatalogIds": string[],
  "homeCareTips": string[],
  "whenToSeeDoctor": string[]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      const recommendedMedicines = (parsed.recommendedCatalogIds || [])
        .map((id: string) => CATALOG_ITEMS.find((c) => c.id === id))
        .filter(Boolean);

      return res.json({
        success: true,
        data: {
          ...parsed,
          recommendedMedicines,
        },
      });
    } catch (error: any) {
      console.error('Error in Symptom Search:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to search symptoms.',
      });
    }
  });

  // 6. SQL Database Endpoints (Cloud SQL PostgreSQL)
  // Health & connection status
  app.get('/api/sql/status', async (_req, res) => {
    try {
      const { db } = getDb();
      const result = await db.select().from(medicines).limit(1);
      return res.json({
        success: true,
        connected: true,
        database: 'Cloud SQL PostgreSQL',
        sampleItemCount: result.length,
      });
    } catch (err: any) {
      return res.json({
        success: false,
        connected: false,
        error: err.message,
      });
    }
  });

  // Get medicines from SQL
  app.get('/api/sql/medicines', async (_req, res) => {
    try {
      const { db } = getDb();
      const allMedicines = await db.select().from(medicines);
      return res.json({ success: true, data: allMedicines });
    } catch (err: any) {
      console.error('Error fetching medicines from SQL:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save / Update User Profile in SQL
  app.post('/api/sql/users', async (req, res) => {
    try {
      const { db } = getDb();
      const userData = req.body;
      if (!userData || !userData.mobile) {
        return res.status(400).json({ success: false, error: 'Mobile number is required.' });
      }

      const existing = await db.select().from(users).where(eq(users.mobile, userData.mobile)).limit(1);

      if (existing.length > 0) {
        await db.update(users).set({
          name: userData.name || existing[0].name,
          email: userData.email ?? existing[0].email,
          address: userData.address ?? existing[0].address,
          city: userData.city ?? existing[0].city,
          pincode: userData.pincode ?? existing[0].pincode,
          avatar: userData.avatar ?? existing[0].avatar,
          elCoins: userData.elCoins ?? existing[0].elCoins,
          coinHistory: userData.coinHistory ?? existing[0].coinHistory,
          isQueenMember: userData.isQueenMember ?? existing[0].isQueenMember,
          queenSavings: userData.queenSavings ?? existing[0].queenSavings,
        }).where(eq(users.mobile, userData.mobile));
      } else {
        await db.insert(users).values({
          id: userData.id || `usr-${Date.now()}`,
          name: userData.name || 'User',
          mobile: userData.mobile,
          email: userData.email || '',
          address: userData.address || '',
          city: userData.city || 'Kolkata, WB',
          pincode: userData.pincode || '700001',
          avatar: userData.avatar || '',
          memberSince: userData.memberSince || '2024',
          elCoins: userData.elCoins ?? 50,
          coinHistory: userData.coinHistory || [],
          isQueenMember: userData.isQueenMember ?? true,
          queenTier: 'VIP',
          queenSavings: userData.queenSavings ?? 1480,
        });
      }

      return res.json({ success: true, message: 'User profile synchronized with SQL' });
    } catch (err: any) {
      console.error('Error saving user to SQL:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create Order in SQL
  app.post('/api/sql/orders', async (req, res) => {
    try {
      const { db } = getDb();
      const orderData = req.body;
      if (!orderData || !orderData.id) {
        return res.status(400).json({ success: false, error: 'Order data is required.' });
      }

      await db.insert(orders).values({
        id: orderData.id,
        userId: orderData.userId || 'guest',
        userMobile: orderData.userMobile || '',
        userName: orderData.userName || '',
        items: orderData.items || [],
        totalAmount: orderData.totalAmount || 0,
        discount: orderData.discount || 0,
        deliveryAddress: orderData.deliveryAddress || {},
        paymentMethod: orderData.paymentMethod || 'cod',
        paymentStatus: orderData.paymentStatus || 'pending',
        status: orderData.status || 'confirmed',
        date: orderData.date || new Date().toISOString().split('T')[0],
        prescriptionUrl: orderData.prescriptionUrl || null,
        isQueenOrder: orderData.isQueenOrder ?? true,
      });

      return res.json({ success: true, message: 'Order saved to SQL database' });
    } catch (err: any) {
      console.error('Error saving order to SQL:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Order Status in SQL
  app.patch('/api/sql/orders/:id/status', async (req, res) => {
    try {
      const { db } = getDb();
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }

      await db.update(orders).set({ status }).where(eq(orders.id, id));
      return res.json({ success: true, message: 'Order status updated in SQL' });
    } catch (err: any) {
      console.error('Error updating order status in SQL:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get User Orders from SQL
  app.get('/api/sql/orders/:mobile', async (req, res) => {
    try {
      const { db } = getDb();
      const { mobile } = req.params;
      const userOrders = await db.select().from(orders).where(eq(orders.userMobile, mobile)).orderBy(desc(orders.createdAt));
      return res.json({ success: true, data: userOrders });
    } catch (err: any) {
      console.error('Error fetching orders from SQL:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get All Orders from SQL (Admin)
  app.get('/api/sql/orders-all', async (_req, res) => {
    try {
      const { db } = getDb();
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      return res.json({ success: true, data: allOrders });
    } catch (err: any) {
      console.error('Error fetching all orders from SQL:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get All Users from SQL (Admin)
  app.get('/api/sql/users-all', async (_req, res) => {
    try {
      const { db } = getDb();
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      return res.json({ success: true, data: allUsers });
    } catch (err: any) {
      console.error('Error fetching all users from SQL:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save / Upsert Medicine to SQL (Admin)
  app.post('/api/sql/medicines/save', async (req, res) => {
    try {
      const { db } = getDb();
      const med = req.body;
      if (!med || !med.id || !med.name) {
        return res.status(400).json({ success: false, error: 'Medicine id and name are required' });
      }

      const existing = await db.select().from(medicines).where(eq(medicines.id, med.id)).limit(1);
      if (existing.length > 0) {
        await db.update(medicines).set({
          name: med.name,
          genericName: med.genericName || med.name,
          category: med.category || 'Pain & Fever',
          price: Number(med.price) || 0,
          originalPrice: med.originalPrice ? Number(med.originalPrice) : null,
          inStock: med.inStock ?? true,
          prescriptionRequired: med.prescriptionRequired ?? false,
          dosage: med.dosage || 'As directed by physician',
          packSize: med.packSize || '1 Strip',
          image: med.image || '',
          description: med.description || '',
          uses: med.uses || [],
          sideEffects: med.sideEffects || [],
          manufacturer: med.manufacturer || 'MedyFay Pharma',
          rating: Number(med.rating) || 4.8,
          reviewCount: Number(med.reviewCount) || 50,
        }).where(eq(medicines.id, med.id));
      } else {
        await db.insert(medicines).values({
          id: med.id,
          name: med.name,
          genericName: med.genericName || med.name,
          category: med.category || 'Pain & Fever',
          price: Number(med.price) || 0,
          originalPrice: med.originalPrice ? Number(med.originalPrice) : null,
          inStock: med.inStock ?? true,
          prescriptionRequired: med.prescriptionRequired ?? false,
          dosage: med.dosage || 'As directed by physician',
          packSize: med.packSize || '1 Strip',
          image: med.image || '',
          description: med.description || '',
          uses: med.uses || [],
          sideEffects: med.sideEffects || [],
          manufacturer: med.manufacturer || 'MedyFay Pharma',
          rating: Number(med.rating) || 4.8,
          reviewCount: Number(med.reviewCount) || 50,
        });
      }

      return res.json({ success: true, message: 'Medicine saved to SQL database' });
    } catch (err: any) {
      console.error('Error saving medicine to SQL:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete Medicine from SQL (Admin)
  app.delete('/api/sql/medicines/:id', async (req, res) => {
    try {
      const { db } = getDb();
      const { id } = req.params;
      await db.delete(medicines).where(eq(medicines.id, id));
      return res.json({ success: true, message: 'Medicine deleted from SQL database' });
    } catch (err: any) {
      console.error('Error deleting medicine from SQL:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MedyFay Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MedyFay Express Server:', err);
});
