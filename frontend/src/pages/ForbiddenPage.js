import React from 'react';

function ForbiddenPage() {
  return (
    <div className="page-centered" data-testid="forbidden-page">
      <h1>403 - Forbidden</h1>
      <p>You do not have permission to access this page with your current role.</p>
    </div>
  );
}

export default ForbiddenPage;


