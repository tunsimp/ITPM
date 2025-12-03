export class UpdateTaskDto {
    title?: string;
    course?: string;
    dueDate?: string;
    status?: 'PENDING' | 'COMPLETED' | 'pending' | 'completed';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'low' | 'medium' | 'high';
    reminder?: boolean;
}