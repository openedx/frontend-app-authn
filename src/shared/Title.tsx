import React from 'react';

const Title = ({ message }: {message: string}) => (
  <h3 className="tw-text-gray-900 tw-font-semibold tw-text-[30px] tw-leading-[38px] tw-mb-0">
    {message}
  </h3>
);

export default Title;
