export enum MoneyType {
    EXPENSE = 'expense',
    INCOME = 'income',
}

export interface Money {
    id: string;
    name: string;
    amount: number;
    type: MoneyType;
    description?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateMoneyDto {
    name: string;
    amount: number;
    type: MoneyType;
    description?: string;
}

export interface UpdateMoneyDto {
    name?: string;
    amount?: number;
    type?: MoneyType;
    description?: string;
}

// API URL - can be overridden via NEXT_PUBLIC_API_URL environment variable
const getApiUrl = (): string => {
    if (typeof window === 'undefined') return 'http://localhost:4000';
    // @ts-ignore - Next.js provides process.env in client-side code
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

const API_URL = getApiUrl();

async function fetchAPI<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

export const createMoney = async (dto: CreateMoneyDto): Promise<Money> => {
    const result = await fetchAPI<{ success: boolean; item: Money }>('/money', {
        method: 'POST',
        body: JSON.stringify(dto),
    });
    return result.item;
};

export const getAllMoney = async (): Promise<Money[]> => {
    const result = await fetchAPI<{ success: boolean; items: Money[] }>('/money');
    return result.items;
};

export const getMoneyById = async (id: string): Promise<Money> => {
    const result = await fetchAPI<{ success: boolean; item: Money }>(`/money/${id}`);
    return result.item;
};

export const updateMoney = async (id: string, dto: UpdateMoneyDto): Promise<Money> => {
    const result = await fetchAPI<{ success: boolean; item: Money }>(`/money/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
    });
    return result.item;
};

export const deleteMoney = async (id: string): Promise<{ success: boolean }> => {
    return await fetchAPI<{ success: boolean }>(`/money/${id}`, {
        method: 'DELETE',
    });
};

