// Format: CC-CL-NNN
// CC: Two characters representing clinician initials
// CL: First two letters of clinic name
// NNN: 3-digit number (100-999)
// Example: JS-UC-123 (John Smith, UCL Clinic, 123)

const usedIds = new Set<string>();

const generateUniqueNumber = (): string => {
  const min = 100;
  const max = 999;
  let attempts = 0;
  const maxAttempts = 900;

  while (attempts < maxAttempts) {
    const num = Math.floor(min + Math.random() * (max - min + 1));
    if (!Array.from(usedIds).some(id => id.endsWith(num.toString()))) {
      return num.toString();
    }
    attempts++;
  }

  // If we can't find a random unique number, use sequential numbering
  for (let i = min; i <= max; i++) {
    if (!Array.from(usedIds).some(id => id.endsWith(i.toString()))) {
      return i.toString();
    }
  }

  throw new Error('No available CHATA IDs');
};

export const generateChataId = (clinicianName: string, childName: string): string => {
  // Get first three letters of clinician's first name
  const clinicianCode = clinicianName
    .split(' ')[0]
    .substring(0, 3)
    .toUpperCase();

  // Get first three letters of child's first name
  const childCode = childName
    ? childName.split(' ')[0].substring(0, 3).toUpperCase()
    : 'XXX';

  // Generate unique number
  const uniqueNumber = generateUniqueNumber();
  const chataId = `${clinicianCode}-${childCode}-${uniqueNumber}`;
  
  usedIds.add(chataId);
  return chataId;
};

export const validateChataId = (chataId: string): boolean => {
  // Format should be XXX-XXX-123 (3 letters - 3 letters - 3 digits)
  const pattern = /^[A-Z]{3}-[A-Z]{3}-\d{3}$/;
  return pattern.test(chataId);
};

export const parseChataId = (id: string): { 
  clinicianCode: string;
  childCode: string;
  number: string;
} | null => {
  if (!validateChataId(id)) return null;
  
  const [clinicianCode, childCode, number] = id.split('-');
  return { clinicianCode, childCode, number };
};

// Load existing IDs from storage
export const loadExistingIds = (ids: string[]): void => {
  ids.forEach(id => usedIds.add(id));
};

// Clear IDs (useful for testing)
export const clearIds = (): void => {
  usedIds.clear();
}; 