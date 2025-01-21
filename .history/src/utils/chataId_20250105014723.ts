// Format: CC-YYYYMM-XXXX
// CC: Two characters representing clinician initials
// YYYYMM: Year and month
// XXXX: Random 4-digit number
// Example: JS-202401-1234

export const generateChataId = (clinicianName: string): string => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0][0] + (parts[0][1] || 'X')).toUpperCase();
  };

  const today = new Date();
  const yearMonth = today.getFullYear().toString() + 
    (today.getMonth() + 1).toString().padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number

  return `${getInitials(clinicianName)}-${yearMonth}-${randomNum}`;
};

export const validateChataId = (id: string): boolean => {
  const pattern = /^[A-Z]{2}-\d{6}-\d{4}$/;
  return pattern.test(id);
};

export const parseChataId = (id: string): { 
  initials: string;
  yearMonth: string;
  number: string;
} | null => {
  if (!validateChataId(id)) return null;
  
  const [initials, yearMonth, number] = id.split('-');
  return { initials, yearMonth, number };
}; 