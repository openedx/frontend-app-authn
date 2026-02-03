// todo remove this file
// import {
//   BACKUP_LOGIN_DATA,
//   DISMISS_PASSWORD_RESET_BANNER,
//   LOGIN_REQUEST,
// } from './actions';
// import { DEFAULT_STATE, PENDING_STATE } from '../../data/constants';
// import { RESET_PASSWORD } from '../../reset-password';

// export const defaultState = {
//   loginErrorCode: '', // done
//   loginErrorContext: {}, // done
//   loginResult: {}, // done
//   loginFormData: {
//     formFields: { // done
//       emailOrUsername: '', password: '',
//     },
//     errors: { // done
//       emailOrUsername: '', password: '',
//     },
//   },
//   shouldBackupState: false, // done
//   showResetPasswordSuccessBanner: false, // done
//   submitState: DEFAULT_STATE,
// };

// const reducer = (state = defaultState, action = {}) => {
//   switch (action.type) {
//     case BACKUP_LOGIN_DATA.BASE:
//       return {
//         ...state,
//         shouldBackupState: true,
//       };
//     case BACKUP_LOGIN_DATA.BEGIN:
//       return {
//         ...defaultState,
//         loginFormData: { ...action.payload },
//       };
//     case LOGIN_REQUEST.BEGIN:
//       return {
//         ...state,
//         showResetPasswordSuccessBanner: false,
//         submitState: PENDING_STATE,
//       };
//     case LOGIN_REQUEST.SUCCESS:
//       return {
//         ...state,
//         loginResult: action.payload,
//       };
//     case LOGIN_REQUEST.FAILURE: {
//       const { email, loginError, redirectUrl } = action.payload;
//       return {
//         ...state,
//         loginErrorCode: loginError.errorCode,
//         loginErrorContext: { ...loginError.context, email, redirectUrl },
//         submitState: DEFAULT_STATE,
//       };
//     }
//     case RESET_PASSWORD.SUCCESS:
//       return {
//         ...state,
//         showResetPasswordSuccessBanner: true,
//       };
//     case DISMISS_PASSWORD_RESET_BANNER: {
//       return {
//         ...state,
//         showResetPasswordSuccessBanner: false,
//       };
//     }
//     default:
//       return {
//         ...state,
//       };
//   }
// };

// export default reducer;
