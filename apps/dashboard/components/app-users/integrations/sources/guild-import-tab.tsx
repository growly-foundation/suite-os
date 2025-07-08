'use client';

import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Guild, GuildMember, GuildXyzService } from '@/lib/services/guildxyz.service';
import { UserImportService } from '@/lib/services/user-import.service';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface GuildImportTabProps {
  onImportComplete?: () => void;
}

export function GuildImportTab({ onImportComplete }: GuildImportTabProps) {
  const [guildIdOrName, setGuildIdOrName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Record<string, boolean>>({});
  const [importing, setImporting] = useState(false);

  // Create a service instance
  const guildService = new GuildXyzService();

  // Search for a guild by ID or name
  const handleSearch = async () => {
    if (!guildIdOrName) return;

    setSearching(true);
    try {
      // Try to fetch by ID or name directly
      const foundGuild = await guildService.getGuild(guildIdOrName);

      if (foundGuild) {
        setGuild(foundGuild);
        // Fetch members
        const guildMembers = await guildService.getGuildMembers(foundGuild.id);
        setMembers(guildMembers);
      } else {
        // Try searching for guilds with similar names
        const searchResults = await guildService.searchGuilds(guildIdOrName);

        if (searchResults.length > 0) {
          setGuild(searchResults[0]);
          // Fetch members for the first result
          const guildMembers = await guildService.getGuildMembers(searchResults[0].id);
          setMembers(guildMembers);
        } else {
          toast.error('No guild found with that name or ID');
          setGuild(null);
          setMembers([]);
        }
      }
    } catch (error) {
      console.error('Error searching for guild:', error);
      toast.error(
        `Error searching for guild: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setSearching(false);
    }
  };

  // Import selected members
  const handleImport = async (membersToImport: GuildMember[]) => {
    if (!guild) return;

    if (membersToImport.length === 0) {
      toast.warning('Please select at least one member to import');
      return;
    }

    setImporting(true);
    try {
      // Import users in batch
      const result = await UserImportService.importBatch('guildxyz', membersToImport, {
        guildId: guild.id,
        guildName: guild.name,
      });

      // Show success/failure messages
      if (result.success.length > 0) {
        toast.success(`Successfully imported ${result.success.length} guild members`);
      }

      if (result.failed.length > 0) {
        toast.error(`Failed to import ${result.failed.length} guild members`);
      }

      // If all successful, trigger completion callback
      if (result.failed.length === 0 && result.success.length > 0) {
        onImportComplete?.();
      }
    } catch (error) {
      console.error('Error importing guild members:', error);
      toast.error(
        `Error importing guild members: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setImporting(false);
    }
  };

  // Count of selected members
  const selectedCount = Object.values(selectedMembers).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <Alert variant="default" className="bg-muted">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Import users from a Guild.xyz guild by entering the guild name or ID.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <div className="flex gap-2 items-end">
          <div className="grid gap-2 flex-1">
            <Label htmlFor="guild-id">Guild Name or ID</Label>
            <Input
              id="guild-id"
              placeholder="Enter guild name or ID"
              value={guildIdOrName}
              onChange={e => setGuildIdOrName(e.target.value)}
            />
          </div>
          <Button onClick={handleSearch} disabled={searching || !guildIdOrName}>
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {guild && (
          <div className="border rounded-md p-4 space-y-4">
            <div className="flex items-center space-x-4">
              {guild.imageUrl && (
                <img src={guild.imageUrl} alt={guild.name} className="h-16 w-16 rounded-md" />
              )}
              <div>
                <h3 className="text-lg font-semibold">{guild.name}</h3>
                <p className="text-sm text-muted-foreground">{guild.memberCount} members</p>
                {guild.description && <p className="text-sm">{guild.description}</p>}
              </div>
            </div>
          </div>
        )}

        {members.length > 0 && (
          <UserSelectionList
            users={members.map(member => ({
              id: member.id,
              displayName:
                member.name ||
                `${member.address.substring(0, 8)}...${member.address.substring(member.address.length - 4)}`,
              subtitle: `${member.roles.length} roles`,
              metadata: member,
            }))}
            title="Guild Members"
            importButtonText={importing ? 'Importing...' : 'Import Members'}
            isImporting={importing}
            onImport={async (selectedMemberIds: string[]) => {
              const membersToImport = members.filter(member =>
                selectedMemberIds.includes(member.id)
              );
              await handleImport(membersToImport);
            }}
          />
        )}
      </div>
    </div>
  );
}
