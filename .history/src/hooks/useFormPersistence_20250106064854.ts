import { useState, useEffect, useCallback } from 'react';
import { formPersistence } from '../services/formPersistence';

type FormField = {
  value: string;
  lastUpdated: number;
};

type FormSection = {
  clinical: FormField;
  strengths: FormField;
  priority: FormField;
  support: FormField;
  asc_status: FormField;
  adhd_status: FormField;
  referrals: string[];
};

type FormData = {
  chataId: string;
  clinicianInfo: {
    name: string;
    email: string;
    clinicName: string;
    childName?: string;
    childAge?: string;
    childGender?: string;
  };
  formContent: FormSection;
  lastUpdated: number;
  isSubmitted: boolean;
  isDraft: boolean;
};

export const useFormPersistence = (chataId: string | null) => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Load form data when chataId changes
  useEffect(() => {
    if (!chataId) {
      setFormData(null);
      setErrors([]);
      setIsDirty(false);
      return;
    }

    const data = formPersistence.getForm(chataId);
    setFormData(data);
    
    // Validate form on load
    const { errors } = formPersistence.validateForm(chataId);
    setErrors(errors);
    setIsDirty(false);
  }, [chataId]);

  // Subscribe to form changes
  useEffect(() => {
    if (!chataId) return;

    const unsubscribe = formPersistence.subscribe((data) => {
      if (data?.chataId === chataId) {
        setFormData(data);
        const { errors } = formPersistence.validateForm(chataId);
        setErrors(errors);
      }
    });

    return () => unsubscribe();
  }, [chataId]);

  // Update form field
  const updateField = useCallback((field: keyof FormSection, value: string) => {
    if (!chataId || !formData) return;

    formPersistence.updateFormField(chataId, field, value);
    setIsDirty(true);
  }, [chataId, formData]);

  // Save entire form
  const saveForm = useCallback((data: FormData, immediate = false) => {
    formPersistence.saveForm(data, immediate);
    setIsDirty(true);
  }, []);

  // Mark form as submitted
  const submitForm = useCallback(() => {
    if (!chataId) return;

    const { isValid, errors } = formPersistence.validateForm(chataId);
    if (!isValid) {
      setErrors(errors);
      return false;
    }

    formPersistence.markAsSubmitted(chataId);
    setIsDirty(false);
    return true;
  }, [chataId]);

  // Clear form
  const clearForm = useCallback(() => {
    if (!chataId) return;

    formPersistence.clearForm(chataId);
    setFormData(null);
    setErrors([]);
    setIsDirty(false);
  }, [chataId]);

  return {
    formData,
    errors,
    isDirty,
    updateField,
    saveForm,
    submitForm,
    clearForm
  };
}; 