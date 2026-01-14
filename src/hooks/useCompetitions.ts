import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Competition, CompetitionDocument, CompetitionWithDocuments } from '@/lib/types';

export function useCompetitions(status?: 'active' | 'archived') {
  return useQuery({
    queryKey: ['competitions', status],
    queryFn: async () => {
      let query = supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Competition[];
    },
  });
}

export function useCompetition(slug: string) {
  return useQuery({
    queryKey: ['competition', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select(`
          *,
          competition_documents (*)
        `)
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      // Sort documents by order_index
      if (data?.competition_documents) {
        data.competition_documents.sort((a: CompetitionDocument, b: CompetitionDocument) => 
          a.order_index - b.order_index
        );
      }
      
      return data as CompetitionWithDocuments;
    },
    enabled: !!slug,
  });
}

export function useCompetitionById(id: string) {
  return useQuery({
    queryKey: ['competition-by-id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select(`
          *,
          competition_documents (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data?.competition_documents) {
        data.competition_documents.sort((a: CompetitionDocument, b: CompetitionDocument) => 
          a.order_index - b.order_index
        );
      }
      
      return data as CompetitionWithDocuments;
    },
    enabled: !!id,
  });
}

export function useCreateCompetition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (competition: Omit<Competition, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('competitions')
        .insert(competition)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
}

export function useUpdateCompetition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Competition> & { id: string }) => {
      const { data, error } = await supabase
        .from('competitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['competition', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['competition-by-id', data.id] });
    },
  });
}

export function useDeleteCompetition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
}

export function useCompetitionDocuments(competitionId: string) {
  return useQuery({
    queryKey: ['competition-documents', competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_documents')
        .select('*')
        .eq('competition_id', competitionId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as CompetitionDocument[];
    },
    enabled: !!competitionId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (document: Omit<CompetitionDocument, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('competition_documents')
        .insert(document)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['competition-documents', data.competition_id] });
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CompetitionDocument> & { id: string }) => {
      const { data, error } = await supabase
        .from('competition_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['competition-documents', data.competition_id] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, competitionId }: { id: string; competitionId: string }) => {
      const { error } = await supabase
        .from('competition_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { competitionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['competition-documents', data.competitionId] });
    },
  });
}

export function useReorderDocuments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documents: { id: string; order_index: number; competition_id: string }[]) => {
      const updates = documents.map(doc => 
        supabase
          .from('competition_documents')
          .update({ order_index: doc.order_index })
          .eq('id', doc.id)
      );
      
      await Promise.all(updates);
      return documents[0]?.competition_id;
    },
    onSuccess: (competitionId) => {
      if (competitionId) {
        queryClient.invalidateQueries({ queryKey: ['competition-documents', competitionId] });
      }
    },
  });
}
