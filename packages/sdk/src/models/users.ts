export interface User {
  id: string;
  name: string;
  email: string;
  organizations: Organization[];
}

export interface Organization {
  id: string;
  name: string;
  created_at: Date;
}
