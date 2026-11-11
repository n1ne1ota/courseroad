/**
 * JSON-LD (JSON for Linked Data) is used to expose structured data to search engines.
 * It helps crawlers understand the entities and relationships on a page (beyond plain text)
 * improving eligibility for rich results and search visibility.
 */
export function JsonLd({ json }: { json: unknown }) {
  return (
    <script
      type='application/ld+json'
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
