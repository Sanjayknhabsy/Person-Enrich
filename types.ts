
export interface LeadResult {
  companyName: string;
  personName: string;
  designation: string;
  phoneNumber: string;
  altPhoneNumber: string;
  sourceLink: string;
  linkedinProfile: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'verifying';
  error?: string;
  timeTaken?: string;
  retryCount?: number;
  groundingLinks?: Array<{ title: string; uri: string }>;
}

export interface BulkUploadProps {
  onUpload: (companies: string[]) => void;
  isProcessing: boolean;
}

export interface LeadTableProps {
  leads: LeadResult[];
  onRerun: (companyName: string) => void;
}
