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

export const generateChataId = (clinicianName: string, clinicName: string): string => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0][0] + (parts[0][1] || 'X')).toUpperCase();
  };

  const getClinicPrefix = (clinic: string) => {
    const cleaned = clinic.trim().replace(/[^a-zA-Z]/g, '');
    return cleaned.substring(0, 2).toUpperCase();
  };

  const clinicianInitials = getInitials(clinicianName);
  const clinicPrefix = getClinicPrefix(clinicName);
  let uniqueNumber: string;
  let chataId: string;
  
  do {
    uniqueNumber = generateUniqueNumber();
    chataId = `${clinicianInitials}-${clinicPrefix}-${uniqueNumber}`;
  } while (usedIds.has(chataId));

  usedIds.add(chataId);
  return chataId;
};

export const validateChataId = (id: string): boolean => {
  const pattern = /^[A-Z]{2}-[A-Z]{2}-\d{3}$/;
  return pattern.test(id);
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