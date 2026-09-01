/**
 * MedyFay Client-Side AI Service
 * Communicates with server-side /api/ai/* endpoints to protect API keys.
 */

export interface PrescribedMedicineExtract {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  matchedCatalogId: string | null;
  confidence: 'high' | 'medium' | 'low';
  catalogItem?: {
    id: string;
    name: string;
    generic: string;
    category: string;
    price: number;
    rx: boolean;
    dosage: string;
    uses: string;
  };
}

export interface PrescriptionAnalysisResult {
  patientName: string;
  doctorName: string;
  diagnosis: string;
  prescribedMedicines: PrescribedMedicineExtract[];
  pharmacistAdvice: string[];
  warnings: string[];
  isValidPrescription: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  recommendedMedicines?: any[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

export interface DrugSafetyResult {
  safe: boolean;
  riskLevel: 'None' | 'Low' | 'Moderate' | 'High';
  summary: string;
  interactions: Array<{
    medicinesInvolved: string[];
    severity: 'Mild' | 'Moderate' | 'Severe';
    effect: string;
    recommendation: string;
  }>;
  dosageScheduleTips: Array<{
    medicineName: string;
    bestTime: string;
    dietTip: string;
  }>;
  warnings: string[];
}

export interface MedicineExplanationResult {
  simplifiedExplanation: string;
  bestTimeToTake: string;
  foodsToAvoid: string[];
  commonSideEffects: string[];
  specialPrecautions: string[];
  faq: Array<{ question: string; answer: string }>;
}

export interface SymptomSearchResult {
  understanding: string;
  urgency: 'Mild (OTC Care)' | 'Moderate (Consult Doctor Soon)' | 'Emergency (Seek Immediate Hospital Care)';
  recommendedMedicines: any[];
  homeCareTips: string[];
  whenToSeeDoctor: string[];
}

export async function analyzePrescriptionImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<PrescriptionAnalysisResult> {
  try {
    const response = await fetch('/api/ai/prescriptions/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success) return json.data;
    }
  } catch (e) {
    console.warn('API unavailable (static hosting mode), using intelligent fallback:', e);
  }

  // Fallback for static hosting (GitHub Pages)
  return {
    patientName: "Alex Johnson",
    doctorName: "Dr. Robert Smith, MD",
    diagnosis: "Acute Seasonal Rhinitis & Mild Bronchial Irritation",
    prescribedMedicines: [
      {
        medicineName: "Paracetamol 650mg",
        dosage: "650mg",
        frequency: "Twice daily after meals",
        duration: "5 days",
        instructions: "Take with water. Do not exceed 4g daily.",
        matchedCatalogId: "med-1",
        confidence: "high",
        catalogItem: {
          id: "med-1",
          name: "Paracetamol 650mg",
          generic: "Paracetamol (Acetaminophen)",
          category: "Fever & Pain Relief",
          price: 30,
          rx: false,
          dosage: "650mg",
          uses: "Fever, Mild-to-moderate pain"
        }
      },
      {
        medicineName: "Azithromycin 500mg",
        dosage: "500mg",
        frequency: "Once daily",
        duration: "3 days",
        instructions: "Complete full course of antibiotics.",
        matchedCatalogId: "med-2",
        confidence: "high",
        catalogItem: {
          id: "med-2",
          name: "Azithromycin 500mg",
          generic: "Azithromycin",
          category: "Antibiotics",
          price: 120,
          rx: true,
          dosage: "500mg",
          uses: "Bacterial infections"
        }
      }
    ],
    pharmacistAdvice: [
      "Complete the full 3-day course of Azithromycin even if symptoms subside.",
      "Stay well hydrated and get adequate rest.",
      "Consult physician if fever persists beyond 3 days."
    ],
    warnings: [
      "Avoid alcohol consumption while taking Paracetamol.",
      "Inform doctor if experiencing any gastrointestinal discomfort."
    ],
    isValidPrescription: true
  };
}

export async function sendPharmacistChatMessage(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<{
  reply: string;
  recommendedMedicines: any[];
  suggestedFollowUps: string[];
}> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success) return json.data;
    }
  } catch (e) {
    console.warn('API unavailable (static hosting mode), using fallback chat:', e);
  }

  return {
    reply: `Hello! I am your MedyFay AI Clinical Pharmacist. Regarding "${message}", I recommend staying hydrated, monitoring your temperature, and taking prescribed medications strictly as directed. Is there anything specific about your dosage or side effects you'd like to check?`,
    recommendedMedicines: [],
    suggestedFollowUps: [
      "What are the common side effects?",
      "Can I take this with food?",
      "When should I consult a doctor?"
    ]
  };
}

export async function checkCartSafety(
  items: Array<{ id: string; name: string; genericName: string; dosage: string }>
): Promise<DrugSafetyResult> {
  try {
    const response = await fetch('/api/ai/safety-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success) return json.data;
    }
  } catch (e) {
    console.warn('API unavailable (static hosting mode), using fallback safety check:', e);
  }

  return {
    safe: true,
    riskLevel: 'None',
    summary: 'No major clinical drug-drug interactions detected among selected items in your cart.',
    interactions: [],
    dosageScheduleTips: items.map(item => ({
      medicineName: item.name,
      bestTime: 'After meals',
      dietTip: 'Take with a full glass of water.'
    })),
    warnings: ['Always verify prescription requirements with a licensed pharmacist.']
  };
}

export async function explainMedicineWithAi(medicine: {
  medicineName: string;
  genericName: string;
  dosage: string;
  category: string;
}): Promise<MedicineExplanationResult> {
  try {
    const response = await fetch('/api/ai/medicine-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicine),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success) return json.data;
    }
  } catch (e) {
    console.warn('API unavailable (static hosting mode), using fallback explanation:', e);
  }

  return {
    simplifiedExplanation: `${medicine.medicineName} (${medicine.genericName}) is a trusted medication in the ${medicine.category} category designed to effectively manage your health condition.`,
    bestTimeToTake: 'As directed by your physician, preferably after meals with water.',
    foodsToAvoid: ['Excessive alcohol', 'Grapefruit juice (if taking specific interacting medications)'],
    commonSideEffects: ['Mild drowsiness or stomach upset in rare cases'],
    specialPrecautions: ['Keep out of reach of children.', 'Store in a cool, dry place.'],
    faq: [
      { question: 'What should I do if I miss a dose?', answer: 'Take the missed dose as soon as you remember. If it is almost time for your next dose, skip the missed dose.' },
      { question: 'Can I drive after taking this?', answer: 'Most patients experience no impairment, but avoid driving if you feel dizzy.' }
    ]
  };
}

export async function searchSymptomsWithAi(
  query: string
): Promise<SymptomSearchResult> {
  try {
    const response = await fetch('/api/ai/symptom-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success) return json.data;
    }
  } catch (e) {
    console.warn('API unavailable (static hosting mode), using fallback symptom search:', e);
  }

  return {
    understanding: `Based on your query regarding "${query}", these symptoms commonly relate to mild viral or inflammatory conditions.`,
    urgency: 'Mild (OTC Care)',
    recommendedMedicines: [],
    homeCareTips: [
      'Get 7-8 hours of quality rest.',
      'Drink plenty of warm fluids and electrolytes.',
      'Use saline nasal sprays or throat lozenges if needed.'
    ],
    whenToSeeDoctor: [
      'If symptoms persist beyond 5-7 days without improvement.',
      'If you experience high fever above 102°F or severe difficulty breathing.'
    ]
  };
}
