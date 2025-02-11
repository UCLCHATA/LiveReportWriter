// SheetDB API configuration
const FORM_RESPONSES_API = 'https://sheetdb.io/api/v1/f1bv7060ylgeu';
const PDF_URLS_API = 'https://sheetdb.io/api/v1/sbgioz4f62f6i';
const STORAGE_KEY = 'formR3_fieldContents';

// Global state
let chataData = [];
let pdfUrls = [];

// Field configuration
const fieldConfig = {
    'clinical-observations': {
        title: 'Key Clinical Observations',
        defaultText: `• Social engagement patterns
• Communication style
• Response to activities
• Behavioral patterns
• Notable strengths/challenges`,
        charLimit: 2000
    },
    'strengths-abilities': {
        title: 'Strengths & Abilities',
        defaultText: `• Memory (e.g., Strong recall of sequences)
• Visual (e.g., Pattern recognition)
• Physical (e.g., Fine motor skills)
• Creative (e.g., Problem-solving abilities)
• Focus (e.g., Sustained attention)
• Problem-solving (e.g., Logical approach)`,
        charLimit: 2000
    },
    'priority-support': {
        title: 'Priority Support Areas',
        defaultText: `• Assessment data patterns
• Family priorities
• School observations
• Clinical judgment`,
        charLimit: 2000
    },
    'support-recommendations': {
        title: 'Support Recommendations',
        defaultText: `• Strength-based strategies
• Practical implementation
• Home/school alignment
• Family resources`,
        charLimit: 2000
    }
};

// Initialize window.fieldContents
window.fieldContents = window.fieldContents || {
    referrals: {
        checked: [],
        remarks: ''
    }
};

async function loadChataData() {
    try {
        console.log('Starting to load CHATA data...');
        const response = await fetch(`${PDF_URLS_API}?sheet=All_Reports_URL`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('API response not OK:', response.status, response.statusText);
            throw new Error('Failed to fetch CHATA data');
        }

        const data = await response.json();
        console.log('Raw CHATA data from All_Reports_URL:', data);
        
        // Log the first row to see column structure
        if (data.length > 0) {
            console.log('First row structure:', Object.keys(data[0]));
            console.log('First row values:', data[0]);
        } else {
            console.warn('No data received from API');
        }
        
        // Map using CHATA_ID (or Unique_ID) and Name from All_Reports_URL sheet
        chataData = data
            .filter(row => {
                // Check both possible column names
                const id = row.CHATA_ID || row.Unique_ID;
                const name = row.Name || row.Child_Name;  // Also check for alternate name column
                console.log('Processing row:', { id, name, row });
                return id && id !== "CHATA_ID" && id !== "Unique_ID" && name;
            })
            .map(row => ({
                id: row.CHATA_ID || row.Unique_ID,
                name: row.Name || row.Child_Name
            }));

        console.log('Processed CHATA data:', chataData);
        
        const dropdown = document.getElementById('chata-id-select');
        console.log('Found dropdown element:', dropdown);
        
        if (dropdown && chataData.length > 0) {
            const options = chataData.map(item => `<option value="${item.id}">${item.id}</option>`).join('');
            console.log('Generated options:', options);
            
            dropdown.innerHTML = '<option value="">Select CHATA ID</option>' + options;
            console.log('Updated dropdown HTML:', dropdown.innerHTML);
            
            // Verify event listener
            const hasChangeListener = dropdown.getAttribute('listener') === 'true';
            if (!hasChangeListener) {
                dropdown.addEventListener('change', handleChataIdChange);
                dropdown.setAttribute('listener', 'true');
                console.log('Added change event listener to dropdown');
            }
        } else {
            console.error('Dropdown setup issues:', {
                dropdownExists: !!dropdown,
                dataLength: chataData.length
            });
        }
    } catch (error) {
        console.error('Error loading CHATA data:', error);
    }
}

async function fetchPdfUrls() {
    try {
        const response = await fetch(`${PDF_URLS_API}?sheet=All_Reports_URL`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch PDF URLs');
        }

        const data = await response.json();
        console.log('Raw PDF URL data from sheet:', data);
        console.log('Example R1 PDF cell content:', data[0]?.['R1_Generated (PDF)']);

        pdfUrls = data
            .filter(row => row.CHATA_ID && row.CHATA_ID !== "CHATA_ID")  // Changed from Unique_ID
            .map(row => {
                const r1Formula = row['R1_Generated (PDF)'];
                const r2Formula = row['R2_Generated (PDF)'];
                
                const extractUrl = (formula) => {
                    if (formula === 'Missing') return null;
                    return formula && formula !== 'Missing' ? formula : null;
                };

                return {
                    chataId: row.CHATA_ID,  // Changed from Unique_ID
                    r1Url: extractUrl(r1Formula),
                    r2Url: extractUrl(r2Formula)
                };
            });

        console.log('Processed PDF URLs:', pdfUrls);
        console.log('First entry URLs:', {
            id: pdfUrls[0]?.chataId,
            r1: pdfUrls[0]?.r1Url,
            r2: pdfUrls[0]?.r2Url
        });

    } catch (error) {
        console.error('Error fetching PDF URLs:', error);
    }
}

