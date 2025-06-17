import { ParsedUserPersona } from '@/models/user_personas';

import { PublicDatabaseService } from './database.service';

export class UserPersonaService {
  constructor(
    private userDatabaseService: PublicDatabaseService<'users'>,
    private userPersonaDatabaseService: PublicDatabaseService<'user_personas'>
  ) {}

  /**
   * Sync missing personas - create default records for users without personas
   */
  async syncMissingPersonas(): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    try {
      // Get all users
      const users = await this.userDatabaseService.getAll();

      // Get all existing personas
      const existingPersonas = await this.userPersonaDatabaseService.getAll();
      const existingWallets = new Set(existingPersonas.map(p => p.id));

      // Find missing personas
      const missingUsers = users.filter(user => {
        const walletAddress = (user.entities as { walletAddress: string }).walletAddress;
        return walletAddress && !existingWallets.has(walletAddress);
      });

      console.log(`Found ${missingUsers.length} users without personas`);

      // Create missing personas
      for (const user of missingUsers) {
        try {
          const walletAddress = (user.entities as { walletAddress: string }).walletAddress;
          await this.userPersonaDatabaseService.create({
            id: walletAddress,
            identities: {},
            activities: {},
            portfolio_snapshots: {},
            sync_status: 'pending',
          });
          created++;
        } catch (error) {
          const walletAddress = (user.entities as { walletAddress: string }).walletAddress;
          errors.push(`Failed to create persona for ${walletAddress}: ${error}`);
        }
      }

      console.log(`Sync completed. Created: ${created}, Errors: ${errors.length}`);
      return { created, errors };
    } catch (error) {
      errors.push(`Sync failed: ${error}`);
      return { created, errors };
    }
  }

  /**
   * Get persona by id (walletAddress)
   */
  async getPersona(walletAddress: string): Promise<ParsedUserPersona | null> {
    return (await this.userPersonaDatabaseService.getById(walletAddress)) as ParsedUserPersona;
  }

  /**
   * Get pending and failed personas for processing
   */
  async getPendingPersonas(): Promise<ParsedUserPersona[]> {
    const personas = await this.userPersonaDatabaseService.getAll();
    return personas.filter(
      p => p.sync_status === 'pending' || p.sync_status === 'failed'
    ) as ParsedUserPersona[];
  }

  /**
   * Get completed personas for rebuilding
   */
  async getCompletedPersonas(): Promise<ParsedUserPersona[]> {
    const personas = await this.userPersonaDatabaseService.getAll();
    return personas.filter(p => p.sync_status === 'completed') as ParsedUserPersona[];
  }

  /**
   * Update persona sync status
   */
  async updatePersonaStatus(
    walletAddress: string,
    status: 'pending' | 'running' | 'completed' | 'failed'
  ): Promise<void> {
    const persona = await this.userPersonaDatabaseService.getById(walletAddress);
    if (persona) {
      await this.userPersonaDatabaseService.update(walletAddress, {
        sync_status: status,
        updated_at: new Date().toISOString(),
      });
    } else {
      throw new Error(`Persona not found for wallet: ${walletAddress}`);
    }
  }

  /**
   * Update persona with built data
   */
  async updatePersonaData(
    walletAddress: string,
    personaData: {
      identities: any;
      activities: any;
      portfolio_snapshots: any;
    }
  ): Promise<void> {
    const persona = await this.userPersonaDatabaseService.getById(walletAddress);
    if (persona) {
      await this.userPersonaDatabaseService.update(walletAddress, {
        identities: personaData.identities,
        activities: personaData.activities,
        portfolio_snapshots: personaData.portfolio_snapshots,
        sync_status: 'completed',
        updated_at: new Date().toISOString(),
      });
    } else {
      throw new Error(`Persona not found for wallet: ${walletAddress}`);
    }
  }

  /**
   * Get personas by status
   */
  async getPersonasByStatus(
    status: 'pending' | 'running' | 'completed' | 'failed'
  ): Promise<ParsedUserPersona[]> {
    const personas = await this.userPersonaDatabaseService.getAllByFields({ sync_status: status });
    return personas as ParsedUserPersona[];
  }

  /**
   * Create a new persona record
   */
  async createPersona(personaData: {
    walletAddress: string;
    identities?: any;
    activities?: any;
    portfolio_snapshots?: any;
    sync_status?: 'pending' | 'running' | 'completed' | 'failed';
  }): Promise<void> {
    await this.userPersonaDatabaseService.create({
      id: personaData.walletAddress,
      identities: personaData.identities || {},
      activities: personaData.activities || {},
      portfolio_snapshots: personaData.portfolio_snapshots || {},
      sync_status: personaData.sync_status || 'pending',
    });
  }

  /**
   * Delete a persona record
   */
  async deletePersona(walletAddress: string): Promise<void> {
    await this.userPersonaDatabaseService.delete(walletAddress);
  }
}
