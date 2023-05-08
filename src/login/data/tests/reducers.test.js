import { DISMISS_PASSWORD_RESET_BANNER } from '../actions';
import reducer from '../reducers';

describe('login reducer', () => {
  it('should update state to dismiss reset password banner', () => {
    const state = {
      showResetPasswordSuccessBanner: true,
    };
    const action = {
      type: DISMISS_PASSWORD_RESET_BANNER,
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        showResetPasswordSuccessBanner: false,
      },
    );
  });
});
