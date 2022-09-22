import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SendSmsService {

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  subscribeToMarketingSms(phone: string) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/subscribe-marketing-sms`, { phone }));
  }

  sendSms(content: string, imageUrl?: string) {
    console.log('Sending sms:', content, imageUrl)
    return firstValueFrom(this.http.post(`${this.baseUrl}/send-sms`, { content, imageUrl }));
  }

  getImageUrls() {
    console.log('getting image urls');
    return Promise.resolve(['https://bac-mau-business.s3.us-west-1.amazonaws.com/DSC01213.JPG',
      'https://bac-mau-business.s3.us-west-1.amazonaws.com/DSC01219.JPG']);
    // return firstValueFrom(this.http.);
  }

  // https://aws.amazon.com/blogs/compute/uploading-to-amazon-s3-directly-from-a-web-or-mobile-application
  getSignedUrl(fileName: string, contentType: string): Promise<GetSignedUrlResponse> {
    console.log('Getting signed url');
    return firstValueFrom(this.http.get<GetSignedUrlResponse>(`${this.baseUrl}/upload-image/get-signed-url`, {
      params: {
        fileName,
        contentType
      }
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
}

export interface GetSignedUrlResponse {
  url: string;
  fields: { [key: string]: string };
}