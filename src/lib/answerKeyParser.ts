import { QuestionData, AnswerMap } from '@/store/useTestCreationStore';

/**
 * Intelligent GATE Answer Key Parser
 * 
 * Uses structural analysis and heuristic rules to accurately parse
 * GATE answer key tables while ignoring noise (page numbers, headers,
 * watermarks, footers, etc.)
 * 
 * Built entirely from scratch — no API keys, no external AI services.
 */

// --- Known GATE sections for validation ---
const KNOWN_SECTIONS = new Set([
  'GA', 'AE', 'AG', 'AR', 'BM', 'BT', 'CE', 'CH', 'CS', 'CY',
  'DA', 'EC', 'EE', 'ES', 'EY', 'GE', 'GG', 'IN', 'MA', 'ME',
  'MN', 'MT', 'NM', 'PE', 'PH', 'PI', 'ST', 'TF', 'XE', 'XH',
  'XL', 'GENERAL', 'ENGINEERING',
]);

// --- Noise patterns to skip ---
const NOISE_PATTERNS = [
  /^page\s+\d+/i,
  /^page\s*:\s*\d+/i,
  /^\d+\s*of\s*\d+$/i,                       // "1 of 2"
  /^answer\s+key/i,                            // title line
  /^graduate\s+aptitude/i,                     // GATE header
  /^organising\s+institute/i,
  /^indian\s+institute/i,
  /^q[\.\s]*no[\.\s]*session/i,               // column header
  /^question.*type.*section/i,                 // column header variant
  /^[-=_\.]+$/,                                // separator lines
  /^\s*$/,                                     // empty lines
  /^https?:\/\//i,                             // URLs
  /^www\./i,
  /^copyright/i,
  /^disclaimer/i,
  /^note[\s:]/i,
  /^marks?\s*$/i,                              // standalone "Marks" header
  /^key\/?range\s*$/i,                         // standalone "Key/Range" header
  /^session\s*$/i,
];

/**
 * Checks if a line is noise (headers, footers, page numbers, etc.)
 */
function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 2) return true;
  if (trimmed.length > 200) return true; // Very long lines are likely paragraphs, not table rows
  
  for (const pattern of NOISE_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  
  return false;
}

/**
 * Normalizes OCR misreads of question types.
 */
function normalizeType(raw: string): 'MCQ' | 'MSQ' | 'NAT' | null {
  const upper = raw.toUpperCase().trim();
  const typeMap: Record<string, 'MCQ' | 'MSQ' | 'NAT'> = {
    'MCQ': 'MCQ', 'MCO': 'MCQ', 'MCA': 'MCQ', 'MC0': 'MCQ',
    'MSQ': 'MSQ', 'MSO': 'MSQ', 'MS0': 'MSQ', 'MSA': 'MSQ',
    'NAT': 'NAT', 'MAT': 'NAT', 'NA7': 'NAT', 'NAI': 'NAT', 'NAt': 'NAT',
  };
  return typeMap[upper] || null;
}

/**
 * Validates if a string looks like a valid GATE answer key value.
 */
function isValidKey(key: string, type: 'MCQ' | 'MSQ' | 'NAT'): boolean {
  if (!key || key.trim().length === 0) return false;
  
  if (type === 'MCQ') {
    // MCQ answers are single letters A-D
    return /^[A-Da-d]$/.test(key.trim());
  }
  
  if (type === 'MSQ') {
    // MSQ answers are semicolon-separated letters: A;B;C or A;D
    return /^[A-Da-d](;[A-Da-d])*$/.test(key.trim().replace(/\s/g, ''));
  }
  
  if (type === 'NAT') {
    // NAT answers are either a single number or a range like "0.16 to 0.17"
    const rangePattern = /^-?[\d.]+\s+to\s+-?[\d.]+$/;
    const singlePattern = /^-?[\d.]+$/;
    return rangePattern.test(key.trim()) || singlePattern.test(key.trim());
  }
  
  return false;
}

/**
 * Scores how likely a parsed row is to be a valid answer key entry.
 * Returns 0-100. Higher = more confident.
 */
function scoreConfidence(
  qNum: number,
  type: 'MCQ' | 'MSQ' | 'NAT',
  key: string,
  marks: number,
  allQNums: number[]
): number {
  let score = 0;
  
  // Valid question number (1-200 is reasonable for any exam)
  if (qNum >= 1 && qNum <= 200) score += 25;
  else return 0; // Definitely not a question
  
  // Valid key for this type
  if (isValidKey(key, type)) score += 30;
  else score += 5; // Might be OCR error, still partially valid
  
  // GATE marks are always 1 or 2
  if (marks === 1 || marks === 2) score += 20;
  else if (marks > 0 && marks <= 5) score += 5;
  else return 0; // Invalid marks
  
  // Question numbers should be roughly sequential
  if (allQNums.length > 0) {
    const nearbyQ = allQNums.some(q => Math.abs(q - qNum) <= 5);
    if (nearbyQ) score += 15;
  } else {
    score += 10; // First question, give benefit of doubt
  }
  
  // Bonus: Q1-Q10 are almost certainly GA section (1 mark)
  if (qNum <= 10 && marks === 1) score += 10;
  if (qNum >= 6 && qNum <= 10 && marks === 2) score += 10;
  
  return Math.min(100, score);
}

