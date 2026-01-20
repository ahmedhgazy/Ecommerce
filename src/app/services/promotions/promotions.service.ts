import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {
  private apiUrl = `${environment.apiUrl}/promotions`;

  constructor(private http: HttpClient) { }

  getFlashSaleEndDate(): Observable<Date> {
    return this.http.get<ApiResponse<string>>(`${this.apiUrl}/flash-sale`).pipe(
      map(response => new Date(response.data!))
    );
  }
}
