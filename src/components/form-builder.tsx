'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { createForm, updateForm } from '@/app/actions/forms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Form, FormInput, FieldInput, FormField } from '@/types/form';


/**
 * Props for the FormBuilder component
 * 
 * @property {Form} [form] - Optional existing form to edit. If not provided, a new form will be created.
 * @property {() => void} [onSuccess] - Optional callback to execute after successful form creation/update.
 * @property {(formData: FormInput) => Promise<void>} [onSave] - Optional callback to execute after saving the form.
 */
interface FormBuilderProps {
  form?: Form;
  onSuccess?: () => void;
  onSave?: (formData: FormInput) => Promise<void>;
}

/**
 * FormBuilder Component
 * 
 * A comprehensive form builder that allows users to create and edit forms.
 * Supports draggable field reordering, field editing, and form submission.
 * 
 * @param {FormBuilderProps} props - Component props
 * @returns {JSX.Element} - Rendered form builder component
 */
export function FormBuilder({ form, onSuccess, onSave }: FormBuilderProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(form?.title || '');
  const [description, setDescription] = useState(form?.description || '');
  const [formGroup, setFormGroup] = useState(form?.formGroup || '');
  const [fields, setFields] = useState<FieldInput[]>(
    form?.fields.map(f => ({
      label: f.label,
      type: f.type,
      required: f.required,
      options: f.options,
      order: f.order,
    })) || []
  );

  /**
   * Adds a new field to the form
   * Initializes with default values and increments the order
   */
  const handleAddField = () => {
    setFields([
      ...fields,
      {
        label: 'New Field',
        type: 'text',
        required: false,
        options: [],
        order: fields.length,
      },
    ]);
  };

  /**
   * Removes a field from the form at the specified index
   * 
   * @param {number} index - The index of the field to remove
   */
  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  /**
   * Updates a field's properties at the specified index
   * 
   * @param {number} index - The index of the field to update
   * @param {Partial<FieldInput>} field - Partial field properties to update
   */
  const handleFieldChange = (index: number, field: Partial<FieldInput>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    setFields(newFields);
  };

  /**
   * Handles the drag and drop reordering of fields
   * Updates the order property of each field after reordering
   * 
   * @param {DropResult} result - The result of the drag operation from react-beautiful-dnd
   */
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items.map((item, index) => ({ ...item, order: index })));
  };

  /**
   * Handles form submission
   * Creates a new form or updates an existing one
   * 
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create base form data with all fields
      const formData: FormInput = {
        title,
        description: description || '',
        formGroup: formGroup || '',
        fields,
        published: form?.published ?? false,
      };

      if (onSave) {
        // Use the provided onSave callback
        await onSave(formData);
        toast.success('Form saved successfully');
      } else if (form) {
        // Update existing form - cast to the required types
        await updateForm(form.id, {
          title: formData.title,
          description: formData.description || '',
          formGroup: formData.formGroup || '',
          published: formData.published ?? false,
          fields: formData.fields as Omit<FormField, 'id' | 'formId' | 'createdAt' | 'updatedAt'>[],
        });
        toast.success('Form updated successfully');
      } else {
        // Create new form - cast to the required types
        await createForm({
          title: formData.title,
          description: formData.description || '',
          formGroup: formData.formGroup || '',
          fields: formData.fields as Omit<FormField, 'id' | 'formId' | 'createdAt' | 'updatedAt'>[],
        });
        toast.success('Form created successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      } else if (!onSave) {
        router.back();
        setTimeout(() => {
          router.refresh();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Form Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="formGroup" className="block text-sm font-medium mb-1">
            Form Group
          </label>
          <Input
            id="formGroup"
            value={formGroup}
            onChange={(e) => setFormGroup(e.target.value)}
            placeholder="Optional - Group forms with the same value"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Form Fields</h3>
          <Button 
            type="button" 
            onClick={handleAddField} 
            variant="outline"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {fields.map((field, index) => (
                  <Draggable
                    key={index}
                    draggableId={`field-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative"
                      >
                        <CardHeader className="flex flex-row items-center space-x-4">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move"
                          >
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <CardTitle className="flex-1">
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                handleFieldChange(index, { label: e.target.value })
                              }
                              placeholder="Field Label"
                              disabled={isSubmitting}
                            />
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveField(index)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">
                                Field Label
                              </label>
                              <Input
                                value={field.label}
                                onChange={(e) =>
                                  handleFieldChange(index, { label: e.target.value })
                                }
                                placeholder="Enter field label"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">
                                Field Type
                              </label>
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={field.type}
                                onChange={(e) =>
                                  handleFieldChange(index, { type: e.target.value })
                                }
                                disabled={isSubmitting}
                              >
                                <option value="text">Text</option>
                                <option value="textarea">Textarea</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="file">File</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <input
                              type="checkbox"
                              id={`required-${index}`}
                              checked={field.required}
                              onChange={(e) =>
                                handleFieldChange(index, {
                                  required: e.target.checked,
                                })
                              }
                              disabled={isSubmitting}
                            />
                            <label
                              htmlFor={`required-${index}`}
                              className="text-sm font-medium"
                            >
                              Required
                            </label>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            router.back();
            setTimeout(() => {
              router.refresh();
            }, 100);
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (form ? 'Update Form' : 'Create Form')}
        </Button>
      </div>
    </form>
  );
} 