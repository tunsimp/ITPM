export class Schedule {
    id: string;
    course: string;
    code?: string;
    professor?: string;
    room?: string;
    time: string;
    day: string;
    isRecurring: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

