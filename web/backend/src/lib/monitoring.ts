/**
 * Monitoring and observability utilities for Cloudflare Workers
 */

import { Context } from 'hono';
import { Env } from '../types/env';

interface MetricData {
	metric: string;
	value: number;
	timestamp: number;
	labels?: Record<string, string>;
}

export class WorkerMonitoring {
	private startTime: number;
	private env: Env;
	private context: Context;

	constructor(env: Env, context: Context) {
		this.env = env;
		this.context = context;
		this.startTime = Date.now();
	}

	/**
	 * Track custom metrics
	 */
	trackMetric(metric: string, value: number, labels?: Record<string, string>) {
		const data: MetricData = {
			metric,
			value,
			timestamp: Date.now(),
			labels,
		};

		// Log to console for debugging
		console.log('[Metrics]', JSON.stringify(data));

		// Write to Analytics Engine for SQL querying
		try {
			const blobs = [metric]; // metric name
			const doubles = [value, Date.now()]; // value + timestamp
			const indexes = labels ? Object.keys(labels).map((k) => `${k}:${labels[k]}`) : []; // labels as indexes

			this.env.ANALYTICS.writeDataPoint({
				blobs,
				doubles,
				indexes,
			});
		} catch (error) {
			console.error('[Metrics] Failed to write to Analytics Engine:', error);
		}
	}

	/**
	 * Track API request
	 */
	trackApiRequest(endpoint: string, method: string, statusCode: number) {
		const duration = Date.now() - this.startTime;

		this.trackMetric('api_request', 1, {
			endpoint,
			method,
			status: statusCode.toString(),
			duration: duration.toString(),
		});
	}

	/**
	 * Track database query
	 */
	trackDbQuery(operation: string, table: string, duration: number) {
		this.trackMetric('db_query', 1, {
			operation,
			table,
			duration: duration.toString(),
		});
	}

	/**
	 * Track notification sent
	 */
	trackNotification(channel: 'discord' | 'telegram', success: boolean, userId: string) {
		this.trackMetric('notification_sent', 1, {
			channel,
			success: success.toString(),
			userId,
		});
	}

	/**
	 * Track authentication
	 */
	trackAuth(authType: 'jwt' | 'server-secret', success: boolean) {
		this.trackMetric('auth_attempt', 1, {
			authType,
			success: success.toString(),
		});
	}

	/**
	 * Track rate limit hit
	 */
	trackRateLimit(endpoint: string, ip: string) {
		this.trackMetric('rate_limit_hit', 1, {
			endpoint,
			ip: ip.substring(0, 10), // Partial IP for privacy
		});
	}

	/**
	 * Track error
	 */
	trackError(errorType: string, errorMessage: string, endpoint?: string) {
		this.trackMetric('error', 1, {
			errorType,
			errorMessage: errorMessage.substring(0, 100),
			endpoint: endpoint || 'unknown',
		});
	}

	/**
	 * Track cron job execution
	 */
	trackCronJob(success: boolean, usersChecked: number, notificationsSent: number) {
		this.trackMetric('cron_execution', 1, {
			success: success.toString(),
			usersChecked: usersChecked.toString(),
			notificationsSent: notificationsSent.toString(),
		});
	}

	/**
	 * Get execution duration
	 */
	getDuration(): number {
		return Date.now() - this.startTime;
	}
}

/**
 * Performance monitoring middleware
 */
export async function performanceMiddleware(c: Context, next: any) {
	const startTime = Date.now();
	const path = c.req.path;
	const method = c.req.method;

	await next();

	const duration = Date.now() - startTime;
	const status = c.res.status;

	// Log performance metrics
	console.log('[Performance]', {
		path,
		method,
		status,
		duration,
		timestamp: new Date().toISOString(),
	});

	// Alert if slow request (>3s)
	if (duration > 3000) {
		console.warn('[Performance] Slow request detected:', {
			path,
			duration,
		});
	}
}
