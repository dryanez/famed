import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Assistant() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home since assistant functionality is handled by FloatingAssistant
    navigate('/');
  }, [navigate]);

  return (
    <div className="p-4">
      <p>Redirecting to home...</p>
    </div>
  );
}