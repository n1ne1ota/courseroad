import { getAvatarGradient, stringToHash, stringToHue } from '@courseroad/iota-ui/utils/color';
import { getInitials } from '@courseroad/iota-ui/utils/string';

function getAvatarData(name?: string | null, email?: string | null) {
    return {
        hue: stringToHue(email || name || 'u'),
        initials: getInitials(name, email)
    };
}

describe('avatar utilities', () => {
    describe('getInitials', () => {
        it('should return initials from first and last name', () => {
            expect(getInitials('John Doe', 'john@example.com')).toBe('JD');
        });

        it('should return initial from first name if last name is missing', () => {
            expect(getInitials('John', 'john@example.com')).toBe('J');
        });

        it('should return first letter of email if name is missing', () => {
            expect(getInitials(null, 'john@example.com')).toBe('J');
            expect(getInitials('', 'john@example.com')).toBe('J');
        });

        it('should return U as fallback if both name and email are missing', () => {
            expect(getInitials(null, null)).toBe('U');
        });

        it('should handle multiple spaces', () => {
            expect(getInitials('John    Doe', 'john@example.com')).toBe('JD');
        });
    });

    describe('stringToHue', () => {
        it('should return 210 for empty input', () => {
            expect(stringToHue(null)).toBe(210);
            expect(stringToHue('')).toBe(210);
        });

        it('should generate consistent hue for same string', () => {
            const hue1 = stringToHue('john@example.com');
            const hue2 = stringToHue('john@example.com');
            expect(hue1).toBe(hue2);
        });

        it('should return hue between 0 and 360', () => {
            const hue = stringToHue('some long random string to test the bounds of the hash function');
            expect(hue).toBeGreaterThanOrEqual(0);
            expect(hue).toBeLessThan(360);
        });
    });

    describe('stringToHash', () => {
        it('should return 0 for empty input', () => {
            expect(stringToHash(null)).toBe(0);
            expect(stringToHash('')).toBe(0);
        });

        it('should generate consistent hash for same string', () => {
            const hash1 = stringToHash('john@example.com');
            const hash2 = stringToHash('john@example.com');
            expect(hash1).toBe(hash2);
        });

        it('should generate different hashes for different strings', () => {
            const hash1 = stringToHash('user1');
            const hash2 = stringToHash('user2');
            expect(hash1).not.toBe(hash2);
        });
    });

    describe('getAvatarGradient', () => {
        it('should return a gradient with background and color keys', () => {
            const gradient = getAvatarGradient('john@example.com');
            expect(gradient).toHaveProperty('background');
            expect(gradient).toHaveProperty('color');
            expect(gradient.color).toBe('#ffffff');
            expect(gradient.background).toContain('radial-gradient');
            expect(gradient.background).toContain('linear-gradient');
        });

        it('should generate consistent gradient for same string', () => {
            const g1 = getAvatarGradient('john@example.com');
            const g2 = getAvatarGradient('john@example.com');
            expect(g1.background).toBe(g2.background);
        });

        it('should generate different gradients for different strings', () => {
            const g1 = getAvatarGradient('user1');
            const g2 = getAvatarGradient('user2');
            expect(g1.background).not.toBe(g2.background);
        });
    });

    describe('getAvatarData', () => {
        it('should return both initials and hue', () => {
            const result = getAvatarData('John Doe', 'john@example.com');
            expect(result.initials).toBe('JD');
            expect(typeof result.hue).toBe('number');
        });
    });
});
