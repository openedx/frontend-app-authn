import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import Zendesk from 'react-zendesk';

import messages from './messages';

const ZendeskHelp = () => {
  const { formatMessage } = useIntl();
  const setting = {
    cookies: true,
    webWidget: {
      contactOptions: {
        enabled: false,
      },
      chat: {
        suppress: false,
      },
      contactForm: {
        ticketForms: [
          {
            id: 360003368814,
            subject: false,
            fields: [{ id: 'description', prefill: { '*': '' } }],
          },
        ],
        selectTicketForm: {
          '*': formatMessage(messages.selectTicketForm),
        },
        attachments: true,
      },
      helpCenter: {
        originalArticleButton: true,
      },
      answerBot: {
        suppress: false,
        contactOnlyAfterQuery: true,
        title: { '*': formatMessage(messages.supportTitle) },
        avatar: {
          url: getConfig().ZENDESK_LOGO_URL,
          name: { '*': formatMessage(messages.supportTitle) },
        },
      },
    },
  };

  return (
    <Zendesk defer zendeskKey={getConfig().ZENDESK_KEY} {...setting} />
  );
};

export default ZendeskHelp;
