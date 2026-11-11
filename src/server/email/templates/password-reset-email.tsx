import 'server-only';

export interface EmailPasswordResetProps {
  email: string;
  resetUrl: string;
  userName?: string;
}

export function PasswordResetEmail({ email, resetUrl, userName }: EmailPasswordResetProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        margin: '0 auto',
        maxWidth: '600px',
        padding: '20px'
      }}
    >
      <div
        style={{
          marginBottom: '30px',
          textAlign: 'center'
        }}
      >
        <h1
          style={{
            color: '#333333',
            fontSize: '24px',
            marginBottom: '10px'
          }}
        >
          Reset Your Password
        </h1>
        <p
          style={{
            color: '#666666',
            fontSize: '16px',
            margin: '0'
          }}
        >
          Courseroad
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <p
          style={{
            color: '#333333',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '0 0 15px 0'
          }}
        >
          {userName ? `Hi ${userName},` : 'Hi there,'}
        </p>

        <p
          style={{
            color: '#333333',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '0 0 15px 0'
          }}
        >
          We received a request to reset the password for your account associated with <strong>{email}</strong>.
        </p>

        <p
          style={{
            color: '#333333',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '0 0 25px 0'
          }}
        >
          Click the button below to reset your password. This link will expire in 24 hours.
        </p>
      </div>

      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <a
          style={{
            backgroundColor: '#007bff',
            borderRadius: '6px',
            color: '#ffffff',
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '12px 24px',
            textDecoration: 'none'
          }}
          href={resetUrl}
        >
          Reset Password
        </a>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p
          style={{
            color: '#666666',
            fontSize: '14px',
            lineHeight: '1.4',
            margin: '0 0 10px 0'
          }}
        >
          If the button above doesn&apos;t work, you can copy and paste the following link into your browser:
        </p>
        <p
          style={{
            color: '#007bff',
            fontSize: '14px',
            lineHeight: '1.4',
            margin: '0',
            wordBreak: 'break-all'
          }}
        >
          {resetUrl}
        </p>
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #eee',
          margin: '30px 0 20px 0'
        }}
      />

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            color: '#999999',
            fontSize: '12px',
            lineHeight: '1.4',
            margin: '0 0 10px 0'
          }}
        >
          If you didn&apos;t request a password reset, you can safely ignore this email. Your password will not be
          changed.
        </p>
        <p
          style={{
            color: '#999999',
            fontSize: '12px',
            lineHeight: '1.4',
            margin: '0'
          }}
        >
          © 2024 Courseroad. All rights reserved.
        </p>
      </div>
    </div>
  );
}
