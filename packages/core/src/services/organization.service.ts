import { AggregatedOrganization } from '@/models/organizations';
import { PublicDatabaseService } from './database.service';
import { WorkflowService } from './workflow.service';
import { FunctionService } from './function.service';

export class OrganizationService {
  constructor(
    private organizationDatabaseService: PublicDatabaseService<'organizations'>,
    private agentDatabaseService: PublicDatabaseService<'agents'>,
    private workflowService: WorkflowService,
    private functionService: FunctionService
  ) {}

  async getOrganizationsByAdminId(admin_id: string): Promise<AggregatedOrganization[]> {
    const aggregatedOrganizations: AggregatedOrganization[] = [];
    const organizationIds = await this.functionService.invoke('get_admin_organizations', {
      p_admin_id: admin_id,
    });
    for (const { organization_id } of organizationIds) {
      const organization = await this.organizationDatabaseService.getById(organization_id);
      if (!organization) throw new Error('No organization found');
      const workflows = await this.workflowService.getWorkflowsByOrganizationId(organization_id);
      const agents = await this.agentDatabaseService.getAllByFields({
        organization_id: organization.id,
      });
      aggregatedOrganizations.push({ ...organization, workflows, agents });
    }
    return aggregatedOrganizations;
  }
}