function handleChataIdChange(event) {
    const selectedId = event.target.value;
    const nameDisplay = document.getElementById('chata-name-display');
    const selectedData = chataData.find(item => item.id === selectedId);
    
    if (nameDisplay && selectedData) {
        nameDisplay.textContent = selectedData.name;
        
        // Update PDF iframes
        const pdfData = pdfUrls.find(item => item.chataId === selectedId);
        console.log('Selected PDF data:', pdfData);

        if (pdfData) {
            const frame1 = document.getElementById('pdf-frame-1');
            const frame2 = document.getElementById('pdf-frame-2');
            const placeholder1 = document.getElementById('pdf-placeholder-1');
            const placeholder2 = document.getElementById('pdf-placeholder-2');
        
            if (pdfData.r1Url && pdfData.r1Url !== "Missing") {
                frame1.src = pdfData.r1Url;
                frame1.style.display = 'block';
                if (placeholder1) placeholder1.style.display = 'none';
            }
            if (pdfData.r2Url && pdfData.r2Url !== "Missing") {
                frame2.src = pdfData.r2Url;
                frame2.style.display = 'block';
                if (placeholder2) placeholder2.style.display = 'none';
            }
        }
    } else if (nameDisplay) {
        nameDisplay.textContent = '';
        // Reset PDFs to placeholder state
        const frames = [
            document.getElementById('pdf-frame-1'),
            document.getElementById('pdf-frame-2')
        ];
        const placeholders = [
            document.getElementById('pdf-placeholder-1'),
            document.getElementById('pdf-placeholder-2')
        ];
        
        frames.forEach(frame => {
            if (frame) {
                frame.src = 'about:blank';
                frame.style.display = 'none';
            }
        });
        
        placeholders.forEach(placeholder => {
            if (placeholder) placeholder.style.display = 'flex';
        });
    }
}

// Load saved data from localStorage
function loadSavedData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            window.fieldContents = JSON.parse(saved);
            
            // Load expandable field contents
            Object.keys(window.fieldContents).forEach(fieldId => {
                if (fieldId !== 'referrals') {  // Skip referrals object
                    const preview = document.querySelector(`[data-field-id="${fieldId}"] .field-preview`);
                    if (preview) {
                        const content = window.fieldContents[fieldId];
                        preview.textContent = content || fieldConfig[fieldId].defaultText;
                    }
                }
            });

            // Load referral checkboxes
            if (window.fieldContents.referrals) {
                const checkboxes = document.querySelectorAll('.referrals-grid input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = window.fieldContents.referrals.checked.includes(checkbox.value);
                });
                
                // Load remarks
                const remarksInput = document.querySelector('input[name="other_referrals"]');
                if (remarksInput && window.fieldContents.referrals.remarks) {
                    remarksInput.value = window.fieldContents.referrals.remarks;
                }
            }

        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

