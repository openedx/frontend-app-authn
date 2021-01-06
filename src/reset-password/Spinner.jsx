import React from 'react';
import { Spinner as ParagonSpinner } from '@edx/paragon';

const Spinner = () => (
  <div className="container position-absolute h-90">
    <div className="d-flex justify-content-center align-items-center h-90">
      <ParagonSpinner animation="border" variant="primary" />
    </div>
  </div>
);

export default Spinner;
