import { appId } from '../../constants';

export const ThirdPartyAuthQueryKeys = {
  all: [appId, 'ThirdPartyAuth'] as const,
  byPage: (pageId: string) => [appId, 'ThirdPartyAuth', pageId] as const,
};
