import React from 'react';

const CATEGORIES = ['All', 'Science', 'Technology', 'Environment', 'Health', 'History'];

const CategoryPills = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="filter-pills">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          className={`pill ${activeCategory === category ? 'active' : ''}`}
          data-category={category}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;
