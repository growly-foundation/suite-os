import { consumePersona } from '@/core/persona';
import { Activity, ImageIcon, Wallet } from 'lucide-react';
import React from 'react';

import { ParsedUser } from '@getgrowly/core';

import { SectionPanel } from '../ui/section-panel';
import { ActivitiesList } from '../user/activities-list';
import { NftGrid } from '../user/nft-grid';
import { TokensList } from '../user/tokens-list';
import { UserProfileHeader } from '../user/user-profile-header';
import { UserStats } from '../user/user-stats';
import { UserBadges } from './app-user-badges';

interface UserDetailsProps {
  user: ParsedUser;
}

export function UserDetails({ user }: UserDetailsProps) {
  const userPersona = consumePersona(user);

  return (
    <React.Fragment>
      <UserProfileHeader user={user} />

      <div className="flex-1 overflow-auto">
        <SectionPanel title="Activity Stats" icon={Activity}>
          <UserStats user={user} />
        </SectionPanel>
        <SectionPanel title="Top Holdings" icon={Wallet}>
          <TokensList user={user} />
        </SectionPanel>
        <SectionPanel title="Recent Activity">
          <ActivitiesList user={user} limit={5} />
        </SectionPanel>
        <SectionPanel title="Featured NFTs" icon={ImageIcon}>
          <NftGrid items={userPersona.universalNftList()} limit={6} columns={3} />
        </SectionPanel>
        <SectionPanel title="Reputation Badges">
          <UserBadges
            badges={
              user.personaData.identities.traitScores?.map(traitScore =>
                traitScore.trait.toString()
              ) || []
            }
          />
        </SectionPanel>
      </div>
    </React.Fragment>
  );
}
