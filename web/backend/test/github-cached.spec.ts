import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CachedGitHubService } from '../src/services/github-cached';

describe('CachedGitHubService LRU Optimization', () => {
	let mockFetch: ReturnType<typeof vi.fn>;
	
	beforeEach(() => {
		mockFetch = vi.fn();
		global.fetch = mockFetch;
	});

	it('should cache results and avoid redundant API calls', async () => {
		const today = new Date().toISOString().split('T')[0];
		
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					user: {
						contributionsCollection: {
							contributionCalendar: {
								weeks: [
									{
										contributionDays: [
											{ date: today, contributionCount: 5 }
										]
									}
								]
							}
						}
					}
				}
			})
		});

		const service = new CachedGitHubService('test-token', 5);
		
		// First call should hit API
		const result1 = await service.getContributionsToday('testuser');
		expect(result1).toBe(5);
		expect(mockFetch).toHaveBeenCalledTimes(1);
		
		// Second call should use cache
		const result2 = await service.getContributionsToday('testuser');
		expect(result2).toBe(5);
		expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call
	});

	it('should respect cache size limit and evict LRU entries', async () => {
		const today = new Date().toISOString().split('T')[0];
		
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					user: {
						contributionsCollection: {
							contributionCalendar: {
								weeks: [
									{
										contributionDays: [
											{ date: today, contributionCount: 5 }
										]
									}
								]
							}
						}
					}
				}
			})
		});

		// Create cache with max size of 2
		const service = new CachedGitHubService('test-token', 5, 2);
		
		// Fill cache with 2 users
		await service.getContributionsToday('user1');
		await service.getContributionsToday('user2');
		expect(mockFetch).toHaveBeenCalledTimes(2);
		
		// Access user1 again to increase its access count
		await service.getContributionsToday('user1');
		expect(mockFetch).toHaveBeenCalledTimes(2); // Should use cache
		
		// Add third user, should evict user2 (LRU)
		await service.getContributionsToday('user3');
		expect(mockFetch).toHaveBeenCalledTimes(3);
		
		// Accessing user1 should still use cache
		await service.getContributionsToday('user1');
		expect(mockFetch).toHaveBeenCalledTimes(3);
		
		// Accessing user2 should hit API again (was evicted)
		await service.getContributionsToday('user2');
		expect(mockFetch).toHaveBeenCalledTimes(4);
	});

	it('should clear expired cache entries', async () => {
		const today = new Date().toISOString().split('T')[0];
		
		// Create cache with very short TTL for testing (60ms)
		const TEST_TTL_MINUTES = 0.001; // 0.001 minutes = 60ms
		
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					user: {
						contributionsCollection: {
							contributionCalendar: {
								weeks: [
									{
										contributionDays: [
											{ date: today, contributionCount: 5 }
										]
									}
								]
							}
						}
					}
				}
			})
		});

		const service = new CachedGitHubService('test-token', TEST_TTL_MINUTES);
		
		// First call
		const result1 = await service.getContributionsToday('testuser');
		expect(result1).toBe(5);
		expect(mockFetch).toHaveBeenCalledTimes(1);
		
		// Wait for cache to expire
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Second call should hit API again
		const result2 = await service.getContributionsToday('testuser');
		expect(result2).toBe(5);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it('should clear all cache', async () => {
		const today = new Date().toISOString().split('T')[0];
		
		mockFetch.mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					user: {
						contributionsCollection: {
							contributionCalendar: {
								weeks: [
									{
										contributionDays: [
											{ date: today, contributionCount: 5 }
										]
									}
								]
							}
						}
					}
				}
			})
		});

		const service = new CachedGitHubService('test-token', 5);
		
		// First call
		await service.getContributionsToday('testuser');
		expect(mockFetch).toHaveBeenCalledTimes(1);
		
		// Clear cache
		service.clearCache();
		
		// Second call should hit API again
		await service.getContributionsToday('testuser');
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});
});
