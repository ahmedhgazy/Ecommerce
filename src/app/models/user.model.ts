export class User {
    constructor(
        public email: string,
        public id: string,
        private _token,
        public ExpirationDate: Date,
        public displayName?: string,
        public emailVerified?: boolean,
        public expiresIn?: string,
        public federatedId?: string,
        public firstName?: string,
        public fullName?: string,
        public idToken?: string,
        public kind?: string,

        public lastName?: string,

        public localId?: string,

        public oauthIdToken?: string,

        public photoUrl?: string,

        public providerId?: string,
        public rawUserInfo?: string,

        public refreshToken?: string
    ) {}

    get token() {
        if (!this.ExpirationDate || new Date() > this.ExpirationDate) {
            return null;
        }

        return this._token;
    }
}
