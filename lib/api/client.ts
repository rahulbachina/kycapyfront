import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { components } from './types'; // Generated types

// Export schema types for convenience
export type Case = components['schemas']['CaseDetail'];
export type CaseListItem = components['schemas']['CaseListItem'];
export type CaseCreate = components['schemas']['CaseCreate'];
export type PASClientProcess = components['schemas']['PASClientProcess'];
export type CasesListResponse = components['schemas']['CasesListResponse'];
export type Attachment = components['schemas']['Attachment'];

// Create Axios
// Use /api routes which act as proxy to backend
// These are Next.js API routes that forward to the backend API
const baseURL = '/api';

const client: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors (e.g., global toast notifications, logging)
    console.error('API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

import { MOCK_CASES, MOCK_CASE_DETAILS } from '../mock-data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  cases: {
    list: async (params?: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      view?: string;
      search?: string;
      case_status?: string;
      businessUnit?: string;
      assignedUser?: string;
    }): Promise<CasesListResponse> => {
      if (USE_MOCK) {
        await mockDelay(500);
        console.log('[MOCK] Fetching cases with params:', params);
        let filtered = [...MOCK_CASES];

        if (params?.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(c => c.entityName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
        }
        if (params?.case_status) {
          filtered = filtered.filter(c => c.status === params.case_status);
        }
        if (params?.businessUnit) {
          // Simple partial match for mock
          filtered = filtered.filter(c => c.businessUnit.includes(params.businessUnit!));
        }

        return {
          content: filtered,
          totalElements: filtered.length,
          size: params?.pageSize || 25,
          number: 0,
          numberOfElements: filtered.length,
          first: true,
          empty: filtered.length === 0,
          // Cast to any to include extra fields if UI expects them, or just strictly validation
          // The API spec seems to only define specific fields, but UI pagination might rely on others?
          // We stick to what we know is required logic in the UI
        } as any;
      }
      const response = await client.get<CasesListResponse>('/cases', { params });

      // Debug log to see actual API response
      console.log('[API] Raw response:', response.data);

      // Map _id to id if present, to ensure frontend compatibility
      // Also filter out invalid test data
      if (response.data && Array.isArray(response.data.content)) {
        response.data.content = response.data.content
          .filter((item: any) => {
            // Filter out items with placeholder/invalid data
            const hasValidEntityName = item.entityName &&
              item.entityName.toLowerCase() !== 'string' &&
              item.entityName !== 'String';

            const hasValidBusinessUnit = item.businessUnit &&
              item.businessUnit.toLowerCase() !== 'string' &&
              item.businessUnit !== 'String';

            return hasValidEntityName && hasValidBusinessUnit;
          })
          .map((item: any) => {
            console.log('[API] Processing valid item:', item);
            return {
              ...item,
              id: item.id || item._id, // Ensure id exists
            };
          });

        // Update totalElements to reflect filtered count
        response.data.totalElements = response.data.content.length;
      }

      console.log('[API] Processed response:', response.data);
      return response.data;
    },
    create: async (data: CaseCreate): Promise<any> => {
      const response = await client.post('/cases', data);
      return response.data;
    },
    get: async (id: string): Promise<Case> => {
      const response = await client.get<Case>(`/cases/${id}`);
      const data = response.data as any;
      if (data && !data.id && data._id) {
        data.id = data._id;
      }
      return data;
    },
    update: async (id: string, data: CaseCreate): Promise<any> => {
      if (USE_MOCK) {
        await mockDelay(600);
        console.log('[MOCK] Updating case:', id, data);
        if (MOCK_CASE_DETAILS[id]) {
          MOCK_CASE_DETAILS[id] = { ...MOCK_CASE_DETAILS[id], ...data, automationResults: data.automationResults as any };
          // Also update list item if needed
          const listIdx = MOCK_CASES.findIndex(c => c.id === id);
          if (listIdx >= 0) {
            MOCK_CASES[listIdx] = { ...MOCK_CASES[listIdx], ...data, lastUpdated: new Date().toISOString() } as any;
          }
        }
        return { id, ...data };
      }
      const response = await client.put(`/cases/${id}`, data);
      return response.data;
    },
    delete: async (id: string): Promise<any> => {
      if (USE_MOCK) {
        await mockDelay(400);
        console.log('[MOCK] Deleting case:', id);
        delete MOCK_CASE_DETAILS[id];
        const idx = MOCK_CASES.findIndex(c => c.id === id);
        if (idx >= 0) MOCK_CASES.splice(idx, 1);
        return { success: true };
      }
      const response = await client.delete(`/cases/${id}`);
      return response.data;
    },
    convertToPas: async (id: string, sentToRpaBy?: string): Promise<PASClientProcess> => {
      if (USE_MOCK) {
        await mockDelay(1000);
        return { processId: 'pas-123', status: 'Queued' } as any;
      }
      const response = await client.post(`/cases/${id}/convert-to-pas`, null, {
        params: { sentToRpaBy },
      });
      return response.data;
    },
    sendToPas: async (id: string, options?: { sentToRpaBy?: string; priority?: string; referencePrefix?: string }): Promise<any> => {
      if (USE_MOCK) {
        await mockDelay(1000);
        return { success: true, message: 'Case sent to PAS queue' };
      }
      const response = await client.post(`/cases/${id}/send-to-pas`, null, {
        params: options,
      });
      return response.data;
    },
  },
};

export default api;
