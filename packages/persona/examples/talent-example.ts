import { TalentProtocolService } from '../src/services/talent';
import type { TalentCredential, TalentProfile, TalentScore } from '../src/types';
import { RETRY_CONFIGS, createRetryConfig, exponentialBackoff } from '../src/utils/axiosRetry';

// Type declaration for Node.js globals (since examples aren't in tsconfig include)
declare const process: {
  env: Record<string, string | undefined>;
};

// Helper function to format dates
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Function to generate profile report
function generateProfileReport(profile: TalentProfile): void {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 TALENT PROTOCOL PROFILE REPORT');
  console.log('='.repeat(60));

  console.log('\n📊 BASIC INFORMATION');
  console.log(`Name: ${profile.name}`);
  console.log(`Display Name: ${profile.display_name}`);
  console.log(`Profile ID: ${profile.id}`);
  console.log(`Bio: ${profile.bio || 'No bio available'}`);
  console.log(`Location: ${profile.location || 'Not specified'}`);
  console.log(`ENS: ${profile.ens || 'No ENS domain'}`);

  console.log('\n🔐 VERIFICATION STATUS');
  console.log(`Human Checkmark: ${profile.human_checkmark ? '✅ Verified' : '❌ Not verified'}`);
  console.log(`Onchain Since: ${formatDate(profile.onchain_since)}`);
  console.log(`Onchain ID: ${profile.onchain_id}`);

  console.log('\n🏷️ TAGS');
  if (profile.tags && profile.tags.length > 0) {
    profile.tags.forEach(tag => console.log(`  • ${tag}`));
  } else {
    console.log('  No tags available');
  }

  if (profile.user) {
    console.log('\n👤 USER INFORMATION');
    console.log(`User ID: ${profile.user.id}`);
    console.log(`Admin: ${profile.user.admin ? 'Yes' : 'No'}`);
    console.log(`Builder Plus: ${profile.user.builder_plus ? '✅ Active' : '❌ Inactive'}`);
    console.log(`Email Confirmed: ${profile.user.email_confirmed ? 'Yes' : 'No'}`);
    console.log(`Main Wallet: ${profile.user.main_wallet}`);
    console.log(`Account Created: ${formatDate(profile.user.created_at)}`);
  } else {
    console.log('\n👤 ❌ No user information available');
  }

  console.log('\n🔄 SYNC STATUS');
  console.log(`Refreshing Socials: ${profile.refreshing_socials ? 'In progress...' : 'Complete'}`);
  console.log(`Last Socials Refresh: ${formatDate(profile.socials_refreshed_at)}`);

  if (profile.account) {
    console.log('\n🔗 CONNECTED ACCOUNT');
    console.log(`Source: ${profile.account.source}`);
    console.log(`Identifier: ${profile.account.identifier}`);
    console.log(`Username: ${profile.account.username || 'N/A'}`);
    console.log(`Connected: ${formatDate(profile.account.connected_at)}`);
    console.log(
      `Owned Since: ${profile.account.owned_since ? formatDate(profile.account.owned_since) : 'N/A'}`
    );
  }
}

// Function to generate score report
function generateScoreReport(score: TalentScore): void {
  console.log('\n' + '='.repeat(60));
  console.log('📈 TALENT SCORE REPORT');
  console.log('='.repeat(60));

  console.log(`\n🎯 TOTAL POINTS: ${score.points}`);
  console.log(`📊 Score Status: ${score.calculating_score ? '🔄 Calculating...' : '✅ Complete'}`);
  console.log(`🕒 Last Calculated: ${formatDate(score.last_calculated_at)}`);

  if (score.calculating_score_enqueued_at) {
    console.log(`⏰ Calculation Enqueued: ${formatDate(score.calculating_score_enqueued_at)}`);
  }
}

