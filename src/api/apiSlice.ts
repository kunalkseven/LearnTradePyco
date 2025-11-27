import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Trade, AIAnalysisResponse, DecisionGraph, SimilarTradeResult, AuthResponse } from '../types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Trade', 'User'],
  endpoints: (builder) => ({
    getTrades: builder.query<Trade[], void>({
      query: () => '/trades',
      providesTags: ['Trade'],
    }),
    getTrade: builder.query<Trade, string>({
      query: (id) => `/trades/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Trade', id }],
    }),
    createTrade: builder.mutation<Trade, Partial<Trade>>({
      query: (trade) => ({
        url: '/trades',
        method: 'POST',
        body: trade,
      }),
      invalidatesTags: ['Trade'],
    }),
    bulkCreateTrades: builder.mutation<{ success: boolean; count: number; trades: Trade[] }, { trades: Partial<Trade>[] }>({
      query: (body) => ({
        url: '/trades/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Trade'],
    }),
    updateTrade: builder.mutation<Trade, { id: string; updates: Partial<Trade> }>({
      query: ({ id, updates }) => ({
        url: `/trades/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Trade', id }],
    }),
    addJournal: builder.mutation<Trade, { id: string; journal: string }>({
      query: ({ id, journal }) => ({
        url: `/trades/${id}/journal`,
        method: 'POST',
        body: { journal },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Trade', id }],
    }),
    uploadImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
    }),
    analyzeWithAI: builder.mutation<AIAnalysisResponse, { userId: string; tradeIds?: string[]; trades?: Trade[] }>({
      query: (body) => ({
        url: '/ai/analyze',
        method: 'POST',
        body,
      }),
    }),
    parseDecisionGraph: builder.mutation<DecisionGraph, { tradeId: string; journalText: string }>({
      query: (body) => ({
        url: '/ai/parse',
        method: 'POST',
        body,
      }),
    }),
    getSimilarTrades: builder.query<SimilarTradeResult[], string>({
      query: (id) => `/trades/${id}/similar`,
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<AuthResponse, { email: string; password: string; name: string }>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, { email: string; token: string; password: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetTradesQuery,
  useGetTradeQuery,
  useCreateTradeMutation,
  useBulkCreateTradesMutation,
  useUpdateTradeMutation,
  useAddJournalMutation,
  useUploadImageMutation,
  useAnalyzeWithAIMutation,
  useParseDecisionGraphMutation,
  useGetSimilarTradesQuery,
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = apiSlice

