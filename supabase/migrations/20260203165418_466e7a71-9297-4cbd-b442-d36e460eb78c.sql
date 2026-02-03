-- Create system_settings table for admin-configurable settings
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read settings
CREATE POLICY "Admins can view settings"
    ON public.system_settings FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
    ON public.system_settings FOR INSERT
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
    ON public.system_settings FOR UPDATE
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
    ON public.system_settings FOR DELETE
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default webhook_url setting (empty by default)
INSERT INTO public.system_settings (key, value, description)
VALUES ('webhook_url', '', 'URL pro webhook pro odesílání účtenek (např. Make.com, Zapier)');