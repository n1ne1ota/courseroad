import 'server-only';

import { createPaymentsService } from '@/features/payment/server/stripe-connect-service';
import { logs } from '@/server/logging/server';
import { getStripe } from '@/server/payments/payments';

import type { PaymentsService } from '@/features/payment/server/stripe-connect-service';

/** Build the Connect service only when an enabled operation is requested. */
function getPayments() {
    return createPaymentsService(getStripe(), {
        error: (message, error) => logs.api.error(message, error),
        info: (message, meta) => logs.api.info(message, meta)
    });
}

export function createExpressAccount(...args: Parameters<PaymentsService['createExpressAccount']>) {
    return getPayments().createExpressAccount(...args);
}

export function createOnboardingLink(...args: Parameters<PaymentsService['createOnboardingLink']>) {
    return getPayments().createOnboardingLink(...args);
}

export function createDashboardLink(...args: Parameters<PaymentsService['createDashboardLink']>) {
    return getPayments().createDashboardLink(...args);
}

export function getAccountStatus(...args: Parameters<PaymentsService['getAccountStatus']>) {
    return getPayments().getAccountStatus(...args);
}
