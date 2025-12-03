export class Task {
    id: string;
    title: string;
    course?: string;
    dueDate?: Date;
    status: 'PENDING' | 'COMPLETED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    reminder: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

