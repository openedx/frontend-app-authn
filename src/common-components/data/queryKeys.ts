import { appId } from '../../constants';

export const ThirdPartyAuthQueryKeys = {
  all: [appId, 'ThirdPartyAuth'] as const,
  byPage: (pageId: string, payload: Record<string, unknown> = {}) => (
    [appId, 'ThirdPartyAuth', pageId, payload] as const
  ),
};
