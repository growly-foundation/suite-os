'use client';

import { Guild, GuildMember } from '@/lib/services/guildxyz.service';
import { NextResponse } from 'next/server';

import { ParsedUser } from '@getgrowly/core';

/**
 * API route handler for importing users from GuildXYZ
 * Takes a Guild member and Guild data and creates a user in the system
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { member, guild } = body;

    if (!member || !guild) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: member and guild' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Validate the data
    // 2. Check if the user already exists
    // 3. Create or update the user in your database
    // 4. Return the created/updated user

    // For demonstration, we'll create a mock user
    const user: Partial<ParsedUser> = {
      id: `guild-${member.id}`,
      name: member.name || `Guild Member ${member.address.substring(0, 8)}`,
      offchainData: {
        description: `Member of ${guild.name} Guild`,
        source: 'guildxyz',
        sourceId: member.id,
        importedAt: new Date().toISOString(),
        sourceData: {
          address: member.address,
          guildId: guild.id,
          guildName: guild.name,
          roles: member.roles,
        },
      },
      // Other required fields would be added here in a real implementation
    } as unknown as ParsedUser;

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error importing Guild user:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to import Guild user: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
