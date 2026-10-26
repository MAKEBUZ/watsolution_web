export interface Payload {
  id: number;
  sid?: string;
  mfa?: boolean;
  username: string;
  authorities?: string[];
}
