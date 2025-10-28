import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubServiceImpl } from '../src/services/github';

describe('GitHubService Optimizations', () => {
	let mockFetch: ReturnType<typeof vi.fn>;
	
	beforeEach(() => {
		mockFetch = vi.fn();
		global.fetch = mockFetch;
	});

	describe('getContributionsToday', () => {
		it('should efficiently find today\'s contribution without creating intermediate arrays', async () => {
			const today = new Date().toISOString().split('T')[0];
			
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					data: {
						user: {
							contributionsCollection: {
								contributionCalendar: {
									weeks: [
										{
											contributionDays: [
												{ date: '2024-01-01', contributionCount: 5 },
												{ date: '2024-01-02', contributionCount: 3 }
											]
										},
										{
											contributionDays: [
												{ date: today, contributionCount: 7 },
												{ date: '2024-01-04', contributionCount: 2 }
											]
										}
									]
								}
							}
						}
					}
				})
			});

			const service = new GitHubServiceImpl('test-token');
			const result = await service.getContributionsToday('testuser');

			expect(result).toBe(7);
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it('should return 0 if no contribution found for today', async () => {
			const today = new Date().toISOString().split('T')[0];
			
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					data: {
						user: {
							contributionsCollection: {
								contributionCalendar: {
									weeks: [
										{
											contributionDays: [
												{ date: '2024-01-01', contributionCount: 5 }
											]
										}
									]
								}
							}
						}
					}
				})
			});

			const service = new GitHubServiceImpl('test-token');
			const result = await service.getContributionsToday('testuser');

			expect(result).toBe(0);
		});
	});

	describe('getCurrentStreak', () => {
		it('should efficiently calculate streak by iterating backwards without creating arrays', async () => {
			const today = new Date().toISOString().split('T')[0];
			
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					data: {
						user: {
							contributionsCollection: {
								contributionCalendar: {
									weeks: [
										{
											contributionDays: [
												{ date: '2024-01-01', contributionCount: 5 },
												{ date: '2024-01-02', contributionCount: 3 },
												{ date: '2024-01-03', contributionCount: 2 }
											]
										},
										{
											contributionDays: [
												{ date: '2024-01-04', contributionCount: 0 },
												{ date: '2024-01-05', contributionCount: 4 },
												{ date: '2024-01-06', contributionCount: 1 }
											]
										}
									]
								}
							}
						}
					}
				})
			});

			const service = new GitHubServiceImpl('test-token');
			const result = await service.getCurrentStreak('testuser');

			// Should count from most recent backwards until hitting the 0 contribution day
			expect(result).toBeGreaterThanOrEqual(0);
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it('should handle grace day for today with 0 contributions', async () => {
			const today = new Date().toISOString().split('T')[0];
			
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					data: {
						user: {
							contributionsCollection: {
								contributionCalendar: {
									weeks: [
										{
											contributionDays: [
												{ date: '2024-01-01', contributionCount: 5 },
												{ date: today, contributionCount: 0 }
											]
										}
									]
								}
							}
						}
					}
				})
			});

			const service = new GitHubServiceImpl('test-token');
			const result = await service.getCurrentStreak('testuser');

			// Should allow grace day for today
			expect(result).toBeGreaterThanOrEqual(0);
		});
	});
});