// Save data to localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.fieldContents));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Initialize event listeners and load data
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded - Starting initialization...');
    
    try {
        // Load both CHATA data and PDF URLs in parallel
        console.log('Loading data...');
        await Promise.all([
            loadChataData(),
            fetchPdfUrls()
        ]);
        console.log('Data loading complete');

        const chataIdSelect = document.getElementById('chata-id-select');
        console.log('Found CHATA ID select element:', chataIdSelect);
        
        if (chataIdSelect) {
            // Check if listener already exists
            const hasChangeListener = chataIdSelect.getAttribute('listener') === 'true';
            if (!hasChangeListener) {
                chataIdSelect.addEventListener('change', handleChataIdChange);
                chataIdSelect.setAttribute('listener', 'true');
                console.log('Added change event listener to CHATA ID select');
            }
        }

        // Initialize modal elements
        initializeModal();
        console.log('Modal initialized');
        
        // Load saved data
        loadSavedData();
        console.log('Saved data loaded');

        // Add submit button listener
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.addEventListener('click', handleSubmit);
            console.log('Submit button listener added');
        }

        // Initialize expandable fields
        initializeExpandableFields();
        console.log('Expandable fields initialized');

        // Add event listeners for referrals section
        initializeReferrals();
        console.log('Referrals initialized');
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Initialize modal functionality
function initializeModal() {
    const modal = document.querySelector('.modal-container');
    const backdrop = document.querySelector('.modal-backdrop');
    const modalContent = modal.querySelector('.modal-content');

    backdrop.addEventListener('click', () => {
        modal.classList.remove('active');
        backdrop.classList.remove('active');
    });

    let isResizing = false;
    modal.addEventListener('mousedown', (e) => {
        if (e.offsetX > modal.offsetWidth - 10 && e.offsetY > modal.offsetHeight - 10) {
            isResizing = true;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            modal.style.width = e.clientX - modal.offsetLeft + 'px';
            modal.style.height = e.clientY - modal.offsetTop + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });
}

// Initialize expandable fields
function initializeExpandableFields() {
    document.querySelectorAll('.expandable-field').forEach(field => {
        const preview = field.querySelector('.field-preview');
        const fieldId = field.dataset.fieldId;
        
        preview.addEventListener('click', () => {
            openFieldEditor(fieldId, preview.textContent);
        });
    });
}

// Open field editor
function openFieldEditor(fieldId, currentContent) {
    console.log('Opening editor for:', fieldId);
    const modal = document.querySelector('.modal-container');
    const backdrop = document.querySelector('.modal-backdrop');
    const modalHeader = modal.querySelector('.modal-header h4');
    
    // Clone and replace the textarea to remove all previous event listeners
    const oldTextarea = modal.querySelector('.expandable-text');
    const textarea = oldTextarea.cloneNode(false);  // false means don't clone event listeners
    oldTextarea.parentNode.replaceChild(textarea, oldTextarea);

    modalHeader.textContent = fieldConfig[fieldId].title;
    
    // Set content specific to this field
    textarea.value = window.fieldContents[fieldId] || fieldConfig[fieldId].defaultText;
    textarea.maxLength = fieldConfig[fieldId].charLimit;
    modal.dataset.currentField = fieldId;

    // Add input handler specific to this field
    const inputHandler = debounce(() => {
        const value = textarea.value.trim();
        window.fieldContents[fieldId] = value;
        
        // Update only this field's preview
        const preview = document.querySelector(`[data-field-id="${fieldId}"] .field-preview`);
        if (preview) {
            preview.textContent = value || fieldConfig[fieldId].defaultText.split('\n')[0];
        }
        saveToLocalStorage();
    }, 500);

    textarea.addEventListener('input', inputHandler);

    // Add cleanup when modal is closed
    const closeHandler = () => {
        textarea.removeEventListener('input', inputHandler);
        backdrop.removeEventListener('click', closeHandler);
    };
    backdrop.addEventListener('click', closeHandler);

    modal.classList.add('active');
    backdrop.classList.add('active');
    textarea.focus();
}

// Add debounce function if not already present
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle form submission
async function handleSubmit() {
    try {
        const chataIdSelect = document.getElementById('chata-id-select');
        const selectedChataId = chataIdSelect?.value;
        const selectedData = chataData.find(item => item.id === selectedChataId);
        
        if (!selectedChataId || !selectedData) {
            alert('Please select a CHATA ID');
            return;
        }

        // Get ASC and ADHD status first
        const ascStatus = document.querySelector('select[name="asc_status"]')?.value;
        const adhdStatus = document.querySelector('select[name="adhd_status"]')?.value;

        if (!ascStatus || !adhdStatus) {
            alert('Please select both ASC and ADHD status');
            return;
        }

        // First get all existing entries
        const allEntriesResponse = await fetch(`${FORM_RESPONSES_API}?sheet=Form_Responses`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!allEntriesResponse.ok) {
            throw new Error('Failed to check existing entries');
        }

        const allEntries = await allEntriesResponse.json();
        console.log('All existing entries:', allEntries);

        // Check if this CHATA_ID already exists
        const existingEntry = allEntries.find(entry => entry.CHATA_ID === selectedChataId);
        console.log('Found existing entry:', existingEntry);

        // Get referrals data
        const professionalReferrals = window.fieldContents.referrals ? 
            `Selected referrals: ${window.fieldContents.referrals.checked.join(', ')}${window.fieldContents.referrals.remarks ? `\nRemarks: ${window.fieldContents.referrals.remarks}` : ''}` :
            'No referrals selected';

        // Prepare the data object with explicit column ordering
        const formData = {
            "A": selectedChataId, // CHATA_ID
            "B": selectedData.name, // Name
            "C": new Date().toISOString(), // Timestamp
            "D": ascStatus, // ASC_Status
            "E": adhdStatus, // ADHD_Status
            "F": window.fieldContents['clinical-observations'] || '', // Key_Clinical_Observations
            "G": window.fieldContents['strengths-abilities'] || '', // Strengths_and_Abilities
            "H": window.fieldContents['priority-support'] || '', // Priority_Support_Areas
            "I": window.fieldContents['support-recommendations'] || '', // Support_Recommendations
            "J": professionalReferrals // Professional_Referrals
        };

        if (existingEntry) {
            const userChoice = confirm(
                `An assessment for ${selectedChataId} already exists.\n\n` +
                'Click OK to update the existing assessment, or Cancel to abort submission.'
            );
            
            if (!userChoice) {
                return; // User chose to cancel
            }

            // Delete existing entry using CHATA_ID
            const deleteUrl = `${FORM_RESPONSES_API}/CHATA_ID/${selectedChataId}?sheet=Form_Responses`;
            console.log('Delete URL:', deleteUrl);

            const deleteResponse = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                console.error('Delete response:', errorText);
                throw new Error(`Failed to remove existing entries. Status: ${deleteResponse.status}, Details: ${errorText}`);
            }

            const deleteResult = await deleteResponse.json();
            console.log('Delete result:', deleteResult);

            // Wait a moment to ensure deletion is processed
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Now create the new entry with explicit column mapping
            const createResponse = await fetch(`${FORM_RESPONSES_API}?sheet=Form_Responses`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: [{
                        "CHATA_ID": formData.A,
                        "Name": formData.B,
                        "Timestamp": formData.C,
                        "ASC_Status": formData.D,
                        "ADHD_Status": formData.E,
                        "Key_Clinical_Observations": formData.F,
                        "Strengths_and_Abilities": formData.G,
                        "Priority_Support_Areas": formData.H,
                        "Support_Recommendations": formData.I,
                        "Professional_Referrals": formData.J
                    }]
                })
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                console.error('Create response:', errorText);
                throw new Error(`Failed to create new entry. Status: ${createResponse.status}, Details: ${errorText}`);
            }

            const createResult = await createResponse.json();
            console.log('Create result:', createResult);
        } else {
            // Create new entry with explicit column mapping
            const response = await fetch(`${FORM_RESPONSES_API}?sheet=Form_Responses`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: [{
                        "CHATA_ID": formData.A,
                        "Name": formData.B,
                        "Timestamp": formData.C,
                        "ASC_Status": formData.D,
                        "ADHD_Status": formData.E,
                        "Key_Clinical_Observations": formData.F,
                        "Strengths_and_Abilities": formData.G,
                        "Priority_Support_Areas": formData.H,
                        "Support_Recommendations": formData.I,
                        "Professional_Referrals": formData.J
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
            }

            const result = await response.json();
            console.log('Create result:', result);
        }

        alert(existingEntry ? 'Assessment updated successfully!' : 'Assessment submitted successfully!');

        if (confirm('Would you like to clear the form?')) {
            clearForm();
        }

    } catch (error) {
        console.error('Submission error:', error);
        alert(`Error submitting form: ${error.message}`);
    }
}

