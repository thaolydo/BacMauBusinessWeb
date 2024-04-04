// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'https://sms.hpham.net',
  callBackUrl: 'http://localhost:4200/sign-in?landing_page=settings',

  // latest
  userPoolId: 'us-east-1_QnXXhmmWw',
  userPoolClientId: '2rhtucbn403p2p3fgehfuucdu0',
  identityPoolId: 'us-east-1:8e6d72c6-605f-4d54-a3ae-cc0a9140e252',
  cognitoDomain: 'pham-sms-v3',

  // v3
  userPoolId_v3: 'us-east-1_QnXXhmmWw',
  userPoolClientId_v3: '2rhtucbn403p2p3fgehfuucdu0',
  identityPoolId_v3: 'us-east-1:8e6d72c6-605f-4d54-a3ae-cc0a9140e252',
  cognitoDomain_v3: 'pham-sms-v3',

  // v2
  userPoolId_v2: 'us-east-1_BqZpu49f2',
  userPoolClientId_v2: '2vid113ou94rh28ol96ia6m64s',
  identityPoolId_v2: 'us-east-1:8cf01eba-efbc-4680-badc-64c52d548d5c',
  cognitoDomain_v2: 'pham-sms-v2',

  // v0
  userPoolId_v0: 'us-east-1_r98psFKFd',
  userPoolClientId_v0: '46133nv30eboe2jbbedv969j9s',
  identityPoolId_v0: 'us-east-1:3bf05e47-4681-4655-833e-d9e8ef7145a7',
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
