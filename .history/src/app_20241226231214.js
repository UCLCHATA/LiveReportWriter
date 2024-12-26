// DOM Elements
const createReportBtn = document.querySelector('.create-report-button');
const clinicianModal = document.getElementById('clinician-modal');
const modalBackdrop = document.querySelector('.modal-backdrop');
const startReportBtn = document.getElementById('start-report');
const cancelBtn = document.querySelector('.cancel-button');
const submitBtn = document.querySelector('.submit-button');
const clearBtn = document.querySelector('.clear-button');
const textAreas = document.querySelectorAll('.text-area');
const form = document.querySelector('.form-container');

// Initialize form state
let isFormEnabled = false;

// Initialize text areas with default text
textAreas.forEach(textArea => {
    const container = textArea.closest('.text-box-container');
    const defaultText = container.dataset.defaultText;
    textArea.value = defaultText;
    textArea.classList.add('default-text');
});

// Event Listeners
createReportBtn.addEventListener('click', showClinicianModal);
startReportBtn.addEventListener('click', handleStartReport);
cancelBtn.addEventListener('click', hideClinicianModal);
submitBtn.addEventListener('click', handleSubmit);
clearBtn.addEventListener('click', handleClear);

// Add focus/blur handlers to text areas
textAreas.forEach(textArea => {
    const container = textArea.closest('.text-box-container');
    const defaultText = container.dataset.defaultText;
    
    // Handle focus
    textArea.addEventListener('focus', function() {
        if (this.value === defaultText) {
            this.value = '';
            this.classList.remove('default-text');
        }
    });
    
    // Handle blur
    textArea.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.value = defaultText;
            this.classList.add('default-text');
        }
    });
});

// Functions
function showClinicianModal() {
    clinicianModal.classList.add('active');
    modalBackdrop.classList.add('active');
}

function hideClinicianModal() {
    clinicianModal.classList.remove('active');
    modalBackdrop.classList.remove('active');
}

function handleStartReport(e) {
    e.preventDefault();
    const name = document.getElementById('clinician-name').value;
    const email = document.getElementById('clinician-email').value;
    
    if (!name || !email) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Enable form and hide modal
    isFormEnabled = true;
    document.body.classList.add('form-active');
    form.classList.add('active');
    hideClinicianModal();
    
    // Generate and show CHATA ID
    const chataId = 'CHATA-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const chataIdElement = document.querySelector('.chata-id');
    chataIdElement.textContent = chataId;
    chataIdElement.style.display = 'block';
}

function handleSubmit() {
    if (!isFormEnabled) {
        alert('Please create a new report first');
        return;
    }
    
    // Validate form
    const ascStatus = document.querySelector('[name="asc_status"]').value;
    const adhdStatus = document.querySelector('[name="adhd_status"]').value;
    
    if (!ascStatus || !adhdStatus) {
        alert('Please select both ASC and ADHD status');
        return;
    }
    
    // Collect form data
    const formData = {
        clinician: {
            name: document.getElementById('clinician-name').value,
            email: document.getElementById('clinician-email').value
        },
        status: {
            asc: ascStatus,
            adhd: adhdStatus
        },
        referrals: Array.from(document.querySelectorAll('.referrals-grid input[type="checkbox"]:checked'))
            .map(cb => cb.value),
        otherReferrals: document.querySelector('.referral-other-input').value,
        observations: getTextAreaValue('.clinical .text-area'),
        strengths: getTextAreaValue('.strengths .text-area'),
        priorities: getTextAreaValue('.priority .text-area'),
        recommendations: getTextAreaValue('.support .text-area')
    };
    
    // TODO: Send form data to server
    console.log('Form submitted:', formData);
    alert('Assessment submitted successfully');
    handleClear();
}

function getTextAreaValue(selector) {
    const textArea = document.querySelector(selector);
    const defaultText = textArea.closest('.text-box-container').dataset.defaultText;
    return textArea.value === defaultText ? '' : textArea.value;
}

function handleClear() {
    // Reset status
    document.querySelector('[name="asc_status"]').value = '';
    document.querySelector('[name="adhd_status"]').value = '';
    
    // Reset referrals
    document.querySelectorAll('.referrals-grid input[type="checkbox"]')
        .forEach(cb => cb.checked = false);
    document.querySelector('.referral-other-input').value = '';
    
    // Reset text areas to default text
    textAreas.forEach(textArea => {
        const container = textArea.closest('.text-box-container');
        const defaultText = container.dataset.defaultText;
        textArea.value = defaultText;
        textArea.classList.add('default-text');
    });
    
    // Reset form state
    isFormEnabled = false;
    document.body.classList.remove('form-active');
    form.classList.remove('active');
    
    // Hide CHATA ID
    document.querySelector('.chata-id').style.display = 'none';
} 