export type Role = 'ADMIN' | 'STUDENT' | 'TEACHER';

export type ElectionStatus = 'SCHEDULED' | 'ACTIVE' | 'FINALIZED' | 'CANCELLED';

export interface UserPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface BlockStructure {
  id: string;
  index: number;
  timestamp: Date;
  previousHash: string;
  voteHash: string;
  encryptedVote: string;
  nonce: string;
  merkleRoot: string;
  signature: string;
  blockHash: string;
  electionId: string;
  isDummy: boolean;
  weight: number;
}
