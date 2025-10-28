/**
 * GitHub Service
 * Handles fetching contribution data from GitHub GraphQL API
 */

export interface GitHubContribution {
  date: string;
  count: number;
}

export interface GitHubService {
  getContributionsToday(username: string): Promise<number>;
  getCurrentStreak(username: string): Promise<number>;
}

export class GitHubServiceImpl implements GitHubService {
  private readonly graphqlEndpoint = 'https://api.github.com/graphql';
  private readonly restEndpoint = 'https://api.github.com';
  private readonly githubToken?: string;

  constructor(githubToken?: string) {
    this.githubToken = githubToken;
  }

  /**
   * Get contribution count for today
   * @param username - GitHub username
   * @returns Number of contributions made today
   */
  async getContributionsToday(username: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      username,
      from: `${today}T00:00:00Z`,
      to: `${today}T23:59:59Z`,
    };

    try {
      const response = await this.makeGraphQLRequest(query, variables);
      
      if (!response.data?.user) {
        throw new Error(`User ${username} not found`);
      }

      const weeks = response.data.user.contributionsCollection.contributionCalendar.weeks;
      
      // Optimize: Avoid flatMap and find by iterating directly to reduce memory allocations
      for (const week of weeks) {
        for (const day of week.contributionDays) {
          if (day.date === today) {
            return day.contributionCount || 0;
          }
        }
      }

      return 0;
    } catch (error) {
      if (this.isRateLimitError(error)) {
        throw new Error('GitHub API rate limit exceeded');
      }
      throw error;
    }
  }

  /**
   * Get current streak count
   * @param username - GitHub username
   * @returns Number of consecutive days with contributions
   */
  async getCurrentStreak(username: string): Promise<number> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const variables = { username };

    try {
      const response = await this.makeGraphQLRequest(query, variables);
      
      if (!response.data?.user) {
        throw new Error(`User ${username} not found`);
      }

      const weeks = response.data.user.contributionsCollection.contributionCalendar.weeks;
      
      // Optimize: Iterate backwards without creating intermediate arrays
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      
      // Iterate weeks in reverse order
      for (let i = weeks.length - 1; i >= 0; i--) {
        const week = weeks[i];
        const days = week.contributionDays;
        
        // Iterate days in reverse order within the week
        for (let j = days.length - 1; j >= 0; j--) {
          const day = days[j];
          
          // Skip future dates
          if (day.date > today) continue;
          
          // If we hit a day with no contributions, streak ends
          if (day.contributionCount === 0) {
            // Allow one grace day (today) if it's still early
            if (day.date === today) {
              continue;
            }
            return streak;
          }
          
          streak++;
        }
      }

      return streak;
    } catch (error) {
      if (this.isRateLimitError(error)) {
        throw new Error('GitHub API rate limit exceeded');
      }
      throw error;
    }
  }

  /**
   * Make GraphQL request to GitHub API
   */
  private async makeGraphQLRequest(query: string, variables: any): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Streaky-App',
    };

    // Add authorization if token is available
    if (this.githubToken) {
      headers['Authorization'] = `Bearer ${this.githubToken}`;
    }

    const response = await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data;
  }

  /**
   * Check if error is rate limit error
   */
  private isRateLimitError(error: any): boolean {
    const errorMessage = error?.message || '';
    return (
      errorMessage.includes('rate limit') ||
      errorMessage.includes('403') ||
      errorMessage.includes('API rate limit exceeded')
    );
  }
}

/**
 * Create GitHub service instance
 * @param githubToken - Optional GitHub personal access token for higher rate limits
 */
export function createGitHubService(githubToken?: string): GitHubService {
  return new GitHubServiceImpl(githubToken);
}
