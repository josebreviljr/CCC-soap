export interface AnonymizationResult {
  anonymizedText: string;
  originalText: string;
  replacements: Array<{
    type: string;
    original: string;
    replacement: string;
  }>;
}

export interface AnonymizationConfig {
  anonymizeNames: boolean;
  anonymizeDates: boolean;
  anonymizeAddresses: boolean;
  anonymizePhoneNumbers: boolean;
  anonymizeIds: boolean;
  anonymizeEmails: boolean;
}

export const DEFAULT_ANONYMIZATION_CONFIG: AnonymizationConfig = {
  anonymizeNames: true,
  anonymizeDates: true,
  anonymizeAddresses: true,
  anonymizePhoneNumbers: true,
  anonymizeIds: true,
  anonymizeEmails: true,
};

const NAME_PATTERNS = [
  /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
  /\b(?:Dr|Doctor|Mr|Mrs|Ms|Miss)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/gi,
  /\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b/g,
];

const DATE_PATTERNS = [
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
  /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
  /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/gi,
];

const PHONE_PATTERNS = [
  /\b\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  /\b[0-9]{3}-[0-9]{3}-[0-9]{4}\b/g,
];

const EMAIL_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
];

const ID_PATTERNS = [
  /\b[A-Z]{2,3}\d{6,12}\b/g,
  /\b\d{3}-\d{2}-\d{4}\b/g,
  /\bMRN\s*:?\s*\d+/gi,
  /\b(?:SSN|Social Security)\s*:?\s*\d{3}-?\d{2}-?\d{4}/gi,
];

const ADDRESS_PATTERNS = [
  /\b\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
  /\b[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g,
];

let nameCounter = 1;
let dateCounter = 1;
let phoneCounter = 1;
let emailCounter = 1;
let idCounter = 1;
let addressCounter = 1;

export function anonymizeText(text: string, config: AnonymizationConfig = DEFAULT_ANONYMIZATION_CONFIG): AnonymizationResult {
  let anonymizedText = text;
  const replacements: Array<{ type: string; original: string; replacement: string }> = [];

  if (config.anonymizeNames) {
    NAME_PATTERNS.forEach(pattern => {
      anonymizedText = anonymizedText.replace(pattern, (match) => {
        const replacement = `[NAME_${nameCounter++}]`;
        replacements.push({ type: 'name', original: match, replacement });
        return replacement;
      });
    });
  }

  if (config.anonymizeDates) {
    DATE_PATTERNS.forEach(pattern => {
      anonymizedText = anonymizedText.replace(pattern, (match) => {
        const replacement = `[DATE_${dateCounter++}]`;
        replacements.push({ type: 'date', original: match, replacement });
        return replacement;
      });
    });
  }

  if (config.anonymizePhoneNumbers) {
    PHONE_PATTERNS.forEach(pattern => {
      anonymizedText = anonymizedText.replace(pattern, (match) => {
        const replacement = `[PHONE_${phoneCounter++}]`;
        replacements.push({ type: 'phone', original: match, replacement });
        return replacement;
      });
    });
  }

  if (config.anonymizeEmails) {
    EMAIL_PATTERNS.forEach(pattern => {
      anonymizedText = anonymizedText.replace(pattern, (match) => {
        const replacement = `[EMAIL_${emailCounter++}]`;
        replacements.push({ type: 'email', original: match, replacement });
        return replacement;
      });
    });
  }

  if (config.anonymizeIds) {
    ID_PATTERNS.forEach(pattern => {
      anonymizedText = anonymizedText.replace(pattern, (match) => {
        const replacement = `[ID_${idCounter++}]`;
        replacements.push({ type: 'id', original: match, replacement });
        return replacement;
      });
    });
  }

  if (config.anonymizeAddresses) {
    ADDRESS_PATTERNS.forEach(pattern => {
      anonymizedText = anonymizedText.replace(pattern, (match) => {
        const replacement = `[ADDRESS_${addressCounter++}]`;
        replacements.push({ type: 'address', original: match, replacement });
        return replacement;
      });
    });
  }

  return {
    anonymizedText,
    originalText: text,
    replacements,
  };
}

export function resetCounters(): void {
  nameCounter = 1;
  dateCounter = 1;
  phoneCounter = 1;
  emailCounter = 1;
  idCounter = 1;
  addressCounter = 1;
}