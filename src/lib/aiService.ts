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
  const response = await fetch('/api/ai/prescriptions/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to analyze prescription.');
  }

  return json.data;
}

export async function sendPharmacistChatMessage(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<{
  reply: string;
  recommendedMedicines: any[];
  suggestedFollowUps: string[];
}> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to get pharmacist AI response.');
  }

  return json.data;
}

export async function checkCartSafety(
  items: Array<{ id: string; name: string; genericName: string; dosage: string }>
): Promise<DrugSafetyResult> {
  const response = await fetch('/api/ai/safety-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to check medication safety.');
  }

  return json.data;
}

export async function explainMedicineWithAi(medicine: {
  medicineName: string;
  genericName: string;
  dosage: string;
  category: string;
}): Promise<MedicineExplanationResult> {
  const response = await fetch('/api/ai/medicine-explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medicine),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch AI medicine explanation.');
  }

  return json.data;
}

export async function searchSymptomsWithAi(
  query: string
): Promise<SymptomSearchResult> {
  const response = await fetch('/api/ai/symptom-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || 'Failed to search symptoms with AI.');
  }

  return json.data;
}
