import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SmallLayout from './SmallLayout';
import mockedRecommendedProducts from '../data/tests/mockedData';

// Setup React Query client for tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('@openedx/paragon', () => ({
  ...jest.requireActual('@openedx/paragon'),
  useMediaQuery: jest.fn(),
}));

describe('RecommendationsPageTests', () => {
  let props = {};
  let queryClient;

  const renderWithProviders = (children) => {
    queryClient = createTestQueryClient();
    
    return render(
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en" messages={{}}>
          <MemoryRouter>
            {children}
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    props = {
      userId: 123,
      personalizedRecommendations: mockedRecommendedProducts,
      isLoading: false,
    };
  });

  it('should render recommendations when recommendations are not loading', () => {
    const { container } = renderWithProviders(<SmallLayout {...props} />);

    const reactLoadingSkeleton = container.querySelector('.react-loading-skeleton');

    expect(reactLoadingSkeleton).toBeNull();
  });

  it('should render loading state when recommendations are loading', () => {
    props = {
      ...props,
      isLoading: true,
    };
    const { container } = renderWithProviders(<SmallLayout {...props} />);

    const reactLoadingSkeleton = container.querySelector('.react-loading-skeleton');

    expect(reactLoadingSkeleton).toBeTruthy();
  });
});