// Function to generate credentials report
function generateCredentialsReport(credentials: TalentCredential[]): void {
  console.log('\n' + '='.repeat(60));
  console.log('🏆 TALENT CREDENTIALS REPORT');
  console.log('='.repeat(60));

  const totalPoints = credentials.reduce((sum, cred) => sum + cred.points, 0);
  const maxPossiblePoints = credentials.reduce((sum, cred) => sum + cred.max_score, 0);
  const scorePercentage =
    maxPossiblePoints > 0 ? ((totalPoints / maxPossiblePoints) * 100).toFixed(1) : '0';

  console.log(`\n📊 OVERVIEW`);
  console.log(`Total Credentials: ${credentials.length}`);
  console.log(`Total Points: ${totalPoints} / ${maxPossiblePoints} (${scorePercentage}%)`);

  // Group by category
  const byCategory = credentials.reduce(
    (acc, cred) => {
      if (!acc[cred.category]) {
        acc[cred.category] = [];
      }
      acc[cred.category].push(cred);
      return acc;
    },
    {} as Record<string, TalentCredential[]>
  );

  // Sort categories by total points (descending)
  const sortedCategories = Object.entries(byCategory).sort(
    ([, a], [, b]) =>
      b.reduce((sum, cred) => sum + cred.points, 0) - a.reduce((sum, cred) => sum + cred.points, 0)
  );

  sortedCategories.forEach(([category, creds]) => {
    const categoryPoints = creds.reduce((sum, cred) => sum + cred.points, 0);
    const categoryMaxPoints = creds.reduce((sum, cred) => sum + cred.max_score, 0);

    console.log(`\n🏷️ ${category.toUpperCase()} (${categoryPoints}/${categoryMaxPoints} points)`);

    // Sort credentials within category by points (descending)
    const sortedCreds = creds.sort((a, b) => b.points - a.points);

    sortedCreds.forEach(cred => {
      const percentage =
        cred.max_score > 0 ? ((cred.points / cred.max_score) * 100).toFixed(1) : '0';
      const status = cred.calculating_score ? '🔄' : '✅';

      console.log(`  ${status} ${cred.name}`);
      console.log(`     Points: ${cred.points}/${cred.max_score} (${percentage}%)`);
      console.log(`     Source: ${cred.data_issuer_name} (${cred.account_source})`);
      console.log(`     Updated: ${formatDate(cred.updated_at)}`);

      if (cred.external_url) {
        console.log(`     🔗 ${cred.external_url}`);
      }

      console.log('');
    });
  });

  // Top performers
  const topCredentials = credentials
    .filter(cred => cred.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  if (topCredentials.length > 0) {
    console.log('\n🌟 TOP 5 CREDENTIALS');
    topCredentials.forEach((cred, index) => {
      console.log(`  ${index + 1}. ${cred.name}: ${cred.points} points`);
    });
  }
}

async function main() {
  const talentBaseUrl = process.env.TALENT_BASE_URL || 'https://api.talentprotocol.com';
  const talentApiKey = process.env.TALENT_API_KEY || 'test-api-key-for-debugging';

  if (!process.env.TALENT_API_KEY) {
    console.log('⚠️  TALENT_API_KEY environment variable not set.');
    console.log('   Using placeholder key to test error handling...');
    console.log('   To test with real data, set TALENT_API_KEY environment variable.');
    console.log('');
  }

  const apiKey = process.env.TALENT_API_KEY;

  if (!apiKey) {
    console.log('Please set TALENT_API_KEY environment variable');
    return;
  }

  // Default configuration (3 retries for 404 "Resource not found")
  const talentService = new TalentProtocolService(apiKey, talentBaseUrl);

  // Example 2: Custom retry count
  const customRetriesService = new TalentProtocolService(apiKey, talentBaseUrl, {
    maxRetries: 5, // Override to 5 retries instead of 3
  });

  // Example 3: Different retry strategy using predefined configs
  const networkErrorService = new TalentProtocolService(
    apiKey,
    talentBaseUrl,
    RETRY_CONFIGS.NETWORK_AND_SERVER_ERRORS // Retry on network/server errors instead of 404s
  );

  // Example 4: Custom retry configuration
  const customService = new TalentProtocolService(
    apiKey,
    talentBaseUrl,
    createRetryConfig(
      2, // Only 2 retries
      error => error.response?.status === 429, // Only retry on rate limiting
      exponentialBackoff // Use exponential backoff
    )
  );

  // Example 5: No retries
  const noRetryService = new TalentProtocolService(apiKey, talentBaseUrl, {
    maxRetries: 0,
  });

  const walletAddress = '0xB304EF4D8f62C94bb1428b5183063223Dff4c712';

  console.log('🚀 Starting Talent Protocol Analysis...');
  console.log(`📍 Analyzing wallet: ${walletAddress}`);

  try {
    // Test all type annotations by fetching data
    console.log('\n⏳ Fetching profile data...');
    const profile: TalentProfile = await talentService.getProfile({ id: walletAddress });

    console.log('⏳ Fetching score data...');
    const score: TalentScore = await talentService.getScore({ id: walletAddress });

    console.log('⏳ Fetching credentials data...');
    const credentials: TalentCredential[] = await talentService.getCredentials({
      id: walletAddress,
    });

    // Generate comprehensive reports
    generateProfileReport(profile);
    generateScoreReport(score);
    generateCredentialsReport(credentials);

    console.log('\n' + '='.repeat(60));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('='.repeat(60));
  } catch (error) {
    // Type-safe error handling
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

main().catch(console.error);
