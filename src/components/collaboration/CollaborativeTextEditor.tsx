import React, { useRef, useEffect } from 'react';
import { useCollaborativeTextEditor } from '../../hooks/useCollaborativeEditing';
// PresenceAwareField component has been removed

interface CollaborativeTextInputProps {
  workItemId: string | null;
  projectId: string | null;
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password';
  id?: string;
  'aria-labelledby'?: string;
}

export function CollaborativeTextInput({
  workItemId,
  projectId,
  fieldName,
  value: externalValue,
  onChange: externalOnChange,
  onSave,
  placeholder,
  className = '',
  disabled = false,
  type = 'text',
  id,
  'aria-labelledby': ariaLabelledBy
}: CollaborativeTextInputProps) {
  const {
    value,
    setValue,
    isEditing,
    hasUnsavedChanges,

    isFieldBeingEdited,
    forceSave,
    editorProps
  } = useCollaborativeTextEditor(workItemId, projectId, fieldName, externalValue);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external changes
  useEffect(() => {
    if (!isEditing && externalValue !== value) {
      setValue(externalValue);
    }
  }, [externalValue, isEditing, setValue, value]);

  // Handle external onChange
  useEffect(() => {
    if (value !== externalValue) {
      externalOnChange(value);
    }
  }, [value, externalValue, externalOnChange]);

  // Handle save
  useEffect(() => {
    if (hasUnsavedChanges && onSave) {
      const saveTimer = setTimeout(() => {
        onSave(value);
        forceSave();
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges, onSave, value, forceSave]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (onSave) {
        onSave(value);
        forceSave();
      }
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        {...editorProps}
        id={id}
        aria-labelledby={ariaLabelledBy}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        data-testid="collaborative-text-input"
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${isFieldBeingEdited ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}
          ${hasUnsavedChanges ? 'border-yellow-400' : ''}
          ${className}
        `}
      />
      
      {/* Save indicator */}
      {hasUnsavedChanges && (
        <div className="absolute -top-5 right-0 text-xs text-yellow-600">
          Saving...
        </div>
      )}
    </div>
  );
}

interface CollaborativeTextAreaProps {
  workItemId: string | null;
  projectId: string | null;
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  id?: string;
  'aria-labelledby'?: string;
}

export function CollaborativeTextArea({
  workItemId,
  projectId,
  fieldName,
  value: externalValue,
  onChange: externalOnChange,
  onSave,
  placeholder,
  rows = 4,
  className = '',
  disabled = false,
  id,
  'aria-labelledby': ariaLabelledBy
}: CollaborativeTextAreaProps) {
  const {
    value,
    setValue,
    isEditing,
    hasUnsavedChanges,
    isFieldBeingEdited,
    forceSave,
    editorProps
  } = useCollaborativeTextEditor(workItemId, projectId, fieldName, externalValue);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external changes
  useEffect(() => {
    if (!isEditing && externalValue !== value) {
      setValue(externalValue);
    }
  }, [externalValue, isEditing, setValue, value]);

  // Handle external onChange
  useEffect(() => {
    if (value !== externalValue) {
      externalOnChange(value);
    }
  }, [value, externalValue, externalOnChange]);

  // Handle save
  useEffect(() => {
    if (hasUnsavedChanges && onSave) {
      const saveTimer = setTimeout(() => {
        onSave(value);
        forceSave();
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges, onSave, value, forceSave]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      textareaRef.current?.blur();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (onSave) {
        onSave(value);
        forceSave();
      }
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        {...editorProps}
        id={id}
        aria-labelledby={ariaLabelledBy}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        data-testid="collaborative-text-area"
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          resize-vertical
          ${isFieldBeingEdited ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}
          ${hasUnsavedChanges ? 'border-yellow-400' : ''}
          ${className}
        `}
      />
      
      {/* Save indicator */}
      {hasUnsavedChanges && (
        <div className="absolute -top-5 right-0 text-xs text-yellow-600">
          Saving...
        </div>
      )}
    </div>
  );
}

interface CollaborativeRichTextEditorProps {
  workItemId: string | null;
  projectId: string | null;
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CollaborativeRichTextEditor({
  workItemId,
  projectId,
  fieldName,
  value: externalValue,
  onChange: externalOnChange,
  onSave,
  placeholder,
  className = '',
  disabled = false
}: CollaborativeRichTextEditorProps) {
  const {
    value,
    setValue,
    isEditing,
    hasUnsavedChanges,
    isFieldBeingEdited,
    handleFocus: _handleFocus,
    handleBlur: _handleBlur,
    forceSave
  } = useCollaborativeTextEditor(workItemId, projectId, fieldName, externalValue);

  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external changes
  useEffect(() => {
    if (!isEditing && externalValue !== value) {
      setValue(externalValue);
      if (editorRef.current) {
        editorRef.current.innerHTML = externalValue;
      }
    }
  }, [externalValue, isEditing, setValue, value]);

  // Handle external onChange
  useEffect(() => {
    if (value !== externalValue) {
      externalOnChange(value);
    }
  }, [value, externalValue, externalOnChange]);

  // Handle save
  useEffect(() => {
    if (hasUnsavedChanges && onSave) {
      const saveTimer = setTimeout(() => {
        onSave(value);
        forceSave();
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges, onSave, value, forceSave]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.innerHTML;
    setValue(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      editorRef.current?.blur();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (onSave) {
        onSave(value);
        forceSave();
      }
    }
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => {}} // Placeholder for focus handling
        onBlur={() => {}} // Placeholder for blur handling
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={`
          w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
          disabled:bg-gray-50 disabled:text-gray-500
          ${isFieldBeingEdited ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}
          ${hasUnsavedChanges ? 'border-yellow-400' : ''}
          ${className}
        `}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
      
      {/* Save indicator */}
      {hasUnsavedChanges && (
        <div className="absolute -top-5 right-0 text-xs text-yellow-600">
          Saving...
        </div>
      )}
      
      {/* Placeholder styling */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}