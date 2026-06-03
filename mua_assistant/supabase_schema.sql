-- Drop existing tables if they exist (for development iteration)
DROP TABLE IF EXISTS public.bookings;
DROP TABLE IF EXISTS public.leads;
DROP TABLE IF EXISTS public.users;

-- 1. Users Table (MUA Profiles)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  city TEXT,
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Leads Table (Inquiries)
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  client_name TEXT NOT NULL,
  phone TEXT, -- Added for contact info
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT,
  location TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('new', 'contacted', 'converted', 'lost')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bookings Table (Confirmed Jobs)
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) UNIQUE NOT NULL, -- 1:1 Relationship
  user_id UUID REFERENCES public.users(id) NOT NULL, -- Denormalized for easier querying
  advance_amount NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
  booking_status TEXT CHECK (booking_status IN ('new', 'advance_requested', 'confirmed', 'completed', 'cancelled')) DEFAULT 'new',
  buffer_time INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Leads: Users can only see/edit their own leads
CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);

-- Bookings: Users can only see/edit their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
