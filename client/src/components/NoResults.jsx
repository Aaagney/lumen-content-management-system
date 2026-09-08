import React from 'react';

const NoResults = () => {
  return (
    <div id="noResults" className="no-results">
      <svg className="no-results-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h2 className="no-results-title">No articles found</h2>
      <p className="no-results-desc">We couldn't find any articles matching your search query or selected category.</p>
    </div>
  );
};

export default NoResults;
