import { AggregatedOrganization } from '@/models/organizations';
import { PublicDatabaseService } from './database.service';
import { WorkflowService } from './workflow.service';

export class OrganizationService {
  constructor(
    private organizationDatabaseService: PublicDatabaseService<'organizations'>,
    private workflowService: WorkflowService
  ) {}

  async getOrganizationsByAdminId(admin_id: string): Promise<AggregatedOrganization[]> {
    const aggregatedOrganizations: AggregatedOrganization[] = [];
    const organizations = await this.organizationDatabaseService.getAllByFields({
      admin_id,
    });
    for (const organization of organizations) {
      const workflows = await this.workflowService.getWorkflowsByOrganizationId(organization.id);
      aggregatedOrganizations.push({ ...organization, workflows });
    }
    return aggregatedOrganizations;
  }
}
