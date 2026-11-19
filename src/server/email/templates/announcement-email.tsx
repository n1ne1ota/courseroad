import 'server-only';

export interface AnnouncementEmailProps {
  announcementUrl: string;
  authorName: string | null;
  /** Already sanitized. */
  bodyHtml: string;
  /** The course or organization the announcement is from. */
  contextName: string;
  title: string;
  unsubscribeUrl: string;
}

/** An announcement from a teacher or organization. Inline styles only: email clients cannot use the component library. */
export function AnnouncementEmail({
  announcementUrl,
  authorName,
  bodyHtml,
  contextName,
  title,
  unsubscribeUrl
}: AnnouncementEmailProps) {
  return (
    <html>
      <body style={{ backgroundColor: '#f8fafc', fontFamily: 'Arial, sans-serif', margin: 0, padding: '40px 20px' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            margin: '0 auto',
            maxWidth: '600px',
            padding: '40px'
          }}
        >
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px' }}>
            {contextName}
            {authorName ? ` · ${authorName}` : ''}
          </p>
          <h1 style={{ color: '#1e293b', fontSize: '24px', margin: '0 0 24px' }}>{title}</h1>
          <div style={{ color: '#334155', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          <p style={{ margin: '32px 0' }}>
            <a
              style={{
                backgroundColor: '#0055ff',
                borderRadius: '8px',
                color: '#ffffff',
                display: 'inline-block',
                padding: '14px 24px',
                textDecoration: 'none'
              }}
              href={announcementUrl}
            >
              Read on Courseroad
            </a>
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '32px' }}>
            You get this because you are part of {contextName} on Courseroad.{' '}
            <a style={{ color: '#64748b' }} href={unsubscribeUrl}>
              Unsubscribe from announcement emails
            </a>
            .
          </p>
        </div>
      </body>
    </html>
  );
}
