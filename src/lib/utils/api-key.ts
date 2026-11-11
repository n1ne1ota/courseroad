export type ApiKey = { value: string; label?: string };

type Options = {
    cooldownMs?: number;
    maxFailuresBeforeCooldown?: number;
};

export class ApiKeyUtility {
    private readonly keys: ApiKey[];
    private readonly cooldownMs: number;
    private readonly maxFailures: number;
    private currentIndex = 0;
    private cooldownUntil = new Map<string, number>();
    private failureCounts = new Map<string, number>();

    constructor(keys: (string | ApiKey)[], options: Options = {}) {
        const normalized = keys.map(k => (typeof k === 'string' ? { value: k } : k));

        if (normalized.length === 0) throw new Error('No API keys provided');

        this.keys = normalized;
        this.cooldownMs = options.cooldownMs ?? 60_000;
        this.maxFailures = options.maxFailuresBeforeCooldown ?? 3;
    }

    next(): ApiKey {
        // Ensure TypeScript knows there is at least one key available
        if (this.keys.length === 0) throw new Error('No API keys available');

        const now = Date.now();

        for (let i = 0; i < this.keys.length; i++) {
            const idx = (this.currentIndex + i) % this.keys.length;
            const key = this.keys[idx];

            if (!key) continue;

            const until = this.cooldownUntil.get(key.value) ?? 0;

            if (until <= now) {
                this.currentIndex = (idx + 1) % this.keys.length;
                return key;
            }
        }

        // All cooled down: pick key with the soonest availability
        const first = this.keys[0];

        if (!first) throw new Error('No API keys available');

        let candidate: ApiKey = first;
        let minUntil = this.cooldownUntil.get(candidate.value) ?? 0;

        for (const k of this.keys) {
            const until = this.cooldownUntil.get(k.value) ?? 0;

            if (until < minUntil) {
                minUntil = until;
                candidate = k;
            }
        }

        return candidate;
    }

    reportFailure(keyValue: string): void {
        const count = (this.failureCounts.get(keyValue) ?? 0) + 1;
        this.failureCounts.set(keyValue, count);

        if (count >= this.maxFailures) {
            this.cooldownUntil.set(keyValue, Date.now() + this.cooldownMs);
            this.failureCounts.set(keyValue, 0);
        }
    }

    reportSuccess(keyValue: string): void {
        this.failureCounts.set(keyValue, 0);
        this.cooldownUntil.delete(keyValue);
    }
}
