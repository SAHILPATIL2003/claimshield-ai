// ============================================================================
// ClaimShield AI - AI Medical Summary Generation Service
// ============================================================================

import { MedicalSummary } from '../types';

/**
 * Parsers and matches key terms in OCR text to generate a structured medical summary.
 * Acts as a lightweight simulation of a large language model (LLM).
 */
export const generateMedicalSummary = (ocrText: string): MedicalSummary => {
  const text = ocrText;

  // 1. Determine Report Type
  let reportType = 'General Medical Report';
  if (/blood count|haemoglobin|wbc|cbc/i.test(text)) {
    reportType = 'Complete Blood Count (CBC) Report';
  } else if (/x-ray|xray|chest|consolidation|opacity/i.test(text)) {
    reportType = 'Chest X-Ray Radiographic Report';
  } else if (/prescription|rx|tab\.|syr\./i.test(text)) {
    reportType = 'Doctor Medical Prescription';
  } else if (/discharge summary|admitted|discharged|laparoscopic/i.test(text)) {
    reportType = 'Hospital Discharge Summary';
  }

  // 2. Extract Patient Name
  let patientName: string | null = null;
  const nameMatch = text.match(/patient:\s*([a-zA-Z\s]+?)(?=\s+age|\s+gender|\s+date|\n|$)/i);
  if (nameMatch && nameMatch[1]) {
    patientName = nameMatch[1].trim();
  }

  // 3. Extract Date
  let date: string | null = null;
  const dateMatch = text.match(/date:\s*([\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}]+)/i);
  if (dateMatch && dateMatch[1]) {
    date = dateMatch[1].trim();
  }

  // 4. Populate Findings, Abnormalities, and Recommendations
  const keyFindings: string[] = [];
  const abnormalities: string[] = [];
  const recommendations: string[] = [];
  let summary = '';

  if (reportType.includes('Blood Count')) {
    keyFindings.push('Red Blood Cells count is within normal parameters.');
    keyFindings.push('Platelet count is healthy at 250,000 /uL.');
    
    if (/high|elevated/i.test(text) || /11,500/i.test(text)) {
      abnormalities.push('Elevated White Blood Cells (Leukocytosis) count of 11,500 /uL (Normal: 4,000 - 11,000).');
      abnormalities.push('High Neutrophils percentage at 72% (Normal: 40 - 70).');
      recommendations.push('Investigate for signs of active bacterial infection.');
      recommendations.push('Perform clinical verification of symptoms (fever, local pain).');
      summary = 'The blood test indicates elevated White Blood Cell count and high Neutrophils percentage, which suggests the presence of a mild bacterial infection or inflammatory response. Other cell lines (RBCs, Platelets) are within normal thresholds.';
    } else {
      summary = 'The complete blood count test shows all critical cellular counts (RBC, WBC, platelets, hemoglobin) within normal physiological parameters.';
    }
  } else if (reportType.includes('X-Ray')) {
    keyFindings.push('Trachea is midline with normal cardiac silhouette size.');
    keyFindings.push('Costophrenic and cardio-diaphragmatic angles are clear.');

    if (/patchy opacities|consolidation|pneumonia/i.test(text)) {
      abnormalities.push('Patchy opacities/consolidation observed in the right lower lobe, indicative of local infection.');
      abnormalities.push('Prominent bronchovascular markings present bilaterally.');
      recommendations.push('Correlate with sputum culture analysis.');
      recommendations.push('Initiate empirical antibiotic coverage for suspected pneumonia.');
      recommendations.push('Monitor oxygen saturation (SpO2) and fever timeline.');
      summary = 'The chest radiograph reveals patchy opacities in the right lower lobe, which strongly suggests early-stage lobar pneumonia. Visual indicators show clear margins elsewhere without pleural effusion or pneumothorax.';
    } else {
      summary = 'Chest radiograph shows clear lung fields with normal thoracic expansion. No acute cardiopulmonary abnormalities detected.';
    }
  } else if (reportType.includes('Prescription')) {
    if (/amoxicillin/i.test(text)) {
      keyFindings.push('Prescribed Amoxicillin 500mg (1 tablet TID for 5 days) for bacterial coverage.');
    }
    if (/paracetamol/i.test(text)) {
      keyFindings.push('Prescribed Paracetamol 650mg SOS for symptom control.');
    }
    recommendations.push('Ensure complete course of antibiotics is consumed to prevent resistance.');
    recommendations.push('Take medications after meals as directed.');
    summary = 'This is a standard outpatient prescription containing antibiotic coverage (Amoxicillin) for infection control, fever management (Paracetamol), and symptomatic cough relief.';
  } else if (reportType.includes('Discharge Summary')) {
    keyFindings.push('Laparoscopic Cholecystectomy surgical procedure successfully completed.');
    keyFindings.push('Ultrasound previously confirmed gallstones and 4.5mm thickened gallbladder wall.');
    abnormalities.push('Pre-operative acute calculus cholecystitis (gallbladder inflammation).');
    recommendations.push('Adhere to a low-fat dietary regimen during recovery.');
    recommendations.push('Suture removal appointment scheduled in 7 days.');
    recommendations.push('Watch for post-operative warning flags (fever, abdominal pain, jaundice).');
    summary = 'The patient was admitted and underwent a successful laparoscopic cholecystectomy for acute calculus cholecystitis. The post-operative recovery was uncomplicated, and the patient has been discharged home with stable vitals, pain management guidelines, and follow-up care.';
  } else {
    // General fallback
    keyFindings.push('General medical documentation uploaded.');
    recommendations.push('Consult a licensed primary care physician for clinical analysis.');
    summary = 'This is a general health record containing patient clinical metadata. No acute abnormalities or critical indicators were extracted using automatic regex parsing.';
  }

  return {
    patientName,
    date,
    reportType,
    keyFindings,
    abnormalities,
    recommendations,
    summary,
  };
};
