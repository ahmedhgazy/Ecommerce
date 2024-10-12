class CourseMain {
    constructor(
        // cant't be modifiable in or outside of the class
        private readonly _title: string,
        private _subtitle: string,
        private _description: string,
        private _price: number,
        private _creationDate: Date
    ) {}

    // to call the method without () use get
    get age() {
        const age = new Date().getTime() - this._creationDate.getTime();

        return Math.round(age / 1000 / 60 / 24); //integer
    }

    // setters and getters

    getTitle() {
        return this._title;
    }

    // set the title which is private

    set subtitle(newTitle: string) {
        if (!newTitle) {
            throw 'TITLE CAN NOT BE EMPTY';
        }
        this._subtitle = newTitle;
    }
}

const courseOne = new CourseMain(
    'Angular',
    'Angular - The Complete Guide',
    'The Complete Guide',
    1000,
    new Date(2000, 1, 1)
);

courseOne.age;

courseOne.subtitle;
