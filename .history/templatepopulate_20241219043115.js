// Configuration
const CONFIG = {
  SPREADSHEET_ID: '1Ap9HfUWhE-ed1zIMT2QGf02yhZt7wiawKeFkDz8dcnA',
  DEFAULT_TEST_CHATA_ID: 'CHATA001',
  TEMPLATE_VERSION: '1.0'
};

// JSONP response handler
function doGet(e) {
  const callback = e.parameter.callback || 'callback';
  const chataId = e.parameter.chataId;
  
  if (!chataId) {
    return ContentService.createTextOutput(
      `${callback}({"success":false,"error":"No CHATA ID provided"})`
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  try {
    // Process the template population
    const result = populateR3Template(chataId);
    
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

// Core utility functions
function setup() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('SPREADSHEET_ID', CONFIG.SPREADSHEET_ID);
  
  const testChataId = scriptProperties.getProperty('TEST_CHATA_ID');
  if (!testChataId) {
    scriptProperties.setProperty('TEST_CHATA_ID', CONFIG.DEFAULT_TEST_CHATA_ID);
  }
  
  Logger.log('Setup complete. Script properties initialized.');
  return 'Setup complete';
}

// ... rest of existing code ...

// Update populateR3Template function to handle email and document URL
function populateR3Template(chataId) {
  Logger.log(`\n=== Populating template for CHATA_ID: ${chataId} ===`);
  
  try {
    const ss = getSpreadsheet();
    const templateUrl = getTemplateUrl(ss, chataId);
    const docId = extractDocIdFromUrl(templateUrl);
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();

    // Verify template integrity
    const verification = verifyTemplate(body);
    if (!verification.isValid) {
      throw new Error('Template verification failed: ' + 
        JSON.stringify(verification.missingPlaceholders));
    }

    // Get content and populate template
    const content = getDocumentContent(templateUrl);
    const matches = extractPlaceholderContentAndEvidence(content);
    
    let replacementCount = 0;
    matches.forEach(match => {
      replacementCount += replaceContentInBody(body, match.id, match.content);
    });

    Logger.log(`Replaced ${replacementCount} placeholders`);

    // Save and close the document
    doc.saveAndClose();

    // Send email with document link and Word attachment
    const emailStatus = sendReportEmail(doc, chataId);

    return {
      documentUrl: doc.getUrl(),
      emailStatus: emailStatus
    };

  } catch (error) {
    Logger.log('Error in populateR3Template:', error);
    throw error;
  }
}

// Add email sending function
function sendReportEmail(doc, chataId) {
  try {
    // Get recipient email from R3_Form
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('R3_Form');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol = headers.indexOf('email');
    const chataIdCol = headers.indexOf('chata_id');
    
    const row = data.find(row => row[chataIdCol] === chataId);
    if (!row) {
      throw new Error('No matching record found for CHATA ID: ' + chataId);
    }

    const recipientEmail = row[emailCol];
    if (!recipientEmail) {
      throw new Error('No email address found for CHATA ID: ' + chataId);
    }

    // Create Word document
    const docBlob = doc.getAs('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    docBlob.setName(doc.getName() + '.docx');

    // Get CHATA log URL
    const logsSheet = ss.getSheetByName('API_Logs');
    const logsUrl = logsSheet ? logsSheet.getUrl() : '';

    // Send email
    MailApp.sendEmail({
      to: recipientEmail,
      subject: 'Your CHATA Assessment Report',
      htmlBody: `
        <p>Your CHATA assessment report is ready.</p>
        <p>You can access the report in two formats:</p>
        <ul>
          <li><a href="${doc.getUrl()}">View Online (Google Doc)</a></li>
          <li>Microsoft Word format (attached)</li>
        </ul>
        <p>CHATA ID: ${chataId}</p>
        <p>Log Reference: <a href="${logsUrl}">View Processing Log</a></p>
        <br>
        <p>Best regards,<br>CHATA Assessment Team</p>
      `,
      attachments: [docBlob]
    });

    return {
      sent: true,
      recipientEmail: recipientEmail
    };

  } catch (error) {
    Logger.log('Error sending email:', error);
    return {
      sent: false,
      error: error.message
    };
  }
}

// ... rest of existing code ...