import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/auth.model';

export interface UserProfile {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    address?: string;
    zipCode?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    city?: string;
    country?: string;
    email: string;
}

export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    address?: string;
    zipCode?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    city?: string;
    country?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private readonly apiUrl = `${environment.apiUrl}/profile`;

    profile$ = new BehaviorSubject<UserProfile | null>(null);

    constructor(private http: HttpClient) { }

    getProfile(): Observable<UserProfile> {
        return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}`)
            .pipe(
                map(response => response.data!),
                tap(profile => this.profile$.next(profile))
            );
    }

    updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
        return this.http.put<ApiResponse<UserProfile>>(`${this.apiUrl}`, request)
            .pipe(
                map(response => response.data!),
                tap(profile => this.profile$.next(profile))
            );
    }
}
