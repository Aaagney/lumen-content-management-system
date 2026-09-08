import React from 'react';

const SearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="search-wrapper">
      <svg className="search-icon" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        id="searchInput"
        className="search-input"
        placeholder="Search articles..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
