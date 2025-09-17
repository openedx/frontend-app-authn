import { renderHook } from '@testing-library/react';
import { getConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import useRecaptchaSubmission from './hooks';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({ formatMessage: (msg) => msg.defaultMessage || msg }),
}));

describe('useRecaptchaSubmission', () => {
  beforeEach(() => {
    getConfig.mockReturnValue({ RECAPTCHA_SITE_KEY_WEB: 'test-key' });
    useGoogleReCaptcha.mockReturnValue({ executeRecaptcha: jest.fn() });
  });

  it('should throw error if reCAPTCHA returns empty token', async () => {
    useGoogleReCaptcha.mockReturnValue({
      executeRecaptcha: jest.fn().mockResolvedValue(null),
    });

    const { result } = renderHook(() => useRecaptchaSubmission('test_action'), {
      wrapper: ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>,
    });

    await expect(result.current.executeWithFallback()).rejects.toThrow(
      'CAPTCHA verification failed.'
    );
  });

  it('should warn and return null if reCAPTCHA key exists but executeRecaptcha is not ready', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    useGoogleReCaptcha.mockReturnValue({
      executeRecaptcha: undefined,
    });

    const { result } = renderHook(() => useRecaptchaSubmission('test_action'), {
      wrapper: ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>,
    });

    const token = await result.current.executeWithFallback();

    expect(token).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'reCAPTCHA not ready for action: test_action. Proceeding without token.'
    );

    warnSpy.mockRestore();
  });

  it('should handle undefined RECAPTCHA_SITE_KEY_WEB gracefully', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    getConfig.mockReturnValue({ RECAPTCHA_SITE_KEY_WEB: undefined });

    const { result } = renderHook(() => useRecaptchaSubmission('test_action'), {
      wrapper: ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>,
    });

    const token = await result.current.executeWithFallback();

    expect(token).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('should return token if reCAPTCHA succeeds', async () => {
    useGoogleReCaptcha.mockReturnValue({
      executeRecaptcha: jest.fn().mockResolvedValue('valid-token'),
    });

    const { result } = renderHook(() => useRecaptchaSubmission('test_action'), {
      wrapper: ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>,
    });

    const token = await result.current.executeWithFallback();
    expect(token).toBe('valid-token');
  });
});
