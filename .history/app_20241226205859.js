// DOM Elements
const chataIdSelect = document.getElementById('chata-id-select');
const refreshButton = document.querySelector('.refresh-button');
const createReportButton = document.querySelector('.create-report-button');
const formContainer = document.querySelector('.form-container');
const submitButton = document.querySelector('.submit-button');
const clearButton = document.querySelector('.clear-button');
const textareas = document.querySelectorAll('.field-preview');
const referralCheckboxes = document.querySelectorAll('input[name="referral"]');
const referralOtherInput = document.querySelector('.referral-other-input');
const ascStatusSelect = document.getElementById('asc-status');
const adosModuleSelect = document.getElementById('ados-module');

// State
let currentChataId = '';
let isCreatingReport = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadChataIds();
    setupEventListeners();
});

function setupEventListeners() {
    // CHATA ID selection
    chataIdSelect.addEventListener('change', handleChataIdChange);
    refreshButton.addEventListener('click', loadChataIds);

    // Report creation
    createReportButton.addEventListener('click', handleCreateReport);

    // Form actions
    submitButton.addEventListener('click', handleSubmit);
    clearButton.addEventListener('click', handleClear);

    // Form fields
    textareas.forEach(textarea => {
        textarea.addEventListener('input', handleTextareaInput);
    });

    referralCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleReferralChange);
    });

    // Status changes
    ascStatusSelect.addEventListener('change', handleAscStatusChange);
    adosModuleSelect.addEventListener('change', handleAdosModuleChange);
}

// CHATA ID Management
async function loadChataIds() {
    try {
        refreshButton.classList.add('loading');
        // TODO: Replace with actual API call
        const mockIds = ['CHATA001', 'CHATA002', 'CHATA003'];
        populateChataIds(mockIds);
    } catch (error) {
        console.error('Error loading CHATA IDs:', error);
        showNotification('Error loading CHATA IDs', 'error');
    } finally {
        refreshButton.classList.remove('loading');
    }
}

function populateChataIds(ids) {
    chataIdSelect.innerHTML = '<option value="">Select CHATA ID</option>';
    ids.forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = id;
        chataIdSelect.appendChild(option);
    });
}

function handleChataIdChange(event) {
    currentChataId = event.target.value;
    if (currentChataId) {
        loadExistingData(currentChataId);
    } else {
        handleClear();
    }
}

// Report Creation
function handleCreateReport() {
    if (!currentChataId) {
        showNotification('Please select a CHATA ID first', 'warning');
        return;
    }

    isCreatingReport = true;
    createReportButton.style.display = 'none';
    formContainer.classList.remove('muted');
    showNotification('Started new report', 'success');
}

// Form Actions
async function handleSubmit() {
    if (!validateForm()) {
        return;
    }

    try {
        const formData = collectFormData();
        // TODO: Replace with actual API call
        await submitFormData(formData);
        showNotification('Assessment submitted successfully', 'success');
        handleClear();
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('Error submitting assessment', 'error');
    }
}

function handleClear() {
    // Reset form fields
    textareas.forEach(textarea => {
        textarea.value = '';
        updateTextareaHeight(textarea);
    });

    referralCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    referralOtherInput.value = '';
    ascStatusSelect.value = '';
    adosModuleSelect.value = '';

    // Reset state
    isCreatingReport = false;
    createReportButton.style.display = 'flex';
    formContainer.classList.add('muted');
}

// Form Validation and Data Collection
function validateForm() {
    if (!currentChataId) {
        showNotification('Please select a CHATA ID', 'warning');
        return false;
    }

    if (!ascStatusSelect.value) {
        showNotification('Please select ASC Status', 'warning');
        return false;
    }

    if (!adosModuleSelect.value) {
        showNotification('Please select ADOS Module', 'warning');
        return false;
    }

    return true;
}

function collectFormData() {
    const referrals = Array.from(referralCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    if (referrals.includes('other') && referralOtherInput.value) {
        referrals.push(referralOtherInput.value);
    }

    return {
        chataId: currentChataId,
        ascStatus: ascStatusSelect.value,
        adosModule: adosModuleSelect.value,
        referrals,
        clinicalObservations: textareas[0].value,
        strengthsAbilities: textareas[1].value,
        priorityAreas: textareas[2].value,
        supportRecommendations: textareas[3].value
    };
}

// API Calls
async function loadExistingData(chataId) {
    try {
        // TODO: Replace with actual API call
        const mockData = {
            ascStatus: 'ASC confirmed',
            adosModule: 'Module 3',
            referrals: ['speech', 'ot'],
            clinicalObservations: 'Sample observations',
            strengthsAbilities: 'Sample strengths',
            priorityAreas: 'Sample priority areas',
            supportRecommendations: 'Sample recommendations'
        };
        populateFormData(mockData);
    } catch (error) {
        console.error('Error loading existing data:', error);
        showNotification('Error loading existing data', 'error');
    }
}

async function submitFormData(formData) {
    // TODO: Replace with actual API call
    return new Promise(resolve => setTimeout(resolve, 1000));
}

// Form Population
function populateFormData(data) {
    ascStatusSelect.value = data.ascStatus;
    adosModuleSelect.value = data.adosModule;

    referralCheckboxes.forEach(checkbox => {
        checkbox.checked = data.referrals.includes(checkbox.value);
    });

    const textareaData = [
        data.clinicalObservations,
        data.strengthsAbilities,
        data.priorityAreas,
        data.supportRecommendations
    ];

    textareas.forEach((textarea, index) => {
        textarea.value = textareaData[index];
        updateTextareaHeight(textarea);
    });
}

// Event Handlers
function handleTextareaInput(event) {
    updateTextareaHeight(event.target);
}

function handleReferralChange(event) {
    const isOtherChecked = event.target.value === 'other';
    if (isOtherChecked) {
        referralOtherInput.focus();
    }
}

function handleAscStatusChange() {
    if (ascStatusSelect.value === 'ASC confirmed') {
        ascStatusSelect.classList.add('asc-confirmed');
    } else {
        ascStatusSelect.classList.remove('asc-confirmed');
    }
}

function handleAdosModuleChange() {
    // Additional logic for ADOS module changes if needed
}

// Utility Functions
function updateTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="material-icons">${getNotificationIcon(type)}</i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check_circle';
        case 'error': return 'error';
        case 'warning': return 'warning';
        default: return 'info';
    }
}

