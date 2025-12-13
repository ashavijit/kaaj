import {
    LoanApplication,
    LoanApplicationCreate,
    LoanApplicationUpdate,
    Lender,
    LenderCreate,
    LenderUpdate,
    LenderPolicy,
    LenderPolicyCreate,
    MatchResult,
    UnderwritingResponse,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new ApiError(response.status, error || response.statusText);
    }

    return response.json();
}


export async function getApplications(skip = 0, limit = 100): Promise<LoanApplication[]> {
    return fetchApi<LoanApplication[]>(`/applications?skip=${skip}&limit=${limit}`);
}

export async function getApplication(id: string): Promise<LoanApplication> {
    return fetchApi<LoanApplication>(`/applications/${id}`);
}

export async function createApplication(data: LoanApplicationCreate): Promise<LoanApplication> {
    return fetchApi<LoanApplication>('/applications', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateApplication(
    id: string,
    data: LoanApplicationUpdate
): Promise<LoanApplication> {
    return fetchApi<LoanApplication>(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteApplication(id: string): Promise<void> {
    await fetchApi(`/applications/${id}`, { method: 'DELETE' });
}

export async function submitApplication(id: string): Promise<LoanApplication> {
    return fetchApi<LoanApplication>(`/applications/${id}/submit`, {
        method: 'POST',
    });
}


export async function getLenders(): Promise<Lender[]> {
    return fetchApi<Lender[]>('/lenders');
}

export async function getLender(id: string): Promise<Lender> {
    return fetchApi<Lender>(`/lenders/${id}`);
}

export async function createLender(data: LenderCreate): Promise<Lender> {
    return fetchApi<Lender>('/lenders', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateLender(id: string, data: LenderUpdate): Promise<Lender> {
    return fetchApi<Lender>(`/lenders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteLender(id: string): Promise<void> {
    await fetchApi(`/lenders/${id}`, { method: 'DELETE' });
}


export async function addPolicy(
    lenderId: string,
    data: LenderPolicyCreate
): Promise<LenderPolicy> {
    return fetchApi<LenderPolicy>(`/lenders/${lenderId}/policies`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updatePolicy(
    lenderId: string,
    policyId: string,
    data: Partial<LenderPolicyCreate>
): Promise<LenderPolicy> {
    return fetchApi<LenderPolicy>(`/lenders/${lenderId}/policies/${policyId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deletePolicy(lenderId: string, policyId: string): Promise<void> {
    await fetchApi(`/lenders/${lenderId}/policies/${policyId}`, { method: 'DELETE' });
}


export async function runUnderwriting(applicationId: string): Promise<UnderwritingResponse> {
    return fetchApi<UnderwritingResponse>(`/underwrite/${applicationId}`, {
        method: 'POST',
    });
}

export async function getUnderwritingStatus(
    applicationId: string
): Promise<{ status: string; matches?: MatchResult[] }> {
    return fetchApi(`/underwrite/${applicationId}/status`);
}

export async function getAvailableRules(): Promise<string[]> {
    return fetchApi<string[]>('/underwrite/rules/available');
}


export async function getMatches(applicationId: string): Promise<MatchResult[]> {
    return fetchApi<MatchResult[]>(`/matches/${applicationId}`);
}

export async function getEligibleMatches(applicationId: string): Promise<MatchResult[]> {
    return fetchApi<MatchResult[]>(`/matches/${applicationId}/eligible`);
}


export async function healthCheck(): Promise<{ status: string }> {
    return fetchApi<{ status: string }>('/health');
}
