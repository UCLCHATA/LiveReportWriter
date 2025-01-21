function populateR3Template(chataId, responseDocUrl) {
  Logger.log(`\n=== Starting R3 template population for CHATA_ID: ${chataId} ===`);
  Logger.log(`Response document URL: ${responseDocUrl}`);
  
  try {
    const timestamp = new Date().toISOString();
    Logger.log('Step 1: Calling populateTemplateWithSecondPass...');
    const documentUrl = populateTemplateWithSecondPass(timestamp, chataId, responseDocUrl);
    Logger.log(`Generated document URL: ${documentUrl}`);
    
    // Send email with the document
    Logger.log('Step 2: Sending email...');
    const emailStatus = chataId === 'NO_CHATA' ? 
      { sent: true, details: 'No email sent for NO_CHATA case' } : 
      sendReportEmail(chataId, documentUrl);
    Logger.log(`Email status: ${JSON.stringify(emailStatus)}`);

    const result = {
      success: true,
      documentUrl: documentUrl,
      timestamp: timestamp,
      step: 3,
      totalSteps: 3,
      emailStatus: {
        ...emailStatus,
        details: emailStatus.sent ? 
          (chataId === 'NO_CHATA' ? 
            'Document generated successfully without email for NO_CHATA case' :
            `Email sent to ${emailStatus.recipientEmail} with Google Doc link and Word attachment`) :
          `Email sending failed: ${emailStatus.error}`
      }
    };
    Logger.log(`Template population completed successfully: ${JSON.stringify(result)}`);
    return result;
    
  } catch (error) {
    Logger.log(`Template population failed: ${error.message}`);
    Logger.log(`Error stack: ${error.stack}`);
    return {
      success: false,
      error: error.message,
      step: 0,
      totalSteps: 3,
      details: {
        timestamp: new Date().toISOString(),
        stack: error.stack
      }
    };
  }
}

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
  // For NO_CHATA case, use the original template URL
  templateUrl = 'https://docs.google.com/spreadsheets/d/1Ap9HfUWhE-ed1zIMT2QGf02yhZt7wiawKeFkDz8dcnA/edit?pli=1&gid=691346000#gid=691346000';
  Logger.log('Using original template for NO_CHATA case');
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

function doGet(e) {
  const callback = e.parameter.callback || 'callback';
  const chataId = e.parameter.chataId;
  const responseDocUrl = e.parameter.responseDocUrl;
  
  if (!chataId) {
    return ContentService.createTextOutput(
      `${callback}({"success":false,"error":"No CHATA ID provided"})`
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  if (!responseDocUrl && chataId !== 'NO_CHATA') {
    return ContentService.createTextOutput(
      `${callback}({"success":false,"error":"No response document URL provided"})`
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  try {
    // Process the template population
    const result = populateR3Template(chataId, responseDocUrl);
    
    // Return JSONP response
    return ContentService.createTextOutput(
      `${callback}(${JSON.stringify({
        success: true,
        progress: {
          status: 'completed',
          details: {
            documentUrl: result.documentUrl,
            emailStatus: result.emailStatus
          },
          totalSteps: 3,
          currentStep: 3
        }
      })})`
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    
  } catch (error) {
    Logger.log('Error in doGet:', error);
    return ContentService.createTextOutput(
      `${callback}({"success":false,"error":"${error.message}"})`
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}