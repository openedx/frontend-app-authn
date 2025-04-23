import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    window.tagular?.('pageView');
  }, [location]);

  return null;
};

export default RouteTracker;
