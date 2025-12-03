export class CreateScheduleDto {
    course: string;
    code?: string;
    professor?: string;
    room?: string;
    time: string;
    day: string;
    isRecurring?: boolean;
}

