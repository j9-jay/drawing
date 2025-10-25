/**
 * JSON-LD Script Component
 * SEO를 위한 구조화된 데이터 삽입
 */

export interface JsonLdProps {
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
