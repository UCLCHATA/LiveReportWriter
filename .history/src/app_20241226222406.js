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

// Event Listeners
createReportBtn.addEventListener('click', showClinicianModal);
startReportBtn.addEventListener('click', handleStartReport);
cancelBtn.addEventListener('click', hideClinicianModal);
submitBtn.addEventListener('click', handleSubmit);
clearBtn.addEventListener('click', handleClear);

// Add double-click handlers to text areas
textAreas.forEach(textArea => {
    const container = textArea.closest('.text-box-container');
    const defaultText = container.dataset.defaultText;
    
    // Set default text
    textArea.value = defaultText;
    textArea.classList.add('default-text');
    
    // Handle focus
    textArea.addEventListener('focus', function() {
        if (this.classList.contains('default-text')) {
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
    
    // Handle double-click for expansion
    container.addEventListener('dblclick', function(e) {
        if (!isFormEnabled) return;
        
        const textArea = this.querySelector('.text-area');
        if (textArea.style.height === '300px') {
            textArea.style.height = '120px';
        } else {
            textArea.style.height = '300px';
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

function handleStartReport() {
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
    form.classList.remove('disabled');
    hideClinicianModal();
    createReportBtn.style.display = 'none';
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
        observations: document.querySelector('.clinical .text-area').value,
        strengths: document.querySelector('.strengths .text-area').value,
        priorities: document.querySelector('.priority .text-area').value,
        recommendations: document.querySelector('.support .text-area').value
    };
    
    // TODO: Send form data to server
    console.log('Form submitted:', formData);
    alert('Assessment submitted successfully');
    handleClear();
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
        textArea.value = container.dataset.defaultText;
        textArea.classList.add('default-text');
        textArea.style.height = '120px';
    });
    
    // Reset form state
    isFormEnabled = false;
    form.classList.add('disabled');
    createReportBtn.style.display = 'flex';
} 