export enum MoneyType {
  EXPENSE = 'expense',
  INCOME = 'income',
}

export class Money {
  id: string;
  name: string;
  amount: number;
  type: MoneyType;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}
