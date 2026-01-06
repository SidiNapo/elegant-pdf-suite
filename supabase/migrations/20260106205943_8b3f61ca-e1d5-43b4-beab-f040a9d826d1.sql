-- Create storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-files', 'pdf-files', true);

-- Allow public access to read files
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'pdf-files');

-- Allow public upload
CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pdf-files');

-- Allow public delete
CREATE POLICY "Public delete access" ON storage.objects
FOR DELETE USING (bucket_id = 'pdf-files');