import 'server-only';

import { type OrganizationMemberRole, organizationRoleLabels } from '@/lib/auth/org-role-policy';

export interface OrganizationInvitationEmailProps {
  email: string;
  organizationName: string;
  inviterName: string;
  role: OrganizationMemberRole;
  expiresAt: Date;
  invitationUrl: string;
}

/** Organization membership invitation; accepting requires the addressed account. */
export function OrganizationInvitationEmail({
  email,
  organizationName,
  inviterName,
  role,
  expiresAt,
  invitationUrl
}: OrganizationInvitationEmailProps) {
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
          <h1 style={{ color: '#1e293b', fontSize: '24px' }}>Join {organizationName} on Courseroad</h1>
          <p style={{ color: '#475569', lineHeight: '1.6' }}>
            {inviterName} has invited you to join {organizationName}. Your role will be {organizationRoleLabels[role]}.
          </p>
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
              href={invitationUrl}
            >
              Accept invitation
            </a>
          </p>
          <p style={{ color: '#475569', lineHeight: '1.6' }}>
            Sign in or create an account using {email}. This invitation expires on {expiresAt.toUTCString()}.
          </p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>If the button does not work, open this link:</p>
          <p style={{ fontSize: '14px', wordBreak: 'break-all' }}>
            <a href={invitationUrl}>{invitationUrl}</a>
          </p>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '32px' }}>
            If you were not expecting this invitation, you can ignore this email.
          </p>
        </div>
      </body>
    </html>
  );
}