/**
 * Main parser: Analyzes raw text and extracts GATE answer key entries.
 * 
 * Strategy:
 * 1. Split into lines and filter noise
 * 2. For each line, try to match the GATE table row pattern
 * 3. Validate each field (type, key, marks) against GATE rules
 * 4. Score confidence and reject low-confidence entries
 * 5. Post-process: fill gaps, validate sequence
 */
export function parseAnswerKeyText(rawText: string): {
  answerMap: AnswerMap;
  totalParsed: number;
  errors: string[];
  confidence: 'high' | 'medium' | 'low';
} {
  const lines = rawText.split('\n');
  const candidates: Array<{
    qNum: number;
    type: 'MCQ' | 'MSQ' | 'NAT';
    key: string;
    marks: number;
    confidence: number;
    lineIndex: number;
  }> = [];
  const errors: string[] = [];
  const parsedQNums: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip noise
    if (isNoiseLine(line)) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;

    // Strategy 1: Find the question type token (strongest signal)
    let typeIndex = -1;
    let qType: 'MCQ' | 'MSQ' | 'NAT' | null = null;
    
    for (let j = 0; j < parts.length; j++) {
      const normalized = normalizeType(parts[j]);
      if (normalized) {
        typeIndex = j;
        qType = normalized;
        break;
      }
    }

    if (typeIndex === -1 || !qType) continue;

    // Question number: first token that's a number
    let qNum = -1;
    for (let j = 0; j < typeIndex; j++) {
      // Use regex to extract just the digits in case of artifacts like "Q1" or "1."
      const numMatch = parts[j].match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        if (num > 0 && num <= 200) {
          qNum = num;
          break;
        }
      }
    }
    if (qNum === -1) continue;

    // Marks: search backwards from the end for 1 or 2 (GATE marks)
    let marks = -1;
    let marksIndex = -1;
    for (let j = parts.length - 1; j > typeIndex; j--) {
      // Extract digits and optional decimals
      const markMatch = parts[j].match(/^[\d.]+$/);
      if (markMatch) {
        const parsed = parseFloat(markMatch[0]);
        if (parsed > 0 && parsed <= 5) { // Usually 1 or 2, but allow up to 5 just in case
          marks = Math.round(parsed); // Normalize 1.0 to 1
          marksIndex = j;
          break;
        }
      }
    }
    
    if (marks === -1) continue;

    // Key extraction: between type and marks
    const keyParts = parts.slice(typeIndex + 1, marksIndex);
    
    // Optional: filter out known section codes if they got parsed as separate tokens
    if (keyParts.length > 1) {
      const possibleSection = keyParts[0].toUpperCase();
      if (KNOWN_SECTIONS.has(possibleSection) || (possibleSection.length === 2 && /^[A-Z]{2}$/.test(possibleSection))) {
        keyParts.shift(); // Remove the section code
      }
    }
    
    let keyStr = keyParts.join(' ').trim();
    
    // Clean up OCR artifacts in key
    if (qType === 'MCQ') {
      const letterMatch = keyStr.match(/[A-Da-d]/);
      if (letterMatch) keyStr = letterMatch[0].toUpperCase();
    } else if (qType === 'MSQ') {
      keyStr = keyStr.replace(/[,:]/g, ';').replace(/\s+/g, '').toUpperCase();
    }

    // Score this candidate
    const confidence = scoreConfidence(qNum, qType, keyStr, marks, parsedQNums);
    
    // Lowered threshold to 30 to be extremely forgiving for messy OCR
    if (confidence >= 30) {
      candidates.push({
        qNum,
        type: qType,
        key: keyStr,
        marks,
        confidence,
        lineIndex: i,
      });
      parsedQNums.push(qNum);
    } else {
      errors.push(`Line ${i + 1}: Low confidence (${confidence}%) — skipped: "${line}"`);
    }
  }

  // Post-processing: resolve duplicates (keep highest confidence)
  const answerMap: AnswerMap = {};
  const seen = new Map<number, typeof candidates[0]>();
  
  for (const candidate of candidates) {
    const existing = seen.get(candidate.qNum);
    if (!existing || candidate.confidence > existing.confidence) {
      seen.set(candidate.qNum, candidate);
    }
  }

  for (const [qNum, candidate] of seen) {
    answerMap[qNum] = {
      type: candidate.type,
      key: candidate.key,
      marks: candidate.marks,
    };
  }

  const totalParsed = Object.keys(answerMap).length;

  // Overall confidence assessment
  let overallConfidence: 'high' | 'medium' | 'low' = 'low';
  if (totalParsed > 0) {
    const avgConfidence = candidates.reduce((sum, c) => sum + c.confidence, 0) / candidates.length;
    const maxQ = Math.max(...Object.keys(answerMap).map(Number));
    const coverage = totalParsed / maxQ;
    
    if (avgConfidence >= 70 && coverage >= 0.9) overallConfidence = 'high';
    else if (avgConfidence >= 50 && coverage >= 0.7) overallConfidence = 'medium';
  }

  return { answerMap, totalParsed, errors, confidence: overallConfidence };
}

/**
 * Parses answer key from multiple OCR pages.
 */
export function parseAnswerKeyFromPages(pages: string[]): {
  answerMap: AnswerMap;
  totalParsed: number;
  errors: string[];
  confidence: 'high' | 'medium' | 'low';
} {
  const combinedText = pages.join('\n');
  return parseAnswerKeyText(combinedText);
}
