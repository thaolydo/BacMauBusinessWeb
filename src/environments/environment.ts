// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'https://sms.hpham.net',
  huyBaseUrl: 'https://jb5dvuizm2.execute-api.us-east-1.amazonaws.com',
  callBackUrl: 'http://localhost:4200/sign-in?landing_page=settings',
  identityPoolId: 'us-east-1:e551d89a-fbfc-4004-839e-f3e6f9b97024',

  // latest
  userPoolId: 'us-east-1_QnXXhmmWw',
  userPoolClientId: '2rhtucbn403p2p3fgehfuucdu0',
  cognitoDomain: 'pham-sms-v3',

  // v3
  userPoolId_v3: 'us-east-1_QnXXhmmWw',
  userPoolClientId_v3: '2rhtucbn403p2p3fgehfuucdu0',
  cognitoDomain_v3: 'pham-sms-v3',

  // v2
  userPoolId_v2: 'us-east-1_BqZpu49f2',
  userPoolClientId_v2: '2vid113ou94rh28ol96ia6m64s',
  cognitoDomain_v2: 'pham-sms-v2',

  // v0
  userPoolId_v0: 'us-east-1_r98psFKFd',
  userPoolClientId_v0: '46133nv30eboe2jbbedv969j9s',
  cognitoDomain_v0: 'pham-sms',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
