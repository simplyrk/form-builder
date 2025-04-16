/**
 * Configurable text constants used throughout the application.
 * Values are read from environment variables with defaults provided.
 */

export const TEXT = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Form Builder',
  MANAGE_FORMS: process.env.NEXT_PUBLIC_TEXT_MANAGE_FORMS || 'Manage Forms',
  CREATE_NEW_FORM: process.env.NEXT_PUBLIC_TEXT_CREATE_NEW_FORM || 'Create New Form',
  AVAILABLE_FORMS: process.env.NEXT_PUBLIC_TEXT_AVAILABLE_FORMS || 'Available Forms',
  WELCOME_MESSAGE: process.env.NEXT_PUBLIC_TEXT_WELCOME_MESSAGE || `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || 'Form Builder'}`,
  WELCOME_DESCRIPTION: process.env.NEXT_PUBLIC_TEXT_WELCOME_DESCRIPTION || 'Click on a form in the navbar to get started',
  FORMS_AVAILABLE_MESSAGE: (count: number) => 
    process.env.NEXT_PUBLIC_TEXT_FORMS_AVAILABLE_MESSAGE?.replace('{count}', count.toString()) || 
    `There are ${count} form${count === 1 ? '' : 's'} available.`,
}; 