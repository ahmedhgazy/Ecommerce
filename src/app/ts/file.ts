/*
 * Class is a language construct where we have data amd behavior that are tightly related to each other
 */
// Blue print for a course
class Course {
    title: string;
    subtitle: string;
    price: number;
    creationDate: Date;
    // need a way to initialize the data whenever
    // we create an instance of the class
    // initialize the data in the class and no more
    constructor(
        title: string,
        subtitle: string,
        price: number,
        creationDate: Date
    ) {
        this.title = title;
        this.subtitle = subtitle;
        this.price = price;
        this.creationDate = creationDate;
    }

    // behavior

    age() {
        const age = new Date().getTime() - this.creationDate.getTime();

        return Math.round(age / 1000 / 60 / 24); //integer
    }
}

const course = new Course(
    'Angular',
    'The Complete Guide',
    1000,
    new Date(2000, 1, 1)
);

course.age();
