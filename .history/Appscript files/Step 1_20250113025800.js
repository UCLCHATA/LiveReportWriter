const CONFIG_R3 = {
    sheetId: '1Ap9HfUWhE-ed1zIMT2QGf02yhZt7wiawKeFkDz8dcnA',
    templateId: '1FrB47q-LB5T5z1F3sk-j84bwoPM90LOvrN8CJzdwBPQ',
    wordDocsFolderId: '1vlVlkaOiXFSVbbynxUyi6zcg9gNcYJ4D',
    templateVersion: '1.0',
    clinicName: 'CHATA Clinic',
    sheets: {
      CHATA: 'CHATA_Data',
      ADOS: 'ADOS_Data',
      R3: 'R3_Form'
    },
    dateColumns: {
      CHATA_Data: 'Date_of_Assessment',
      ADOS_Data: 'Date_of_Assessment',
      R3_Form: 'timestamp'
    }
  };
  
  function formatDateWithOrdinal(date) {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();
    
    const ordinal = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
  
    return `${day}${ordinal(day)} ${month} ${year}`;
  }
  
  function getDateFromSheet(sheetName, chataId, dateColumnName) {
    const sheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Handle different case in ID column names
    const idColumnIndex = headers.indexOf('CHATA_ID');
    const dateColumnIndex = headers.indexOf(dateColumnName);
    
    if (idColumnIndex === -1 || dateColumnIndex === -1) {
      Logger.log(`Column not found - ID Column: ${idColumnIndex}, Date Column: ${dateColumnIndex}`);
      Logger.log(`Available headers: ${headers.join(', ')}`);
      return null;
    }
    
    const row = data.find(row => row[idColumnIndex] === chataId);
    if (!row) {
      Logger.log(`No row found for CHATA_ID: ${chataId}`);
      return null;
    }
    return row[dateColumnIndex];
  }
  
  function testGetDateFromSheet() {
    try {
      Logger.log('Testing getDateFromSheet function...');
      
      // Test parameters
      const testCases = [
        {
          sheetName: CONFIG_R3.sheets.CHATA,
          chataId: 'CHATA001',
          dateColumn: CONFIG_R3.dateColumns.CHATA_Data
        },
        {
          sheetName: CONFIG_R3.sheets.ADOS,
          chataId: 'CHATA001',
          dateColumn: CONFIG_R3.dateColumns.ADOS_Data
        }
      ];
      
      testCases.forEach(test => {
        Logger.log(`Testing sheet: ${test.sheetName}`);
        const date = getDateFromSheet(test.sheetName, test.chataId, test.dateColumn);
        Logger.log(`Retrieved date: ${date}`);
        if (date) {
          Logger.log(`Formatted date: ${formatDateWithOrdinal(date)}`);
        }
      });
      
      return 'Date retrieval test completed - check logs for details';
      
    } catch (error) {
      Logger.log(`Error in test: ${error}`);
      return `Test failed: ${error.message}`;
    }
  }
  
  function testR3TimestampRetrieval() {
    try {
      Logger.log('Testing R3 Form timestamp retrieval...');
      
      const r3Sheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.R3);
      const r3Data = r3Sheet.getDataRange().getValues();
      const r3Headers = r3Data[0];
      
      // Get timestamp column index
      const timestampIndex = r3Headers.indexOf(CONFIG_R3.dateColumns.R3_Form);
      const idIndex = r3Headers.indexOf('chata_id');
      
      if (timestampIndex === -1 || idIndex === -1) {
        throw new Error('Required columns not found in R3_Form');
      }
      
      // Get first row's data
      const firstRow = r3Data[1];
      const chataId = firstRow[idIndex];
      const timestamp = firstRow[timestampIndex];
      
      Logger.log(`Testing with CHATA_ID: ${chataId}`);
      Logger.log(`Raw timestamp: ${timestamp}`);
      Logger.log(`Formatted timestamp: ${formatDateWithOrdinal(timestamp)}`);
      
      return 'Timestamp test completed - check logs for details';
      
    } catch (error) {
      Logger.log(`Error in timestamp test: ${error}`);
      return `Test failed: ${error.message}`;
    }
  }
  
  function testReportGeneration() {
    try {
      Logger.log('Starting test report generation...');
      
      // 1. Get test data from first row of R3_Form
      const r3Sheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.R3);
      const r3Data = r3Sheet.getDataRange().getValues();
      const r3Headers = r3Data[0];
      const testRow = r3Data[1];
      
      // Get CHATA_ID for test
      const chataId = testRow[r3Headers.indexOf('chata_id')];
      Logger.log(`Testing with CHATA_ID: ${chataId}`);
      
      // 2. Create test document
      const fileName = `TEST_R3_${chataId}_${new Date().getTime()}`;
      const docCopy = DriveApp.getFileById(CONFIG_R3.templateId)
        .makeCopy(fileName, DriveApp.getFolderById(CONFIG_R3.wordDocsFolderId));
      const doc = DocumentApp.openById(docCopy.getId());
      const body = doc.getBody();
      
      // 3. Get dates from all three sources
      const date1 = getDateFromSheet(CONFIG_R3.sheets.CHATA, chataId, CONFIG_R3.dateColumns.CHATA_Data);
      const date2 = getDateFromSheet(CONFIG_R3.sheets.ADOS, chataId, CONFIG_R3.dateColumns.ADOS_Data);
      const date3 = testRow[r3Headers.indexOf(CONFIG_R3.dateColumns.R3_Form)];
      
      // 4. Format dates
      const formattedDates = {
        DATE_1: formatDateWithOrdinal(date1),
        DATE_2: formatDateWithOrdinal(date2),
        DATE_3: formatDateWithOrdinal(date3)
      };
      
      // 5. Replace date placeholders
      Object.entries(formattedDates).forEach(([placeholder, value]) => {
        Logger.log(`Replacing {{${placeholder}}} with ${value}`);
        body.replaceText(`{{${placeholder}}}`, value);
      });
      
      // 6. Save document
      doc.saveAndClose();
      
      // 7. Log document URL for verification
      Logger.log(`Test document created: ${docCopy.getUrl()}`);
      
      return {
        success: true,
        documentUrl: docCopy.getUrl(),
        replacedValues: formattedDates
      };
      
    } catch (error) {
      Logger.log(`Error in test report generation: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  function testTemplateAccess() {
    try {
      Logger.log('Testing template document access...');
      
      // 1. Test if we can access the template
      const templateFile = DriveApp.getFileById(CONFIG_R3.templateId);
      Logger.log(`Template name: ${templateFile.getName()}`);
      Logger.log(`Template owner: ${templateFile.getOwner().getEmail()}`);
      Logger.log(`Template sharing settings: ${templateFile.getSharingAccess()}`);
      Logger.log(`Template mime type: ${templateFile.getMimeType()}`);
      
      // 2. Test if we can access the destination folder
      const folder = DriveApp.getFolderById(CONFIG_R3.wordDocsFolderId);
      Logger.log(`Destination folder name: ${folder.getName()}`);
      Logger.log(`Folder owner: ${folder.getOwner().getEmail()}`);
      Logger.log(`Folder sharing settings: ${folder.getSharingAccess()}`);
      
      // Try to open the template as a Document
      try {
        const doc = DocumentApp.openById(CONFIG_R3.templateId);
        Logger.log('Successfully opened template as Google Doc');
      } catch (docError) {
        Logger.log(`Error opening as Google Doc: ${docError}`);
        Logger.log('Template might be in Word format (.docx)');
      }
      
      return {
        success: true,
        message: 'Access test completed - check logs'
      };
      
    } catch (error) {
      Logger.log(`Error testing access: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  function testPlaceholderReplacement() {
    try {
      Logger.log('Starting placeholder replacement test...');
      
      // 1. Create a test document with sample placeholders
      const testDoc = DocumentApp.create('TEST_Placeholder_Replacement');
      const body = testDoc.getBody();
      
      // 2. Add test placeholders
      body.appendParagraph('Test Report');
      body.appendParagraph('Date 1: {{DATE_1}}');
      body.appendParagraph('Date 2: {{DATE_2}}');
      body.appendParagraph('Date 3: {{DATE_3}}');
      
      // 3. Get test data
      const r3Sheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.R3);
      const r3Data = r3Sheet.getDataRange().getValues();
      const r3Headers = r3Data[0];
      const testRow = r3Data[1];
      const chataId = testRow[r3Headers.indexOf('chata_id')];
      
      // 4. Get dates
      const date1 = getDateFromSheet(CONFIG_R3.sheets.CHATA, chataId, CONFIG_R3.dateColumns.CHATA_Data);
      const date2 = getDateFromSheet(CONFIG_R3.sheets.ADOS, chataId, CONFIG_R3.dateColumns.ADOS_Data);
      const date3 = testRow[r3Headers.indexOf(CONFIG_R3.dateColumns.R3_Form)];
      
      // 5. Format and replace
      const replacements = {
        DATE_1: formatDateWithOrdinal(date1),
        DATE_2: formatDateWithOrdinal(date2),
        DATE_3: formatDateWithOrdinal(date3)
      };
      
      Object.entries(replacements).forEach(([placeholder, value]) => {
        Logger.log(`Replacing {{${placeholder}}} with ${value}`);
        body.replaceText(`{{${placeholder}}}`, value);
      });
      
      // 6. Save and log URL
      testDoc.saveAndClose();
      const testFile = DriveApp.getFileById(testDoc.getId());
      Logger.log(`Test document URL: ${testFile.getUrl()}`);
      
      // 7. Move to correct folder
      const folder = DriveApp.getFolderById(CONFIG_R3.wordDocsFolderId);
      folder.addFile(testFile);
      DriveApp.getRootFolder().removeFile(testFile);
      
      return {
        success: true,
        documentUrl: testFile.getUrl(),
        replacements: replacements
      };
      
    } catch (error) {
      Logger.log(`Error in placeholder test: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  function testPlaceholderReplacementWithNames() {
    try {
      Logger.log('Starting placeholder replacement test with names...');
      
      // 1. Create test document with all placeholders
      const testDoc = DocumentApp.create('TEST_All_Placeholders');
      const body = testDoc.getBody();
      
      // 2. Add test placeholders
      body.appendParagraph('Test Report');
      body.appendParagraph('Child Name: {{Child_Name}}');
      body.appendParagraph('Parent Name: {{Parent_Name}}');
      body.appendParagraph('Clinic Name: {{Clinic_Name}}');
      body.appendParagraph('Clinician Name: {{Clinician_Name}}');
      body.appendParagraph('Date of Birth: {{Date_of_Birth}}');
      body.appendParagraph('Age: {{Age}}');
      body.appendParagraph('Date 1: {{DATE_1}}');
      body.appendParagraph('Date 2: {{DATE_2}}');
      body.appendParagraph('Date 3: {{DATE_3}}');
      
      // 3. Get data from ADOS_Data for names
      const adosSheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.ADOS);
      const adosData = adosSheet.getDataRange().getValues();
      const adosHeaders = adosData[0];
      
      // 4. Get test data from R3_Form
      const r3Sheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.R3);
      const r3Data = r3Sheet.getDataRange().getValues();
      const r3Headers = r3Data[0];
      const testRow = r3Data[1];
      const chataId = testRow[r3Headers.indexOf('chata_id')];
      
      // 5. Find matching ADOS row
      const adosRow = adosData.find(row => row[adosHeaders.indexOf('CHATA_ID')] === chataId);
      
      if (!adosRow) {
        throw new Error(`No matching ADOS data found for CHATA_ID: ${chataId}`);
      }
      
      // 6. Get dates
      const date1 = getDateFromSheet(CONFIG_R3.sheets.CHATA, chataId, CONFIG_R3.dateColumns.CHATA_Data);
      const date2 = getDateFromSheet(CONFIG_R3.sheets.ADOS, chataId, CONFIG_R3.dateColumns.ADOS_Data);
      const date3 = testRow[r3Headers.indexOf(CONFIG_R3.dateColumns.R3_Form)];
      
      // 7. Prepare all replacements
      const replacements = {
        Child_Name: adosRow[adosHeaders.indexOf('Child_Name')],
        Child_FirstName: getFirstName(adosRow[adosHeaders.indexOf('Child_Name')]),
        Parent_Name: adosRow[adosHeaders.indexOf('Parent_Name')],
        Clinic_Name: adosRow[adosHeaders.indexOf('Clinic_Name')],
        Clinician_Name: adosRow[adosHeaders.indexOf('Clinician_Name')],
        
        // Dates from respective sheets
        Date_of_Birth: parseAndFormatDate(adosRow[adosHeaders.indexOf('Date_of_Birth')]),
        Date_of_Assessment: parseAndFormatDate(adosRow[adosHeaders.indexOf('Date_of_Assessment')]),
        DATE_1: formatDateWithOrdinal(date1),  // From CHATA_Data
        DATE_2: formatDateWithOrdinal(date2),  // From ADOS_Data (Assessment_Date)
        DATE_3: formatDateWithOrdinal(date3),  // From R3_Form timestamp
        
        // Age calculation using R3_Form timestamp (date3)
        Age: calculateAge(adosRow[adosHeaders.indexOf('Date_of_Birth')], date3)
      };
      
      // 8. Replace all placeholders (handle all case variations)
      Object.entries(replacements).forEach(([placeholder, value]) => {
        if (value !== undefined && value !== null) {
          if (placeholder === 'Child_Name') {
            // First occurrence - use full name in header
            body.replaceText("Child's Name:", `Child's Name: ${value}`);
            body.replaceText("CHILD'S NAME:", `CHILD'S NAME: ${value}`);
            
            // Handle specific case in Appendix B
            body.replaceText("{{CHILD_NAME}}'s", `${value}'s`);
            body.replaceText("{{Child_Name}}'s", `${value}'s`);
            
            // For all other occurrences, use first name
            const variations = [
              `{{${placeholder}}}`,
              `{{${placeholder.toUpperCase()}}}`,
              `{{${placeholder.toLowerCase()}}}`,
              `{${placeholder}}`,
              `{${placeholder.toUpperCase()}}`,
              `{${placeholder.toLowerCase()}}`
            ];
            
            variations.forEach(pattern => {
              body.replaceText(pattern, getFirstName(value));
            });
            
            Logger.log(`Replaced ${placeholder} with full name for header and Appendix B, first name for others`);
          } else {
            // Handle other placeholders as before
            const variations = [
              `{{${placeholder}}}`,
              `{{${placeholder.toUpperCase()}}}`,
              `{{${placeholder.toLowerCase()}}}`,
              `{${placeholder}}`,
              `{${placeholder.toUpperCase()}}`,
              `{${placeholder.toLowerCase()}}`
            ];
            variations.forEach(pattern => {
              body.replaceText(pattern, value.toString());
            });
          }
        }
      });
      
      // 9. Save and move
      testDoc.saveAndClose();
      const testFile = DriveApp.getFileById(testDoc.getId());
      const folder = DriveApp.getFolderById(CONFIG_R3.wordDocsFolderId);
      folder.addFile(testFile);
      DriveApp.getRootFolder().removeFile(testFile);
      
      Logger.log(`Test document URL: ${testFile.getUrl()}`);
      
      return {
        success: true,
        documentUrl: testFile.getUrl(),
        replacements: replacements
      };
      
    } catch (error) {
      Logger.log(`Error in placeholder test: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  function parseAndFormatDate(dateString) {
    try {
      Logger.log(`Parsing date: ${dateString}`);
      
      // If it's already a Date object
      if (dateString instanceof Date) {
        return formatDateWithOrdinal(dateString);
      }
      
      // If it's a string in dd/MM/yyyy format
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(num => parseInt(num, 10));
        const date = new Date(year, month - 1, day);  // month is 0-based
        Logger.log(`Parsed date from dd/MM/yyyy: ${date}`);
        return formatDateWithOrdinal(date);
      }
      
      // Try standard date parsing
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return formatDateWithOrdinal(date);
      }
      
      throw new Error(`Unable to parse date: ${dateString}`);
    } catch (error) {
      Logger.log(`Error in parseAndFormatDate: ${error}`);
      return 'Invalid Date';
    }
  }
  
  function validateAdosData(adosRow, adosHeaders) {
    try {
      Logger.log('Validating ADOS data...');
      Logger.log('Headers available:', adosHeaders);
      
      const requiredFields = [
        'CHATA_ID',
        'Child_Name',
        'Date_of_Birth',
        'Date_of_Assessment',
        'Parent_Name',
        'Clinic_Name',
        'Clinician_Name'
      ];
      
      // Log all field indices first
      requiredFields.forEach(field => {
        const index = adosHeaders.indexOf(field);
        Logger.log(`Field ${field} found at index: ${index}`);
      });
      
      const missingFields = requiredFields.filter(field => {
        const index = adosHeaders.indexOf(field);
        const value = adosRow[index];
        Logger.log(`Checking ${field} (index ${index}): ${value}`);
        return value === undefined || value === null || value.toString().trim() === '';
      });
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required ADOS fields: ${missingFields.join(', ')}`);
      }
      
      // Validate dates
      const dateFields = ['Date_of_Birth', 'Date_of_Assessment'];
      dateFields.forEach(field => {
        const index = adosHeaders.indexOf(field);
        const date = adosRow[index];
        Logger.log(`Validating ${field}: ${date}`);
        if (!date) {
          throw new Error(`${field} is required`);
        }
        try {
          parseDate(date);
        } catch (error) {
          throw new Error(`Invalid ${field} format: ${date}`);
        }
      });
      
      return true;
    } catch (error) {
      Logger.log(`ADOS data validation error: ${error}`);
      throw error;
    }
  }
  
  function validateAdosDataForId(chataId) {
    try {
      Logger.log(`Starting ADOS data validation for CHATA_ID: ${chataId}`);
      
      // Get ADOS data
      const adosSheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.ADOS);
      const adosData = adosSheet.getDataRange().getValues();
      const adosHeaders = adosData[0];
      
      // Find matching row
      const adosRow = adosData.find(row => row[adosHeaders.indexOf('CHATA_ID')] === chataId);
      
      if (!adosRow) {
        throw new Error(`No matching ADOS data found for CHATA_ID: ${chataId}`);
      }
      
      // Run validation
      return validateAdosData(adosRow, adosHeaders);
      
    } catch (error) {
      Logger.log(`Error in ADOS validation: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  function testAdosDataValidation() {
    try {
      Logger.log('Starting ADOS data validation test...');
      
      // Get ADOS data
      const adosSheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.ADOS);
      const adosData = adosSheet.getDataRange().getValues();
      const adosHeaders = adosData[0];
      
      // Get test CHATA_ID from R3_Form
      const r3Sheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.R3);
      const r3Data = r3Sheet.getDataRange().getValues();
      const r3Headers = r3Data[0];
      const testRow = r3Data[1];
      const chataId = testRow[r3Headers.indexOf('chata_id')];
      
      Logger.log(`Testing with CHATA_ID: ${chataId}`);
      
      // Find matching ADOS row
      const adosRow = adosData.find(row => row[adosHeaders.indexOf('CHATA_ID')] === chataId);
      
      if (!adosRow) {
        throw new Error(`No matching ADOS data found for CHATA_ID: ${chataId}`);
      }
      
      // Log raw data before validation
      Logger.log('ADOS Headers:', adosHeaders);
      Logger.log('ADOS Row data:', adosRow);
      
      // Run validation
      const isValid = validateAdosData(adosRow, adosHeaders);
      
      if (isValid) {
        Logger.log('ADOS data validation passed');
      }
      
      return {
        success: true,
        message: 'Validation test completed successfully'
      };
      
    } catch (error) {
      Logger.log(`Error in validation test: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  function generateR3ReportForId(chataId) {
    try {
      Logger.log(`Starting R3 report generation for CHATA_ID: ${chataId}`);
      
      // 1. Get data from all sheets
      const adosSheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.ADOS);
      const adosData = adosSheet.getDataRange().getValues();
      const adosHeaders = adosData[0];
      
      const r3Sheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.R3);
      const r3Data = r3Sheet.getDataRange().getValues();
      const r3Headers = r3Data[0];
      
      // 2. Find matching rows
      const adosRow = adosData.find(row => row[adosHeaders.indexOf('CHATA_ID')] === chataId);
      const r3Row = r3Data.find(row => row[r3Headers.indexOf('chata_id')] === chataId);
      
      if (!adosRow || !r3Row) {
        throw new Error(`Data not found for CHATA_ID: ${chataId}`);
      }
      
      // 3. Get dates from all sources
      const date1 = getDateFromSheet(CONFIG_R3.sheets.CHATA, chataId, CONFIG_R3.dateColumns.CHATA_Data);
      const date2 = getDateFromSheet(CONFIG_R3.sheets.ADOS, chataId, CONFIG_R3.dateColumns.ADOS_Data);
      const date3 = r3Row[r3Headers.indexOf(CONFIG_R3.dateColumns.R3_Form)];
      
      // 4. Create document from Google Doc template
      const fileName = `R3_LLM Template_${adosRow[adosHeaders.indexOf('Child_Name')].replace(/\s+/g, '_')}_${chataId}`;
      const docCopy = DriveApp.getFileById(CONFIG_R3.templateId).makeCopy(fileName);
      const doc = DocumentApp.openById(docCopy.getId());
      const body = doc.getBody();
      
      // Move to correct folder
      const folder = DriveApp.getFolderById(CONFIG_R3.wordDocsFolderId);
      folder.addFile(docCopy);
      DriveApp.getRootFolder().removeFile(docCopy);
      
      // 5. Prepare all replacements
      const replacements = {
        // Names and basic info from ADOS_Data
        Child_Name: adosRow[adosHeaders.indexOf('Child_Name')],
        Child_FirstName: getFirstName(adosRow[adosHeaders.indexOf('Child_Name')]),
        Parent_Name: adosRow[adosHeaders.indexOf('Parent_Name')],
        Clinic_Name: adosRow[adosHeaders.indexOf('Clinic_Name')],
        Clinician_Name: adosRow[adosHeaders.indexOf('Clinician_Name')],
        
        // Dates from respective sheets
        Date_of_Birth: parseAndFormatDate(adosRow[adosHeaders.indexOf('Date_of_Birth')]),
        Date_of_Assessment: parseAndFormatDate(adosRow[adosHeaders.indexOf('Date_of_Assessment')]),
        DATE_1: formatDateWithOrdinal(date1),  // From CHATA_Data
        DATE_2: formatDateWithOrdinal(date2),  // From ADOS_Data (Assessment_Date)
        DATE_3: formatDateWithOrdinal(date3),  // From R3_Form timestamp
        
        // Age calculation using R3_Form timestamp (date3)
        Age: calculateAge(adosRow[adosHeaders.indexOf('Date_of_Birth')], date3)
      };
      
      // 6. Replace all placeholders (handle all case variations)
      Object.entries(replacements).forEach(([placeholder, value]) => {
        if (value !== undefined && value !== null) {
          if (placeholder === 'Child_Name') {
            // First occurrence - use full name in header
            body.replaceText("Child's Name:", `Child's Name: ${value}`);
            body.replaceText("CHILD'S NAME:", `CHILD'S NAME: ${value}`);
            
            // Handle specific case in Appendix B
            body.replaceText("{{CHILD_NAME}}'s", `${value}'s`);
            body.replaceText("{{Child_Name}}'s", `${value}'s`);
            
            // For all other occurrences, use first name
            const variations = [
              `{{${placeholder}}}`,
              `{{${placeholder.toUpperCase()}}}`,
              `{{${placeholder.toLowerCase()}}}`,
              `{${placeholder}}`,
              `{${placeholder.toUpperCase()}}`,
              `{${placeholder.toLowerCase()}}`
            ];
            
            variations.forEach(pattern => {
              body.replaceText(pattern, getFirstName(value));
            });
            
            Logger.log(`Replaced ${placeholder} with full name for header and Appendix B, first name for others`);
          } else {
            // Handle other placeholders as before
            const variations = [
              `{{${placeholder}}}`,
              `{{${placeholder.toUpperCase()}}}`,
              `{{${placeholder.toLowerCase()}}}`,
              `{${placeholder}}`,
              `{${placeholder.toUpperCase()}}`,
              `{${placeholder.toLowerCase()}}`
            ];
            variations.forEach(pattern => {
              body.replaceText(pattern, value.toString());
            });
          }
        }
      });
      
      // 7. Save document
      doc.saveAndClose();
      
      // 8. Update R3_Form with document URL
      const urlColIndex = r3Headers.indexOf('Generated (Docx for LLM)');
      if (urlColIndex !== -1) {
        const r3RowIndex = r3Data.findIndex(row => row[r3Headers.indexOf('chata_id')] === chataId);
        if (r3RowIndex !== -1) {
          r3Sheet.getRange(r3RowIndex + 1, urlColIndex + 1).setValue(docCopy.getUrl());
        }
      }
      
      Logger.log(`Report generated successfully: ${docCopy.getUrl()}`);
      
      return {
        success: true,
        documentUrl: docCopy.getUrl(),
        replacements: replacements
      };
      
    } catch (error) {
      Logger.log(`Error generating R3 report: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  function testGenerateR3Report() {
    try {
      Logger.log('Starting R3 report generation test...');
      
      // Get first CHATA_ID from R3_Form for testing
      const r3Sheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.R3);
      const r3Data = r3Sheet.getDataRange().getValues();
      const r3Headers = r3Data[0];
      const testRow = r3Data[1];
      const chataId = testRow[r3Headers.indexOf('chata_id')];
      
      Logger.log(`Testing with CHATA_ID: ${chataId}`);
      
      // Generate report
      const result = generateR3ReportForId(chataId);
      
      if (result.success) {
        Logger.log('Report generated successfully');
        Logger.log(`Document URL: ${result.documentUrl}`);
        Logger.log('Replacements made:');
        Object.entries(result.replacements).forEach(([key, value]) => {
          Logger.log(`  ${key}: ${value}`);
        });
      } else {
        Logger.log(`Report generation failed: ${result.error}`);
      }
      
      return result;
      
    } catch (error) {
      Logger.log(`Error in test: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  function calculateAge(birthDateString, assessmentDateString) {
    try {
      Logger.log(`Calculating age between ${birthDateString} and ${assessmentDateString}`);
      const birthDate = parseDate(birthDateString);
      const assessmentDate = parseDate(assessmentDateString);
  
      Logger.log(`Parsed dates - Birth: ${birthDate}, Assessment: ${assessmentDate}`);
  
      if (isNaN(birthDate.getTime()) || isNaN(assessmentDate.getTime())) {
        throw new Error('Invalid date conversion');
      }
  
      let years = assessmentDate.getFullYear() - birthDate.getFullYear();
      let months = assessmentDate.getMonth() - birthDate.getMonth();
  
      if (assessmentDate.getDate() < birthDate.getDate()) {
        months--;
      }
      if (months < 0) {
        years--;
        months += 12;
      }
  
      Logger.log(`Calculated age: ${years} years, ${months} months`);
      return `${years}y, ${months}m`;
    } catch (error) {
      Logger.log(`Error calculating age: ${error}`);
      Logger.log(`Birth date string: ${birthDateString}`);
      Logger.log(`Assessment date string: ${assessmentDateString}`);
      return "Age calculation error";
    }
  }
  
  function parseDate(dateString) {
    try {
      // Handle dd/MM/yyyy or dd/MM/yy format
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const parts = dateString.split('/');
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript
        let year = parseInt(parts[2], 10);
        if (year < 100) {
          year += 2000; // Assuming years are 2000+
        }
        return new Date(year, month, day);
      }
      // Handle ISO format (yyyy-MM-dd)
      if (typeof dateString === 'string' && dateString.includes('-')) {
        return new Date(dateString);
      }
      // Handle date objects
      if (dateString instanceof Date) {
        return dateString;
      }
      // Handle timestamp or other formats
      const timestamp = new Date(dateString);
      if (!isNaN(timestamp)) {
        return timestamp;
      }
      throw new Error(`Invalid date format: ${dateString}`);
    } catch (error) {
      Logger.log(`Error parsing date: ${dateString}, Error: ${error}`);
      throw error;
    }
  }
  
  // Add this helper function
  function getFirstName(fullName) {
    return fullName.split(' ')[0];
  }
  
  function generateR3ReportsInBatch() {
    try {
      Logger.log('Starting batch R3 report generation...');
      
      // 1. Get all pending rows from R3_Form
      const r3Sheet = SpreadsheetApp.openById(CONFIG_R3.sheetId).getSheetByName(CONFIG_R3.sheets.R3);
      const r3Data = r3Sheet.getDataRange().getValues();
      const r3Headers = r3Data[0];
      
      // Get column indices
      const chataIdIndex = r3Headers.indexOf('chata_id');
      const urlIndex = r3Headers.indexOf('Generated (Docx for LLM)');
      
      // 2. Filter rows that need processing (no URL yet)
      const pendingRows = r3Data.slice(1).filter(row => {
        return row[chataIdIndex] && !row[urlIndex]; // Has CHATA_ID but no URL
      });
      
      Logger.log(`Found ${pendingRows.length} reports to generate`);
      
      // 3. Process each pending row
      const results = pendingRows.map(row => {
        const chataId = row[chataIdIndex];
        try {
          Logger.log(`Processing CHATA_ID: ${chataId}`);
          const result = generateR3ReportForId(chataId);
          return {
            chataId: chataId,
            success: result.success,
            url: result.documentUrl,
            error: null
          };
        } catch (error) {
          Logger.log(`Error processing ${chataId}: ${error}`);
          return {
            chataId: chataId,
            success: false,
            url: null,
            error: error.toString()
          };
        }
      });
      
      // 4. Summarize results
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      Logger.log(`Batch processing completed:`);
      Logger.log(`- Successfully generated: ${successful}`);
      Logger.log(`- Failed: ${failed}`);
      
      return {
        success: true,
        total: results.length,
        successful: successful,
        failed: failed,
        details: results
      };
      
    } catch (error) {
      Logger.log(`Error in batch processing: ${error}`);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  function doGet(e) {
    try {
      // Get callback name from request parameters
      const callback = e.parameter.callback;
      
      // Get CHATA_ID from either query parameter or script properties
      const chataId = e.parameter.chataId || 
                     PropertiesService.getScriptProperties().getProperty('TEST_CHATA_ID') || 
                     CONFIG_R3.defaultChataId;
      
      if (!chataId) {
        return createJSONPResponse(callback, {
          success: false,
          error: 'No CHATA_ID provided',
          stage: 'report',
          data: {
            timestamp: new Date().toISOString()
          }
        });
      }
      
      Logger.log(`Generating R3 report for CHATA_ID: ${chataId}`);
      
      // Handle test requests
      if (e.parameter.test === 'true') {
        return createJSONPResponse(callback, {
          success: true,
          message: 'Report generator endpoint is working',
          stage: 'report',
          data: {
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Generate report synchronously
      const result = generateR3ReportForId(chataId);
      
      if (!result.success) {
        Logger.log(`Report generation error: ${result.error}`);
        return createJSONPResponse(callback, {
          success: false,
          error: result.error,
          stage: 'report',
          data: {
            chataId: chataId,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      return createJSONPResponse(callback, {
        success: true,
        message: 'Report generation complete',
        stage: 'report',
        data: {
          chataId: chataId,
          documentUrl: result.documentUrl,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      Logger.log(`Error in doGet: ${error.message}`);
      return createJSONPResponse(callback, {
        success: false,
        error: error.message,
        stage: 'report',
        data: {
          timestamp: new Date().toISOString()
        }
      });
    }
  }
  
  // Add helper function for JSONP responses
  function createJSONPResponse(callback, data) {
    const jsonData = JSON.stringify(data);
    const output = callback ? `${callback}(${jsonData})` : jsonData;
    
    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }