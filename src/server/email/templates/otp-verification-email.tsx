import 'server-only';

interface VerificationOtpEmailProps {
  email: string;
  otp: string;
}

export function OtpVerificationEmail({ email, otp }: VerificationOtpEmailProps) {
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
              Verify Your Email Address
            </h1>
            <p
              style={{
                color: '#64748b',
                fontSize: '16px',
                margin: 0
              }}
            >
              Welcome to Courseroad! Please verify your email to complete your registration.
            </p>
          </div>

          {/* OTP Section */}
          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              marginBottom: '32px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <p
              style={{
                color: '#475569',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.05em',
                margin: '0 0 16px',
                textTransform: 'uppercase'
              }}
            >
              Your Verification Code
            </p>
            <div
              style={{
                color: '#1e293b',
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                fontSize: '32px',
                fontWeight: 'bold',
                letterSpacing: '0.25em',
                margin: '8px 0'
              }}
            >
              {otp}
            </div>
            <p
              style={{
                color: '#64748b',
                fontSize: '14px',
                margin: '16px 0 0'
              }}
            >
              This code will expire in 5 minutes
            </p>
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                color: '#1e293b',
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 16px'
              }}
            >
              How to verify:
            </h2>
            <ol
              style={{
                color: '#475569',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0,
                paddingLeft: '20px'
              }}
            >
              <li style={{ marginBottom: '8px' }}>Return to the Courseroad signup page</li>
              <li style={{ marginBottom: '8px' }}>Enter the 6-digit code above in the verification field</li>
              <li>Click &quot;Verify Email&quot; to complete your registration</li>
            </ol>
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
              <strong>Security Notice:</strong> If you didn&apos;t request this verification, please ignore this email.
              Never share this code with anyone.
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
              &copy; 2025 Courseroad. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
