import { useCallback } from 'react';

interface ErrorOptions {
  error: Error;
  context?: string;
  action?: string;
}

export const useErrorHandler = () => {
  const handleError = useCallback(({ error, context, action }: ErrorOptions) => {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    // Here you can add your error reporting service
    // reportError(error);
    
    // Return user-friendly error message
    return {
      message: error.message || 'An unexpected error occurred',
      context,
      action: action || 'Please try again later'
    };
  }, []);

  return { handleError };
}; 