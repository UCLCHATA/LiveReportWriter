import React, { useState, useEffect } from 'react';
import { FaBook, FaGamepad, FaMusic, FaPalette, FaRunning } from 'react-icons/fa';
import '../styles/components/BehaviorInterestsProfile.css';

interface Behavior {
  id: string;
  label: string;
  checked: boolean;
  intensity?: number;
  notes?: string;
}

interface BehaviorCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  behaviors: Behavior[];
  description?: string;
}

interface BehaviorInterestsProfileProps {
  onSave: (data: { categories: BehaviorCategory[] }) => void;
  initialData?: { categories: BehaviorCategory[] };
}

const defaultCategories: BehaviorCategory[] = [
  {
    id: 'academic',
    title: 'Academic Interests',
    icon: <FaBook />,
    description: 'Activities related to learning and education',
    behaviors: [
      { id: 'reading', label: 'Reading', checked: false },
      { id: 'writing', label: 'Writing', checked: false },
      { id: 'math', label: 'Mathematics', checked: false },
      { id: 'science', label: 'Science', checked: false },
    ],
  },
  {
    id: 'creative',
    title: 'Creative Activities',
    icon: <FaPalette />,
    description: 'Artistic and creative expressions',
    behaviors: [
      { id: 'drawing', label: 'Drawing/Painting', checked: false },
      { id: 'crafts', label: 'Arts & Crafts', checked: false },
      { id: 'building', label: 'Building/Construction', checked: false },
    ],
  },
  {
    id: 'physical',
    title: 'Physical Activities',
    icon: <FaRunning />,
    description: 'Sports and movement-based activities',
    behaviors: [
      { id: 'sports', label: 'Team Sports', checked: false },
      { id: 'individual', label: 'Individual Sports', checked: false },
      { id: 'outdoor', label: 'Outdoor Activities', checked: false },
    ],
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    icon: <FaGamepad />,
    description: 'Recreational and leisure activities',
    behaviors: [
      { id: 'videogames', label: 'Video Games', checked: false },
      { id: 'movies', label: 'Movies/TV Shows', checked: false },
      { id: 'boardgames', label: 'Board Games', checked: false },
    ],
  },
  {
    id: 'musical',
    title: 'Musical Interests',
    icon: <FaMusic />,
    description: 'Music-related activities and preferences',
    behaviors: [
      { id: 'listening', label: 'Music Listening', checked: false },
      { id: 'playing', label: 'Playing Instruments', checked: false },
      { id: 'singing', label: 'Singing', checked: false },
    ],
  },
];

const BehaviorInterestsProfile: React.FC<BehaviorInterestsProfileProps> = ({
  onSave,
  initialData,
}) => {
  const [categories, setCategories] = useState<BehaviorCategory[]>(
    initialData?.categories || defaultCategories
  );

  useEffect(() => {
    // Autosave whenever categories change
    onSave({ categories });
  }, [categories, onSave]);

  const handleBehaviorChange = (
    categoryId: string,
    behaviorId: string,
    changes: Partial<Behavior>
  ) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              behaviors: category.behaviors.map((behavior) =>
                behavior.id === behaviorId
                  ? { ...behavior, ...changes }
                  : behavior
              ),
            }
          : category
      )
    );
  };

  return (
    <div className="behavior-profile">
      <div className="profile-header">
        <h2>Behavior & Interests Profile</h2>
      </div>
      
      <div className="behavior-grid">
        {categories.map((category) => (
          <div key={category.id} className="behavior-category">
            <div className="category-header">
              <span className="category-icon">{category.icon}</span>
              <div className="tooltip-wrapper">
                <h3 className="category-title">{category.title}</h3>
                {category.description && (
                  <div className="tooltip-content">{category.description}</div>
                )}
              </div>
            </div>

            <div className="behavior-items">
              {category.behaviors.map((behavior) => (
                <div key={behavior.id} className="behavior-item">
                  <div className="behavior-checkbox">
                    <input
                      type="checkbox"
                      id={`${category.id}-${behavior.id}`}
                      checked={behavior.checked}
                      onChange={(e) =>
                        handleBehaviorChange(category.id, behavior.id, {
                          checked: e.target.checked,
                        })
                      }
                    />
                    <label htmlFor={`${category.id}-${behavior.id}`}>
                      {behavior.label}
                    </label>
                  </div>

                  {behavior.checked && (
                    <>
                      <input
                        type="range"
                        className="intensity-slider"
                        min="1"
                        max="5"
                        value={behavior.intensity || 3}
                        onChange={(e) =>
                          handleBehaviorChange(category.id, behavior.id, {
                            intensity: parseInt(e.target.value),
                          })
                        }
                      />
                      <div className="behavior-notes">
                        <textarea
                          className="notes-input"
                          placeholder="Add notes..."
                          value={behavior.notes || ''}
                          onChange={(e) =>
                            handleBehaviorChange(category.id, behavior.id, {
                              notes: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BehaviorInterestsProfile; 