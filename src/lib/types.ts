export interface Competition {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: 'active' | 'archived';
  start_date: string | null;
  end_date: string | null;
  keywords: string | null;
  auto_archive: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompetitionDocument {
  id: string;
  competition_id: string;
  title: string;
  doc_date: string | null;
  description: string | null;
  file_path: string;
  file_name: string;
  file_type: string | null;
  order_index: number;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'editor';
}

export type CompetitionWithDocuments = Competition & {
  competition_documents: CompetitionDocument[];
};
