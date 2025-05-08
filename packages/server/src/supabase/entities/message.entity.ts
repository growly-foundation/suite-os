/**
 * Message entity representing the structure of a message in Supabase
 */
export class Message {
  id: string;
  thread_id: string;
  agent_id: string;
  content: string;
  role: string;
  embedding: number[];
  created_at: Date;
}
