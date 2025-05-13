import React from 'react';

const Spinner = ({ size = 'md' }) => (
  <div className={`spinner-border text-primary spinner-border-${size}`}>
    <span className="visually-hidden">Cargando...</span>
  </div>
);

export default Spinner;