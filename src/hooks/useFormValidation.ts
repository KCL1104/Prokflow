import { useState, useCallback } from 'react';

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormValidationOptions<T> {
  initialData?: Partial<T>;
  validate: (data: T) => ValidationErrors<T>;
}

export function useFormValidation<T extends Record<string, any>>({
  initialData = {} as Partial<T>,
  validate
}: UseFormValidationOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData as T);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors = validate(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validate]);

  const resetForm = useCallback(() => {
    setFormData(initialData as T);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateForm,
    resetForm,
    setFormData
  };
}