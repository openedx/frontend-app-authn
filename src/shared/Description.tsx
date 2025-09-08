import React from 'react';

const Description = ({ message }: {message: string}) => (
  <p className="tw-text-gray-600 tw-text-[16px] tw-leading-[24px] tw-mb-0">
    {message}
  </p>
);

export default Description;
