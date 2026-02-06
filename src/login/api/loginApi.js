// TODO: Delete this file
// import { getConfig } from '@edx/frontend-platform';
// import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
// import * as QueryString from 'query-string';
// // TODO : Delete this file
// /**
//  * Login API service
//  */
// export const loginApi = {
//   /**
//    * Login user with credentials
//    * @param {Object} creds - Login credentials
//    * @param {string} creds.email_or_username - Email or username
//    * @param {string} creds.password - Password
//    * @returns {Promise<{redirectUrl: string, success: boolean}>}
//    */
//   async login(creds) {
//     const requestConfig = {
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       isPublic: true,
//     };

//     const { data } = await getAuthenticatedHttpClient()
//       .post(
//         `${getConfig().LMS_BASE_URL}/api/user/v2/account/login_session/`,
//         QueryString.stringify(creds),
//         requestConfig,
//       );

//     return {
//       redirectUrl: data.redirect_url || `${getConfig().LMS_BASE_URL}/dashboard`,
//       success: data.success || false,
//     };
//   },
// };