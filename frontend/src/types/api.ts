// TypeScript types matching backend Pydantic schemas

export interface Guarantor {
    id: string;
    borrower_id: string;
    name: string;
    fico_score: number;
    has_bankruptcy: number;
    has_open_tax_liens: number;
}

export interface GuarantorCreate {
    name: string;
    fico_score: number;
    has_bankruptcy?: number;
    has_open_tax_liens?: number;
}

export interface Borrower {
    id: string;
    business_name: string;
    industry: string;
    state: string;
    years_in_business: number;
    annual_revenue: number;
    paynet_score: number | null;
    guarantors: Guarantor[];
}

export interface BorrowerCreate {
    business_name: string;
    industry: string;
    state: string;
    years_in_business: number;
    annual_revenue: number;
    paynet_score?: number | null;
    guarantors: GuarantorCreate[];
}

export interface LoanApplication {
    id: string;
    borrower_id: string;
    amount: number;
    term_months: number;
    equipment_type: string;
    equipment_age_years: number;
    equipment_description: string | null;
    status: 'draft' | 'submitted' | 'completed';
    borrower: Borrower;
}

export interface LoanApplicationCreate {
    borrower: BorrowerCreate;
    amount: number;
    term_months: number;
    equipment_type: string;
    equipment_age_years?: number;
    equipment_description?: string | null;
}

export interface LoanApplicationUpdate {
    amount?: number;
    term_months?: number;
    equipment_type?: string;
    equipment_age_years?: number;
    equipment_description?: string | null;
}

export interface LenderPolicy {
    id: string;
    lender_id: string;
    program_name: string;
    fico_min: number | null;
    fico_max: number | null;
    paynet_min: number | null;
    min_years_in_business: number | null;
    min_annual_revenue: number | null;
    min_amount: number | null;
    max_amount: number | null;
    min_term: number | null;
    max_term: number | null;
    max_equipment_age: number | null;
    allowed_equipment_types: string[] | null;
    allowed_states: string[] | null;
    excluded_states: string[] | null;
    excluded_industries: string[] | null;
    no_bankruptcy: boolean;
    no_open_tax_liens: boolean;
}

export interface LenderPolicyCreate {
    program_name: string;
    fico_min?: number | null;
    fico_max?: number | null;
    paynet_min?: number | null;
    min_years_in_business?: number | null;
    min_annual_revenue?: number | null;
    min_amount?: number | null;
    max_amount?: number | null;
    min_term?: number | null;
    max_term?: number | null;
    max_equipment_age?: number | null;
    allowed_equipment_types?: string[] | null;
    allowed_states?: string[] | null;
    excluded_states?: string[] | null;
    excluded_industries?: string[] | null;
    no_bankruptcy?: boolean;
    no_open_tax_liens?: boolean;
}

export interface Lender {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    policies: LenderPolicy[];
}

export interface LenderCreate {
    name: string;
    description?: string | null;
    is_active?: boolean;
}

export interface LenderUpdate {
    name?: string;
    description?: string | null;
    is_active?: boolean;
}

export interface CriteriaDetail {
    criteria: string;
    passed: boolean;
    reason: string;
    value?: string | number;
    required?: string;
}

export interface MatchResult {
    id: string;
    application_id: string;
    lender_id: string;
    policy_id: string;
    lender_name: string | null;
    eligible: boolean;
    fit_score: number;
    matched_program: string | null;
    criteria_met: CriteriaDetail[] | null;
    criteria_failed: CriteriaDetail[] | null;
    rejection_reasons: string[] | null;
}

export interface UnderwritingResponse {
    application_id: string;
    status: string;
    total_lenders: number;
    eligible_count: number;
    matches: MatchResult[];
}

// US States for dropdown
export const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

export const EQUIPMENT_TYPES = [
    'Construction',
    'Manufacturing',
    'Transportation',
    'Medical',
    'Agriculture',
    'Technology',
    'Food Service',
    'Office Equipment',
    'Other'
] as const;

export const INDUSTRIES = [
    'Construction',
    'Manufacturing',
    'Healthcare',
    'Transportation',
    'Technology',
    'Agriculture',
    'Retail',
    'Food Service',
    'Professional Services',
    'Other'
] as const;
