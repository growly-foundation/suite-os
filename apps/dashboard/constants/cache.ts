import { minute } from '@getgrowly/core';

export const USER_LAST_MESSAGE_CACHE_TIME = minute(3);

// Dashboard data cache times
export const DASHBOARD_AGENTS_CACHE_TIME = minute(5);
export const DASHBOARD_USERS_CACHE_TIME = minute(3);
export const DASHBOARD_WORKFLOWS_CACHE_TIME = minute(10);
export const DASHBOARD_MESSAGES_CACHE_TIME = minute(2);
