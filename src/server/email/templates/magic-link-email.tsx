import 'server-only';

export interface MagicLinkEmailProps {
  email: string;
  url: string;
}

export function MagicLinkEmail({ email, url }: MagicLinkEmailProps) {
  return (
    <html>
      <body
        style={{
          backgroundColor: '#f8fafc',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          margin: 0,
          padding: '40px 20px'
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            margin: '0 auto',
            maxWidth: '600px',
            padding: '40px'
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div
              style={{
                alignItems: 'center',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                height: '64px',
                justifyContent: 'center',
                margin: '0 auto 16px',
                width: '64px'
              }}
            >
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              >
                Courseroad
              </span>
            </div>
            <h1
              style={{
                color: '#1e293b',
                fontSize: '24px',
                fontWeight: '600',
                margin: '0 0 8px'
              }}
            >
              Sign In to Courseroad
            </h1>
            <p
              style={{
                color: '#64748b',
                fontSize: '16px',
                margin: 0
              }}
            >
              Click the button below to sign in to your account. No password required.
            </p>
          </div>

          {/* Action Button */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <a
              style={{
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                color: '#ffffff',
                display: 'inline-block',
                fontSize: '16px',
                fontWeight: '600',
                padding: '14px 28px',
                textDecoration: 'none'
              }}
              href={url}
            >
              Sign In to Courseroad
            </a>
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: '32px' }}>
            <p
              style={{
                color: '#475569',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0 0 8px'
              }}
            >
              If the button doesn&apos;t work, copy and paste the link below into your browser:
            </p>
            <p
              style={{
                color: '#3b82f6',
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                fontSize: '13px',
                margin: 0,
                wordBreak: 'break-all'
              }}
            >
              {url}
            </p>
            <p
              style={{
                color: '#64748b',
                fontSize: '13px',
                margin: '16px 0 0'
              }}
            >
              This sign-in link is valid for 15 minutes and can only be used once.
            </p>
          </div>

          {/* Security Notice */}
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              marginBottom: '32px',
              padding: '16px'
            }}
          >
            <p
              style={{
                color: '#92400e',
                fontSize: '14px',
                margin: 0
              }}
            >
              <strong>Security Notice:</strong> If you didn&apos;t request this sign-in link, you can safely ignore this
              email.
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '24px',
              textAlign: 'center'
            }}
          >
            <p
              style={{
                color: '#64748b',
                fontSize: '14px',
                margin: '0 0 8px'
              }}
            >
              This email was sent to <span style={{ fontWeight: '500' }}>{email}</span>
            </p>
            <p
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                margin: 0
              }}
            >
              &copy; 2026 Courseroad. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
