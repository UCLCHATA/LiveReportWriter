  if (!timestamp || !chataId || !responseDocUrl) {
    throw new Error('timestamp, chataId, and responseDocUrl are all required');
  }

  if (!responseDocUrl.startsWith('https://')) {
    throw new Error('Invalid response document URL format');
  }

  enableAdvancedServices();
  const ss = getSpreadsheet();
  Logger.log(`\n=== Processing template for CHATA_ID: ${chataId} ===`);
  Logger.log(`Response document URL: ${responseDocUrl}`);

  let templateUrl;
  if (chataId === 'NO_CHATA') {
    // For NO_CHATA case, use the default template from the first row of R3_Form
    const r3Sheet = ss.getSheetByName('R3_Form');
    if (!r3Sheet) throw new Error('R3_Form sheet not found');
    const r3Data = r3Sheet.getDataRange().getValues();
    const r3Headers = r3Data[0];
    const docUrlIndex = r3Headers.indexOf('Generated (Docx for LLM)');
    templateUrl = r3Data[1][docUrlIndex]; // Use template from first data row
    Logger.log('Using default template for NO_CHATA case');
  } else {
    // Regular case - find template URL for specific CHATA ID
    const r3Sheet = ss.getSheetByName('R3_Form');
    if (!r3Sheet) throw new Error('R3_Form sheet not found');
    const r3Data = r3Sheet.getDataRange().getValues();
    const r3Headers = r3Data[0];
    const chataIdIndex = r3Headers.indexOf('chata_id');
    const docUrlIndex = r3Headers.indexOf('Generated (Docx for LLM)');
    const row = r3Data.find(row => row[chataIdIndex] === chataId);
    if (!row) throw new Error(`No data found for CHATA ID: ${chataId}`);
    templateUrl = row[docUrlIndex];
  }

  if (!templateUrl) throw new Error('Template URL not found');
  Logger.log(`Template URL: ${templateUrl}`);
  const templateId = extractDocIdFromUrl(templateUrl);
  // ... existing code ... 