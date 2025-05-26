import axios from 'axios';

const API_BASE_URL = 'http://10.233.112.221:3001/api';

export interface BranchRespondentTeller {
  date: string;
  branch: string;
  teller_id: string;
  teller_id_count: number;
}

export const getBranchRespondentTeller = async (
  branch: string,
  startDate?: string,
  endDate?: string
): Promise<BranchRespondentTeller[]> => {
  const params: any = { branch };
  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  const response = await axios.get(`${API_BASE_URL}/branchrespondent_teller`, {
    params
  });
  return response.data;
};