// Clear form
function clearForm() {
    if (confirm('Are you sure you want to clear all form data? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        window.fieldContents = {
            referrals: {
                checked: [],
                remarks: ''
            }
        };
        
        const chataIdSelect = document.getElementById('chata-id-select');
        if (chataIdSelect) {
            chataIdSelect.selectedIndex = 0;
            // Trigger change event to reset PDFs
            chataIdSelect.dispatchEvent(new Event('change'));
        }
        
        const nameDisplay = document.getElementById('chata-name-display');
        if (nameDisplay) {
            nameDisplay.textContent = '';
        }

        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        const otherReferralsInput = document.querySelector('input[name="other_referrals"]');
        if (otherReferralsInput) {
            otherReferralsInput.value = '';
        }
        
        document.querySelectorAll('.field-preview').forEach(preview => {
            const field = preview.closest('.expandable-field');
            const fieldId = field.dataset.fieldId;
            preview.textContent = fieldConfig[fieldId].defaultText;
        });
        
        alert('Form cleared successfully.');
    }
}

// Add event listeners for referrals section
function initializeReferrals() {
    // Add listeners to checkboxes
    const checkboxes = document.querySelectorAll('.referrals-grid input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveReferrals);
    });

    // Add listener to remarks input
    const remarksInput = document.querySelector('input[name="other_referrals"]');
    if (remarksInput) {
        remarksInput.addEventListener('input', debounce(saveReferrals, 500));
    }
}

// Function to save referrals state
function saveReferrals() {
    const checkboxes = document.querySelectorAll('.referrals-grid input[type="checkbox"]');
    const checkedValues = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const remarksInput = document.querySelector('input[name="other_referrals"]');
    const remarks = remarksInput ? remarksInput.value : '';

    window.fieldContents.referrals = {
        checked: checkedValues,
        remarks: remarks
    };

    saveToLocalStorage();
}

