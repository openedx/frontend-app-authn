// Algolia Search Helper mock data
class CreateAlgoliaSearchHelperMock {
  hits = [];

  eventCb = () => {};

  derived = [];

  maxLimit = 0;

  refineProp = null;

  refineVal = null;

  constructor(mockData = [], limit = 0) {
    this.hits = mockData;
    this.maxLimit = limit;
  }

  onMock(eventName, callback) {
    if (eventName === 'result') {
      const hitData = this.hits.slice(0, this.maxLimit > 0 ? this.maxLimit : this.hits.length);
      callback({
        results: {
          hits: hitData,
        },
      });
    } else if (eventName === 'error') {
      callback({});
    }
  }

  setQueryMock = () => {};

  searchMock = () => {
    this.eventCb();
  };

  clearRefinementsMock = () => this;

  refinementMock(refineBy, value) {
    // addDisjunctiveFacetRefinement // addFacetRefinement
    this.refineProp = refineBy;
    this.refineVal = value;
    return this;
  }

  on = this.onMock;

  setQuery = this.setQueryMock;

  search = this.searchMock;

  derive = this.deriveMock;

  clearRefinements = this.clearRefinementsMock;

  addDisjunctiveFacetRefinement = this.refinementMock;

  addFacetRefinement = this.refinementMock;
}

export default CreateAlgoliaSearchHelperMock;
