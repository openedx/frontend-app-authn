import React from 'react';

import { cn } from '../../../utils/cn';
import HeroPanel from '../hero-panel/index.tsx';

const LargeLayout = () => (
  <div
    className={cn('w-50 d-flex tw-pl-0 tw-py-6 tw-pr-6 tw-h-full')}
  >
    <HeroPanel />
  </div>
);

export default LargeLayout;
