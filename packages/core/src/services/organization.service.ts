import { AggregatedOrganization } from '@/models/organizations';
import slugify from 'slugify';

import { PublicDatabaseService } from './database.service';
import { WorkflowService } from './workflow.service';

export class OrganizationService {
  constructor(
    private organizationDatabaseService: PublicDatabaseService<'organizations'>,
    private adminOrganizationDatabaseService: PublicDatabaseService<'admin_organizations'>,
    private agentDatabaseService: PublicDatabaseService<'agents'>,
    private workflowService: WorkflowService
  ) {}

  async getOrganizationById(id: string): Promise<AggregatedOrganization | null> {
    const organization = await this.organizationDatabaseService.getById(id);
    if (!organization) return null;
    const workflows = await this.workflowService.getWorkflowsByOrganizationId(id);
    const agents = await this.agentDatabaseService.getAllByFields(
      {
        organization_id: id,
      },
      undefined,
      {
        field: 'created_at',
        ascending: false,
      }
    );
    return { ...organization, workflows, agents };
  }

  async getOrganizationsByAdminId(admin_id: string): Promise<AggregatedOrganization[]> {
    const aggregatedOrganizations: AggregatedOrganization[] = [];
    const organizationIds = await this.adminOrganizationDatabaseService.getManyByFields(
      'admin_id',
      [admin_id]
    );
    for (const { organization_id } of organizationIds) {
      const organization = await this.getOrganizationById(organization_id);
      if (!organization) throw new Error('No organization found');
      aggregatedOrganizations.push(organization);
    }
    return aggregatedOrganizations;
  }

  async createOrganization(
    name: string,
    description: string,
    admin_id: string,
    creatorRole: string,
    handle?: string,
    logo_url?: string | null | undefined,
    referral_source?: string
  ): Promise<AggregatedOrganization> {
    const organization = await this.organizationDatabaseService.create({
      name,
      description,
      handle: handle || slugify(name),
      logo_url,
      referral_source,
    });
    const existingAssociation = await this.adminOrganizationDatabaseService.getOneByFields({
      admin_id,
      organization_id: organization.id,
    });
    if (!existingAssociation) {
      await this.adminOrganizationDatabaseService.create({
        admin_id,
        organization_id: organization.id,
        role: creatorRole,
      });
    }
    return {
      ...organization,
      workflows: [],
      agents: [],
    };
  }
}
