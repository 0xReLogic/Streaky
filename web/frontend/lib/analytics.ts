/**
 * Analytics utility for tracking custom events
 */

import { track } from '@vercel/analytics';

export const analytics = {
  // User events
  trackSignUp: () => {
    track('user_signup', { timestamp: new Date().toISOString() });
  },

  trackLogin: () => {
    track('user_login', { timestamp: new Date().toISOString() });
  },

  trackLogout: () => {
    track('user_logout', { timestamp: new Date().toISOString() });
  },

  // Setup events
  trackSetupComplete: (channels: string[]) => {
    track('setup_complete', {
      channels: channels.join(','),
      channelCount: channels.length,
      timestamp: new Date().toISOString(),
    });
  },

  trackChannelAdded: (channel: 'discord' | 'telegram') => {
    track('channel_added', {
      channel,
      timestamp: new Date().toISOString(),
    });
  },

  // Dashboard events
  trackDashboardView: (streakDays: number) => {
    track('dashboard_view', {
      streakDays,
      timestamp: new Date().toISOString(),
    });
  },

  // Error events
  trackError: (errorType: string, errorMessage: string) => {
    track('error_occurred', {
      errorType,
      errorMessage: errorMessage.substring(0, 100), // Limit message length
      timestamp: new Date().toISOString(),
    });
  },

  // API events
  trackApiCall: (endpoint: string, success: boolean, duration?: number) => {
    track('api_call', {
      endpoint,
      success: success.toString(),
      ...(duration !== undefined && { duration: duration.toString() }),
      timestamp: new Date().toISOString(),
    });
  },
};
