import { useEffect, useEffectEvent } from 'react';

/**
 * Hook that executes a callback when the component unmounts.
 *
 * @param callback Function to be called on component unmount
 */

export const useUnmount = (callback: () => void | Promise<void>) => {
    const onUnmount = useEffectEvent(callback);

    useEffect(
        () => () => {
            onUnmount();
        },
        []
    );
};

export default useUnmount;
