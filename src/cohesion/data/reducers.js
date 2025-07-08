import { SET_COHESION_EVENT_ELEMENT_STATES } from './actions';

export const storeName = 'cohesion';

export const defaultState = {
  eventData: {},
};

export const reducer = (state = defaultState, action = {}) => {
  if (action.type === SET_COHESION_EVENT_ELEMENT_STATES) {
    return {
      ...state,
      eventData: action.payload,
    };
  }
  return state;
};
