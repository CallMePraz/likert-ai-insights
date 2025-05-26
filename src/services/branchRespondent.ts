import axios from 'axios';

export interface BranchRespondent {
  branch: string;
  total_surveys: number;
}

export interface BranchRespondentApiResponse {
  data: BranchRespondent[];
  total: number;
}

export interface BranchRespondentParams {
  limit?: number;
  offset?: number;
  sort?: 'branch' | 'total_surveys';
  order?: 'asc' | 'desc';
  search?: string;
  dateFilter?: string;
  from?: string;
  to?: string;
}

export async function getBranchRespondentsPaginated(params: BranchRespondentParams = {}): Promise<BranchRespondentApiResponse> {
  const res = await axios.get('/api/branch-respondent', { params });
  return res.data as BranchRespondentApiResponse;
}
