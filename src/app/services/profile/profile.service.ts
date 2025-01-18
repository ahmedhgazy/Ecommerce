import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {BehaviorSubject, catchError, map, shareReplay, tap, throwError,} from 'rxjs';
import {Profile} from '../../models/profile.model';
import {MessagesService} from '../../shared/errors/messages/messages.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private userID: string = '';
    auth = inject(AuthService);
    profileSubject = new BehaviorSubject<Profile>({});
    profileObs$ = this.profileSubject.asObservable();
    private messages: MessagesService;
    constructor() {
        this.userID = this.auth.user.getValue()?.id;
    }
    http = inject(HttpClient);
    private baseUrl = 'https://e-commerce-ac5d3-default-rtdb.firebaseio.com';

    updateProfile(profileInfo: Partial<Profile>) {
        let ProfileList = [];
        ProfileList.push(profileInfo);
        return this.http
            .put<Profile[]>(
                `${this.baseUrl}/user/${this.userID}.json`,
                ProfileList
            )
            .pipe(
                tap((data: Profile[]) => {
                    this.profileSubject.next(data[0]);
                }),
                shareReplay(1),
                catchError((err) => {
                    const message =
                        'Something went wrong, please try again later';
                    this.messages.showErrors(message);
                    return throwError(() => new Error(err));
                })
            );
    }

    getProfileInfo() {
        return this.http
            .get<{ [key: string]: Profile }>(
                `${this.baseUrl}/user/${this.userID}.json`
            )
            .pipe(
                map((data: { [key: string]: Profile }) => {
                    let profileDataList = [];
                    for (const key in data) {
                        profileDataList.push(data[key]);
                    }
                  return profileDataList[0];
                }),
                tap((response: Profile) => {
                    this.profileSubject.next(response);
                }),
                shareReplay(1),
                catchError((err) => {
                    const message =
                        'Something went wrong,please try again later';
                    this.messages.showErrors(message);
                    return throwError(() => new Error(err));
                })
            );
    }
}
