/**
 * Queue Processor - Direct Batch Processing
 * Processes entire batch without HTTP self-fetch
 * Designed to be called directly from scheduled() handler
 */

import { Env } from '../types/env';
import { getNextPendingUser, markProcessing, markCompleted, markFailed } from '../services/queue';
import { processSingleUser } from './process-single-user';

/**
 * Process all pending users in batch
 * Called directly from scheduled() handler via ctx.waitUntil()
 */
export async function processQueueBatch(env: Env, batchId: string): Promise<void> {
	console.log(`[QueueProcessor] Starting batch ${batchId}`);
	
	let processed = 0;
	let failed = 0;

	// Process all pending users
	while (true) {
		// Get next pending user
		const queueItem = await getNextPendingUser(env);
		
		if (!queueItem) {
			// Queue is empty, we're done
			console.log(`[QueueProcessor] Batch complete: ${processed} processed, ${failed} failed`);
			break;
		}

		// Mark as processing
		await markProcessing(env, queueItem.id);

		try {
			// Process this user
			await processSingleUser(env, queueItem.user_id);
			
			// Mark as completed
			await markCompleted(env, queueItem.id);
			processed++;
			
			console.log(`[QueueProcessor] User ${queueItem.user_id} completed (${processed}/${processed + failed})`);
		} catch (error) {
			// Mark as failed
			const errorMsg = error instanceof Error ? error.message : 'Unknown error';
			await markFailed(env, queueItem.id, errorMsg);
			failed++;
			
			console.error(`[QueueProcessor] User ${queueItem.user_id} failed:`, errorMsg);
		}

		// Small delay to avoid hammering D1 (optional)
		await new Promise(resolve => setTimeout(resolve, 100));
	}
}
