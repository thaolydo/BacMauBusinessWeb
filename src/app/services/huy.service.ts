import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { createHash, createHmac } from 'crypto';
import { SHA256, enc, HmacSHA256 } from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class HuyService {

  private BASE_URL = environment.huyApiUrl;

  constructor(private http: HttpClient) { }

  async get(access_key: string, secret_key: string, sessionToken: string) {
    // Task 1: Create canonical request
    const service = 'execute-api'
    const host = '46ozz8hiti.execute-api.us-west-1.amazonaws.com';
    const amzdate = new Date().toISOString().split('.')[0].replace(/[-|:]/g, '') + 'Z';

    const method = 'GET';
    const canonical_uri = '/';
    // const request_parameters = 'Action=DescribeRegions&Version=2013-10-15';
    const request_parameters = '';
    const canonical_querystring = request_parameters;
    const canonical_headers = 'host:' + host + '\n' + 'x-amz-date:' + amzdate + '\n';
    const signed_headers = 'host;x-amz-date';
    const hexEncodedHash = this.hash('');
    const canical_request = method + '\n' +
      canonical_uri + '\n' +
      canonical_querystring + '\n' +
      canonical_headers + '\n' +
      signed_headers + '\n' +
      hexEncodedHash

    // Task 2: Create string to sign
    const region = 'us-west-1';
    const algorithm = 'AWS4-HMAC-SHA256';
    const datestamp = '20221209';
    const credential_scope = datestamp + '/' + region + '/' + service + '/' + 'aws4_request'
    const string_to_sign = algorithm + '\n' +  amzdate + '\n' +  credential_scope + '\n' +  this.hash(canical_request);

    // Task 3: calcualte the signature
    const signing_key = this.getSignatureKey(secret_key, datestamp, region, service);
    const signature = this.sign(signing_key, string_to_sign).toString();
    console.log('signature =', signature);

    // Task 4: add signature to the request
    const authorization_header = algorithm + ' ' + 'Credential=' + access_key + '/' + credential_scope + ', ' +  'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature;

    return firstValueFrom(this.http.get(this.BASE_URL, {
      headers: {
        'x-amz-date': amzdate,
        'Authorization': authorization_header,
        'X-Amz-Security-Token': sessionToken
      }
    }));
  }

  // private decoder = new TextDecoder();
  private sign(key: CryptoJS.lib.WordArray, msg: string): CryptoJS.lib.WordArray {
    return HmacSHA256(msg, key);
  }

  private getSignatureKey(key: string, date_stamp: string, regionName: string, serviceName: string) {
    const kDate = this.sign(enc.Utf8.parse('AWS4' + key), date_stamp);
    const kRegion = this.sign(kDate, regionName);
    const kService = this.sign(kRegion, serviceName);
    const kSigning = this.sign(kService, 'aws4_request');
    return kSigning;
  }

  private hash(msg: string) {
    return SHA256(msg).toString(enc.Hex);
  }
}
