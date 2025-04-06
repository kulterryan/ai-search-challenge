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
    -- Convert grades JSON array into a text array
    (SELECT ARRAY(SELECT jsonb_array_elements_text(c.grades::jsonb))) AS grades,
    -- Use CASE to apply combined scoring when query_text is provided,
    -- otherwise fall back to pure vector similarity.
    CASE 
      WHEN query_text = '' THEN 1 - (CAST(c.embedding AS vector) <#> query_embedding)
      ELSE (
        (1 - (CAST(c.embedding AS vector) <#> query_embedding)) * 0.7 +
        ts_rank(
          to_tsvector('english', c.title || ' ' || COALESCE(c.description, '')),
          plainto_tsquery('english', query_text)
        ) * 0.3
      )
    END AS similarity
  FROM content c
  WHERE 
    -- Filter based on vector similarity threshold
    1 - (CAST(c.embedding AS vector) <#> query_embedding) > match_threshold
    AND (
      filter_grade = 'all'
      OR filter_grade IN (SELECT jsonb_array_elements_text(c.grades::jsonb))
    )
    -- Apply text search filtering if query_text is provided
    AND (
      query_text = '' OR
      to_tsvector('english', c.title || ' ' || COALESCE(c.description, '')) @@ 
      plainto_tsquery('english', query_text)
    )
    -- Exclude rows with empty description or image
    AND COALESCE(c.description, '') <> ''
    AND COALESCE(c.image, '') <> ''
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
