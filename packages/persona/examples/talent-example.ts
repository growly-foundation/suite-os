import { TalentProtocolService } from '../src/services/talent';

async function main() {
  const talentApiKey = process.env.TALENT_API_KEY;
  if (!talentApiKey) {
    throw new Error('TALENT_API_KEY is not set');
  }
  const talentService = new TalentProtocolService(talentApiKey);
  const walletAddress = '0x87CA55485C2cbc6C3fe4fc152b624569467872B0';

  try {
    const credentials = await talentService.getCredentials({ id: walletAddress });
    console.log(credentials);

    // Fetch user profile
    // const profile = await talentService.getProfile({ id: walletAddress });
    // console.log(profile);

    // Fetch user score
    const score = await talentService.getScore({ id: walletAddress });
    console.log(score);
  } catch (error) {
    console.error(error);
  }
}

main().catch(console.error);
