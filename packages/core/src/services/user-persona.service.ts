import { ImportedUserSourceData } from '@/models/user_importers';
import { ParsedUserPersona, UserPersona, UserPersonaStatus } from '@/models/user_personas';
import { day, isStale } from '@/utils/cache';

import { PublicDatabaseService } from './database.service';

export class UserPersonaService {
  constructor(
    private userDatabaseService: PublicDatabaseService<'users'>,
    private userPersonaDatabaseService: PublicDatabaseService<'user_personas'>
  ) {}

  /**
   * Sync missing personas - create default records for users without personas
   */
  async syncMissing(): Promise<{ created: number; errors: string[] }> {
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
      return { created, errors };
    } catch (error) {
      errors.push(`Sync failed: ${error}`);
      return { created, errors };
    }
  }

  /**
   * Get persona by id (walletAddress)
   */
  async getOneByAddress(walletAddress: string): Promise<ParsedUserPersona | null> {
    return (await this.userPersonaDatabaseService.getById(
      walletAddress
    )) as any as ParsedUserPersona;
  }

  /**
   * Get pending and failed personas for processing
   */
  async getAllPending(): Promise<ParsedUserPersona[]> {
    const personas = await this.userPersonaDatabaseService.getAll();
    return personas.filter(
      p =>
        p.sync_status === 'pending' ||
        p.sync_status === 'failed' ||
        (p.sync_status === 'completed' && isStale(p.updated_at, day(7)))
    ) as any as ParsedUserPersona[];
  }

  /**
   * Get completed personas for rebuilding
   */
  async getAllCompleted(): Promise<ParsedUserPersona[]> {
    const personas = await this.userPersonaDatabaseService.getAll();
    return personas.filter(p => p.sync_status === 'completed') as any as ParsedUserPersona[];
  }

  /**
   * Update persona sync status
   */
  async updateStatus(walletAddress: string, status: UserPersonaStatus): Promise<ParsedUserPersona> {
    const persona = await this.userPersonaDatabaseService.getById(walletAddress);
    if (persona) {
      return (await this.userPersonaDatabaseService.update(walletAddress, {
        sync_status: status,
        updated_at: new Date().toISOString(),
      })) as any as ParsedUserPersona;
    } else {
      throw new Error(`Persona not found for wallet: ${walletAddress}`);
    }
  }

  /**
   * Update persona with built data
   */
  async update(
    walletAddress: string,
    personaData: {
      identities: any;
      activities: any;
      portfolio_snapshots: any;
    }
  ): Promise<UserPersona> {
    const persona = await this.userPersonaDatabaseService.getById(walletAddress);
    if (persona) {
      return this.userPersonaDatabaseService.update(walletAddress, {
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
  async getAllByStatus(status: UserPersonaStatus): Promise<ParsedUserPersona[]> {
    const personas = await this.userPersonaDatabaseService.getAllByFields({ sync_status: status });
    return personas as any as ParsedUserPersona[];
  }

  /**
   * Create a new persona record
   */
  async create(personaData: {
    walletAddress: string;
    identities?: any;
    activities?: any;
    portfolio_snapshots?: any;
    sync_status?: UserPersonaStatus;
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
  async delete(walletAddress: string): Promise<void> {
    await this.userPersonaDatabaseService.delete(walletAddress);
  }

  /**
   * Update the imported source data for a persona. If the source data already exists, update it.
   * If it doesn't exist, add it.
   * @param walletAddress - The wallet address of the user
   * @param importedSourceData - The source data of the user
   * @returns The updated persona
   */
  async updateImportedSourceData(
    walletAddress: string,
    importedSourceData: ImportedUserSourceData
  ): Promise<ParsedUserPersona> {
    const persona = await this.userPersonaDatabaseService.getById(walletAddress);
    if (!persona) {
      throw new Error(`Persona not found for wallet: ${walletAddress}`);
    }
    let existingImportedSourceData = persona.imported_source_data as ImportedUserSourceData[];
    // If the source data doesn't exist, add it.
    if (
      existingImportedSourceData.length === 0 ||
      !existingImportedSourceData.some(data => data.source === importedSourceData.source)
    ) {
      existingImportedSourceData.push(importedSourceData);
    } else {
      // If the source data exists, update it.
      existingImportedSourceData = existingImportedSourceData.map(data =>
        data.source === importedSourceData.source ? importedSourceData : data
      );
    }
    return (await this.userPersonaDatabaseService.update(walletAddress, {
      imported_source_data: existingImportedSourceData.map(d => JSON.stringify(d)),
    })) as any as ParsedUserPersona;
  }
}
