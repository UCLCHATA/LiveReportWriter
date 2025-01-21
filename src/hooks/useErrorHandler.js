import { useCallback } from 'react';
export const useErrorHandler = () => {
    const handleError = useCallback(({ error, context, action }) => {
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
