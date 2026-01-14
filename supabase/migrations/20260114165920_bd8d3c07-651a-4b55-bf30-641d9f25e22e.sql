-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- Create enum for competition status
CREATE TYPE public.competition_status AS ENUM ('active', 'archived');

-- Create competitions table
CREATE TABLE public.competitions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    status competition_status NOT NULL DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    keywords TEXT,
    auto_archive BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competition_documents table
CREATE TABLE public.competition_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    doc_date DATE,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to check if user email ends with @icmpp.ro
CREATE OR REPLACE FUNCTION public.is_icmpp_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
          AND email LIKE '%@icmpp.ro'
    )
$$;

-- Function to check if user is admin or editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'editor')
    ) AND public.is_icmpp_user()
$$;

-- RLS Policies for competitions
-- Public read access
CREATE POLICY "Anyone can view competitions"
ON public.competitions
FOR SELECT
USING (true);

-- Only admins/editors can insert
CREATE POLICY "Admins and editors can create competitions"
ON public.competitions
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor());

-- Only admins/editors can update
CREATE POLICY "Admins and editors can update competitions"
ON public.competitions
FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor());

-- Only admins can delete
CREATE POLICY "Only admins can delete competitions"
ON public.competitions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for competition_documents
-- Public read access
CREATE POLICY "Anyone can view documents"
ON public.competition_documents
FOR SELECT
USING (true);

-- Only admins/editors can insert
CREATE POLICY "Admins and editors can create documents"
ON public.competition_documents
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor());

-- Only admins/editors can update
CREATE POLICY "Admins and editors can update documents"
ON public.competition_documents
FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor());

-- Only admins/editors can delete
CREATE POLICY "Admins and editors can delete documents"
ON public.competition_documents
FOR DELETE
TO authenticated
USING (public.is_admin_or_editor());

-- RLS Policies for user_roles
-- Only admins can view roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_competitions_status ON public.competitions(status);
CREATE INDEX idx_competitions_slug ON public.competitions(slug);
CREATE INDEX idx_competition_documents_competition_id ON public.competition_documents(competition_id);
CREATE INDEX idx_competition_documents_order ON public.competition_documents(order_index);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_competitions_updated_at
BEFORE UPDATE ON public.competitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('competition-documents', 'competition-documents', true);

-- Storage policies for competition documents bucket
CREATE POLICY "Anyone can view competition documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'competition-documents');

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'competition-documents' AND public.is_admin_or_editor());

CREATE POLICY "Authenticated users can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'competition-documents' AND public.is_admin_or_editor());

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'competition-documents' AND public.is_admin_or_editor());