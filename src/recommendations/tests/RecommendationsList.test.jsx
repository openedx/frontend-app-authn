import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import mockedProductData from './mockedData';
import RecommendationList from '../RecommendationsList';

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

describe('RecommendationsListTests', () => {
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
      </QueryClientProvider>,
    );
  };

  it('should render the product card', () => {
    const props = {
      recommendations: mockedProductData,
      userId: 1234567,
    };

    const { container } = renderWithProviders(<RecommendationList {...props} />);

    const recommendationCards = container.querySelectorAll('.recommendation-card');
    expect(recommendationCards.length).toEqual(mockedProductData.length);
  });

  it('should render the recommendations card with footer content', () => {
    const props = {
      recommendations: mockedProductData,
      userId: 1234567,
    };

    const { getByText } = renderWithProviders(<RecommendationList {...props} />);

    const firstFooterContent = getByText('1 Course');
    const secondFooterContent = getByText('2 Courses');

    expect(firstFooterContent).toBeTruthy();
    expect(secondFooterContent).toBeTruthy();
  });
});
