import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import type { CreateRetrospectiveFeedbackRequest } from '../../types';

interface FeedbackFormProps {
  retrospectiveId: string;
  categories: Array<{
    name: string;
    description: string;
    color: string;
  }>;
  onSubmit: (data: CreateRetrospectiveFeedbackRequest) => void;
  onCancel: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  retrospectiveId,
  categories,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'went_well' | 'needs_improvement' | 'action_items' | ''>('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    if (!content.trim()) {
      newErrors.content = 'Please enter your feedback';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && user) {
      onSubmit({
        retrospectiveId,
        userId: user.id,
        category: selectedCategory as 'went_well' | 'needs_improvement' | 'action_items',
        content: content.trim()
      });
      
      // Reset form
      setSelectedCategory('');
      setContent('');
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => {
                const categoryValue = category.name === 'What Went Well' ? 'went_well' : 
                                    category.name === 'What Didn\'t Go Well' ? 'needs_improvement' : 'action_items';
                setSelectedCategory(categoryValue);
                if (errors.category) {
                  setErrors(prev => ({ ...prev, category: '' }));
                }
              }}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                (selectedCategory === 'went_well' && category.name === 'What Went Well') ||
                (selectedCategory === 'needs_improvement' && category.name === 'What Didn\'t Go Well') ||
                (selectedCategory === 'action_items' && category.name === 'Action Items')
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <p className="text-sm text-gray-600">{category.description}</p>
            </button>
          ))}
        </div>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Your Feedback *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) {
              setErrors(prev => ({ ...prev, content: '' }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.content ? 'border-red-300' : 'border-gray-300'
          }`}
          rows={4}
          placeholder="Share your thoughts about this sprint..."
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          Add Feedback
        </Button>
      </div>
    </form>
  );
};
