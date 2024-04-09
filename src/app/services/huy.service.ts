import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HuyService {

  private baseUrl = environment.huyBaseUrl;

  constructor(
    private http: HttpClient,
  ) { }

  async getHuy(): Promise<any> {
    console.log('getHuy');
    const res = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/huy`));
    console.log('huy: done');
    return res;
  }

}
