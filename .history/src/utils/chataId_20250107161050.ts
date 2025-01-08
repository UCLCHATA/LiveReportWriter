// Format: XXX-XXX-NNN
// XXX: Three letters for clinician code
// XXX: Three letters for child code
// NNN: 3-digit number (100-999)
// Example: KOS-XXX-766

const usedIds = new Set<string>();

export const generateChataId = (clinicianName: string, childName: string): string => {
  // Get first three letters of clinician's name (converted to uppercase)
  const clinicianCode = clinicianName
    .replace(/[^a-zA-Z]/g, '')  // Remove non-letters
    .slice(0, 3)
    .toUpperCase();

  // Get first three letters of child's name or use 'XXX' if not provided
  const childCode = childName
    ? childName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()
    : 'XXX';

  // Generate a random number between 100 and 999
  let number;
  do {
    number = Math.floor(Math.random() * 900) + 100;  // 100 to 999
  } while (usedIds.has(`${clinicianCode}-${childCode}-${number}`));

  const chataId = `${clinicianCode}-${childCode}-${number}`;
  usedIds.add(chataId);
  return chataId;
};

export const validateChataId = (chataId: string | null | undefined): boolean => {
  if (!chataId) {
    console.log('CHATA ID validation failed: Empty ID');
    return false;
  }

  // Normalize the input
  const normalizedId = chataId.trim().toUpperCase();
  
  // Basic format check: XXX-XXX-NNN where X can be any letter and N can be any number
  const pattern = /^[A-Z]{3}-[A-Z]{3}-\d{3}$/;
  if (!pattern.test(normalizedId)) {
    console.log('CHATA ID validation failed: Invalid format', { chataId: normalizedId, expectedFormat: 'XXX-XXX-NNN' });
    return false;
  }
  
  // Additional validation if needed
  const [prefix, childCode, number] = normalizedId.split('-');
  const numValue = parseInt(number);
  
  // Ensure number is in valid range (100-999)
  if (numValue < 100 || numValue > 999) {
    console.log('CHATA ID validation failed: Number out of range', { number: numValue, validRange: '100-999' });
    return false;
  }
  
  console.log('CHATA ID validation passed:', { chataId: normalizedId, prefix, childCode, number });
  return true;
};

export const parseChataId = (id: string): { 
  clinicianCode: string;
  childCode: string;
  number: string;
} | null => {
  if (!validateChataId(id)) {
    return null;
  }

  const [clinicianCode, childCode, number] = id.split('-');
  return { clinicianCode, childCode, number };
};

export const loadExistingIds = (ids: string[]) => {
  ids.forEach(id => {
    if (validateChataId(id)) {
      usedIds.add(id);
    }
  });
};

// Clear IDs (useful for testing)
export const clearIds = (): void => {
  usedIds.clear();
}; 