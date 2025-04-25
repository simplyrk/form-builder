import { redirect } from 'next/navigation';

// This is a redirect page for backward compatibility
export default async function EditResponsePage({ 
  params 
}: { 
  params: { id: string; responseId: string } 
}) {
  const { id: formId, responseId } = await Promise.resolve(params);
  
  // Redirect to the new consolidated edit response route
  redirect(`/forms/${formId}/responses/${responseId}/edit`);
} 