import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Image } from '@openedx/paragon';

import illustration from '../../../assets/images/illustration-1.svg';
import { GlassCard } from '../../../shared/index.ts';
import { cn } from '../../../utils/cn';
import messages from '../default-layout/messages';

const HeroPanel = () => {
  const { formatMessage } = useIntl();

  return (
    <GlassCard className="tw-min-w-[696px]">
      <div
        id="content-container"
        className={cn(
          'tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-12',
        )}
      >
        <Image src={illustration} alt="Illustration" />
        <div className="tw-text-center tw-space-y-2">
          <h3
            className={cn(
              'tw-font-semibold tw-text-[30px] tw-leading-[38px]',
              'tw-text-transparent tw-bg-clip-text tw-bg-gradient-to-b tw-from-[#43cbff] tw-to-[#9708cc]',
            )}
          >
            {formatMessage(messages['welcome.to'], {
              siteName: getConfig().SITE_NAME,
            })}
          </h3>
          <p
            className={cn(
              'tw-text-gray-600 tw-text-[16px] tw-leading-[24px]',
            )}
          >
            {formatMessage(messages['sign.in.to.explore'])}
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default HeroPanel;
