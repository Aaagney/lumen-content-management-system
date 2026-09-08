import React from 'react';

const FloatingWidgets = () => {
  return (
    <>
      {/* Cookies Badge */}
      <div className="cookie-badge">
        Manage cookies or opt out
      </div>

      {/* Help & Resources Widget */}
      <button className="help-floating-btn" type="button" aria-label="Help and resources">
        Help and resources
        <span className="badge">?</span>
      </button>
    </>
  );
};

export default FloatingWidgets;
