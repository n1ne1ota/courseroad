/**
 * Utilities for parsing and applying per-org tenant branding.
 *
 * The `metadata` field on the Organization model stores optional JSON
 * with branding values (colors, etc.). This module extracts those values
 * and converts them into CSS custom properties for the dashboard layout.
 */

type TenantBranding = {
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
};

const DEFAULT_BRANDING: TenantBranding = {
    logoUrl: null,
    primaryColor: 'hsl(var(--primary))',
    secondaryColor: 'hsl(var(--accent))'
};

/**
 * Parse org metadata JSON and extract branding values with safe defaults.
 * Supports direct database columns as overrides.
 *
 * Expected metadata shape:
 * ```json
 * {
 *   "branding": {
 *     "primaryColor": "#6366f1",
 *     "secondaryColor": "#f59e0b"
 *   }
 * }
 * ```
 */
export function parseTenantBranding(
    metadata: string | null,
    dbPrimaryColor?: string | null,
    dbSecondaryColor?: string | null
): TenantBranding {
    if (dbPrimaryColor || dbSecondaryColor) {
        return {
            logoUrl: DEFAULT_BRANDING.logoUrl,
            primaryColor: dbPrimaryColor ?? DEFAULT_BRANDING.primaryColor,
            secondaryColor: dbSecondaryColor ?? DEFAULT_BRANDING.secondaryColor
        };
    }

    if (!metadata) return DEFAULT_BRANDING;

    try {
        const parsed = JSON.parse(metadata) as {
            branding?: {
                accentColor?: string; // Legacy fallback
                primaryColor?: string;
                secondaryColor?: string;
            };
        };

        return {
            logoUrl: DEFAULT_BRANDING.logoUrl,
            primaryColor: parsed.branding?.primaryColor ?? DEFAULT_BRANDING.primaryColor,
            secondaryColor:
                parsed.branding?.secondaryColor ?? parsed.branding?.accentColor ?? DEFAULT_BRANDING.secondaryColor
        };
    } catch {
        return DEFAULT_BRANDING;
    }
}

/**
 * Convert branding config into a CSS custom properties object
 * suitable for React's `style` prop.
 */
export function tenantBrandingStyles(branding: TenantBranding): Record<string, string> {
    const styles: Record<string, string> = {};

    if (branding.primaryColor !== DEFAULT_BRANDING.primaryColor) {
        styles['--tenant-primary'] = branding.primaryColor;
    }
    if (branding.secondaryColor !== DEFAULT_BRANDING.secondaryColor) {
        styles['--tenant-accent'] = branding.secondaryColor;
        styles['--tenant-secondary'] = branding.secondaryColor;
    }

    return styles;
}
