import React from 'react';
import { Spinner as ParagonSpinner } from '@edx/paragon';

const Spinner = () => (
  <div className="position-absolute no-inset">
    <div className="d-flex justify-content-center align-items-center full-vertical-height">
      <ParagonSpinner animation="border" variant="primary" />
    </div>
  </div>
);

export default Spinner;
