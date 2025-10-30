-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  tagline TEXT,
  icon_url TEXT,
  banner_url TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_members table
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Anyone can view communities" ON public.communities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their communities" ON public.communities
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for community_members
CREATE POLICY "Anyone can view members" ON public.community_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON public.community_members
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_posts
CREATE POLICY "Anyone can view posts" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for community_comments
CREATE POLICY "Anyone can view comments" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their comments" ON public.community_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their comments" ON public.community_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Create function to update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities
    SET member_count = member_count - 1
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_member_count_trigger
AFTER INSERT OR DELETE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Create function to update community post count
CREATE OR REPLACE FUNCTION update_community_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities
    SET post_count = post_count + 1
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities
    SET post_count = post_count - 1
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_count_trigger
AFTER INSERT OR DELETE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION update_community_post_count();

-- Create function to update comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET comment_count = comment_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_count_trigger
AFTER INSERT OR DELETE ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();