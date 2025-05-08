import { AggregatedOrganization } from '@/models/organizations';
import { PublicDatabaseService } from './database.service';
import { WorkflowService } from './workflow.service';

export class OrganizationService {
  constructor(
    private organizationDatabaseService: PublicDatabaseService<'organizations'>,
    private workflowService: WorkflowService
  ) {}

  async getOrganizationsByUserId(userId: string): Promise<AggregatedOrganization[]> {
    const aggregatedOrganizations: AggregatedOrganization[] = [];
    const organizations = await this.organizationDatabaseService.getAllByField('user_id', userId);
    for (const organization of organizations) {
      const workflows = await this.workflowService.getWorkflowsByOrganizationId(organization.id);
      aggregatedOrganizations.push({ ...organization, workflows });
    }
    return aggregatedOrganizations;
  }
}
