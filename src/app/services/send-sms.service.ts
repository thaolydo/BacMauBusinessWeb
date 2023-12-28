import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SendSmsEvent } from '@model/send-sms-event.model';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TimeUtil } from '../utils/time.util';

@Injectable({
  providedIn: 'root'
})
export class SendSmsService {

  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) { }

  async subscribeToMarketingSms(phone: string) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/subscribe-customer`, { phone }, {
      params: {
        cid: phone
      },
    }));
  }

  async sendSms(content: string, imageUrl?: string) {
    console.log('Sending sms:', content, imageUrl)
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/create-ad-event`, { content, imageUrl }));
  }

  async getImageUrls() {
    console.log('getting image urls');
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/get-images`)
      .pipe(
        map(res => res.imageUrls)
      ));
  }

  // https://aws.amazon.com/blogs/compute/uploading-to-amazon-s3-directly-from-a-web-or-mobile-application
  async getSignedUrl(fileName: string, contentType: string): Promise<GetSignedUrlResponse> {
    console.log('Getting signed url');
    return firstValueFrom(this.http.get<GetSignedUrlResponse>(`${this.baseUrl}/get-signed-url`, {
      params: {
        fileName,
        contentType,
      },
    }));
  }

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_s3_presigned_post.html
  uploadToSignedPostUrl(signedUrl: string, fields: any, blob: Blob) {
    console.log('Uploading to signed url POST');

    // Generatinig form data following this post: https://www.webiny.com/blog/upload-files-to-aws-s3-using-pre-signed-post-data-and-a-lambda-function-7a9fb06d56c1
    const formData = new FormData();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key]);
    });
    formData.append('acl', 'public-read');

    // Actual file has to be appended last.
    formData.append("file", blob);
    return firstValueFrom(this.http.post(signedUrl, formData));
  }

  async getSmsEvents(): Promise<SendSmsEvent[]> {
    console.log('Getting sms events');
    return firstValueFrom(this.http.get(`${this.baseUrl}/get-ad-events`)
      .pipe(
        map((res: any) => {
          const toReturn = [] as SendSmsEvent[];
          for (const event of res.smsEvents.items) {
            toReturn.push({
              createdAt: TimeUtil.parseTimeString(event.createdAt).valueOf(),
              description: event.description,
              content: event.content,
            } as SendSmsEvent);
          }
          return toReturn;
        })
      ));
  }

}

export interface GetSignedUrlResponse {
  url: string;
  fields: { [key: string]: string };
}