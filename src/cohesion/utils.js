const mockTagular = () => {
  const getTagular = jest.fn();
  window.tagular = getTagular;
};

export default mockTagular;
