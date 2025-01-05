// Format: CC-CL-NNN
// CC: Two characters representing clinician initials
// CL: First two letters of clinic name
// NNN: 3-digit number (100-999)
// Example: JS-UC-123 (John Smith, UCL Clinic, 123)

const usedIds = new Set<string>();

const generateUniqueNumber = (): string => {
  // Start from 100 to keep it 3 digits
  const min = 100;
  const max = 999;
  let attempts = 0;
  const maxAttempts = 900; // Maximum possible unique numbers

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

export const generateChataId = (clinicianName: string, childName: string) => {
  // Get clinician's first three letters
  const clinicianCode = clinicianName
    .split(' ')[0]  // Take first name
    .substring(0, 3) // Take first three letters
    .toUpperCase();

  // Get child's first three letters
  const childCode = childName
    ? childName
        .split(' ')[0]  // Take first name
        .substring(0, 3) // Take first three letters
        .toUpperCase()
    : 'XXX'; // Default if no child name

  // Generate a random 3-digit number
  const uniqueNumber = Math.floor(Math.random() * 900 + 100);

  return `${clinicianCode}-${childCode}-${uniqueNumber}`;
};

export const validateChataId = (chataId: string) => {
  // Format should be XXX-XXX-123 (3 letters - 3 letters - 3 digits)
  const pattern = /^[A-Z]{3}-[A-Z]{3}-\d{3}$/;
  return pattern.test(chataId);
};

export const parseChataId = (id: string): { 
  initials: string;
  clinic: string;
  number: string;
} | null => {
  if (!validateChataId(id)) return null;
  
  const [initials, clinic, number] = id.split('-');
  return { initials, clinic, number };
};

// Load existing IDs from storage
export const loadExistingIds = (ids: string[]): void => {
  ids.forEach(id => usedIds.add(id));
};

// Clear IDs (useful for testing)
export const clearIds = (): void => {
  usedIds.clear();
}; 