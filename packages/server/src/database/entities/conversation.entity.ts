import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Agent } from './agent.entity';
import { WalletUser } from './wallet-user.entity';

@Entity({ name: 'conversation' })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Agent)
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @ManyToOne(() => WalletUser)
  @JoinColumn({ name: 'wallet_user_id' })
  walletUser: WalletUser;

  @Column({ type: 'jsonb' })
  messages: any[];

  @Column({ type: 'jsonb', nullable: true })
  embedding: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
