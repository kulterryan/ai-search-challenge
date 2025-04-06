CREATE OR REPLACE FUNCTION public.match_content(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_grade text,
  query_text text
)
RETURNS TABLE (
  id int,
  title text,
  link text,
  description text,
  content_type text,
  image text,
  source text,
  grades text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.link,
    c.description,
    c.content_type,
    c.image,
    c.source,
    (SELECT ARRAY(SELECT jsonb_array_elements_text(c.grades::jsonb))) AS grades,
    1 - (CAST(c.embedding AS vector) <#> query_embedding) AS similarity
  FROM content c
  WHERE 1 - (CAST(c.embedding AS vector) <#> query_embedding) > match_threshold
    AND (
      filter_grade = 'all'
      OR filter_grade IN (SELECT jsonb_array_elements_text(c.grades::jsonb))
    )
    -- Text search component for better relevance filtering; if query_text is empty, bypass the filter.
    AND (
      query_text = '' OR
      to_tsvector('english', c.title || ' ' || COALESCE(c.description, '')) @@ plainto_tsquery('english', query_text)
    )
    -- Exclude rows if either description or image is blank or null
    AND COALESCE(c.description, '') <> ''
    AND COALESCE(c.image, '') <> ''
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;