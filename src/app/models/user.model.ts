export class User {
    constructor(
        public id: number,
        public email: string,
        private _accessToken: string,
        private _refreshToken: string,
        public expirationDate: Date,
        public displayName?: string,
        public firstName?: string,
        public lastName?: string,
        public photoUrl?: string
    ) { }

    get token(): string | null {
        if (!this.expirationDate || new Date() > this.expirationDate) {
            return null;
        }
        return this._accessToken;
    }

    get accessToken(): string {
        return this._accessToken;
    }

    get refreshToken(): string {
        return this._refreshToken;
    }

    get isTokenExpired(): boolean {
        return !this.expirationDate || new Date() > this.expirationDate;
    }
}
