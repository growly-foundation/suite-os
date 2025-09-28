import { minute } from '@getgrowly/core';

export const USER_LAST_MESSAGE_CACHE_TIME = minute(3);

// Dashboard data cache times
export const DASHBOARD_AGENTS_CACHE_TIME = minute(5);
export const DASHBOARD_USERS_CACHE_TIME = minute(3);
export const DASHBOARD_WORKFLOWS_CACHE_TIME = minute(10);
export const DASHBOARD_MESSAGES_CACHE_TIME = minute(2);

export const GET_FUNGIBLE_POSITIONS_CACHE_TIME = minute(5);
export const GET_FUNGIBLE_POSITIONS_GC_TIME = minute(5);
export const GET_NFT_POSITIONS_CACHE_TIME = minute(5);
export const GET_NFT_POSITIONS_GC_TIME = minute(5);
export const GET_TRANSACTIONS_CACHE_TIME = minute(2);
export const GET_TRANSACTIONS_GC_TIME = minute(2);
export const GET_ACTIVITY_CACHE_TIME = minute(2);
export const GET_ACTIVITY_GC_TIME = minute(2);
export const GET_FUNDED_INFO_CACHE_TIME = minute(5);
export const GET_FUNDED_INFO_GC_TIME = minute(5);
export const GET_PERSONA_ANALYSIS_CACHE_TIME = minute(5);
export const GET_PERSONA_ANALYSIS_GC_TIME = minute(5);
