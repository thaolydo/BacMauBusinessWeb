import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdEvent, ConversionCountUpdateType } from '@model/send-sms-event.model';
import { Observable, catchError, firstValueFrom, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TimeUtil } from '../utils/time.util';
import { CreateAdEventRequest } from '@model/public-interface/create-ad-event-request.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SendSmsService {

  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  async subscribeToMarketingSms(phone: string) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/subscribe`, { phone }, {
      params: {
        cid: phone
      },
    }));
  }

  async sendSms(content: string, description: string, includeClickThroughLink?: boolean, redirectUrl?: string) {
    console.log('Sending sms:', content, description, redirectUrl);
    // return new Promise(x => setTimeout(x, 1000));
    const bid = await this.authService.getDefaultBid();
    const body = {
      content,
      description,
      includeClickThroughLink,
      redirectUrl,
      includePendingCustomers: bid == 'venus',
    } as CreateAdEventRequest;
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/ad-event`, body)
      .pipe(
        catchError((err: HttpErrorResponse, caught: any) => {
          if (err.status == HttpStatusCode.BadRequest) {
            // TODO: notify admin
            alert(`SendSmsService: sendSms: ${err.error.errMsg}`);
            return of();
          }
          throw err;
        }),
      ));
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

  async getSmsEvents(): Promise<AdEvent[]> {
    console.log('Getting sms events');
    return firstValueFrom(this.http.get(`${this.baseUrl}/ad-event`)
      .pipe(
        map((res: any) => {
          const toReturn = [] as AdEvent[];
          for (const event of res.smsEvents.items) {
            toReturn.push({
              createdAt: TimeUtil.parseTimeString(event.createdAt).valueOf(),
              ...event,
            } as AdEvent);
          }
          return toReturn;
        })
      ));
  }

  async updateConversionCount(createdAt: string, updateType: ConversionCountUpdateType) {
    console.log(`Updating conversion count for ${createdAt} with type ${updateType}`);
    return firstValueFrom(this.http.put(`${this.baseUrl}/update-conversion`, {
      createdAt,
      updateType,
    }));
  }

  async getEstimatedCustomerCount(): Promise<number> {
    console.log('Getting customer count');
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/get-estimated-customer-count`).pipe(
      map(res => res.estimatedCustomerCount as number)
    ));
  }

  async saveClickThroughCount(id: string) {
    console.log(`Saving click through count for id ${id}`);
    return firstValueFrom(this.http.put(`${this.baseUrl}/c`, {}, {
      headers: {
        'X-Intercept': 'false'
      },
      params: {
        id,
      },
    }));
  }

}

export interface GetSignedUrlResponse {
  url: string;
  fields: { [key: string]: string };
}
