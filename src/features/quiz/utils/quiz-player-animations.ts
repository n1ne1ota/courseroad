export const slideVariants = {
    center: {
        opacity: 1,
        x: 0
    },
    enter: (direction: number) => ({
        opacity: 0,
        x: direction > 0 ? 80 : -80
    }),
    exit: (direction: number) => ({
        opacity: 0,
        x: direction > 0 ? -80 : 80
    })
};

export const slideTransition = {
    duration: 0.2,
    ease: [0.25, 0.46, 0.45, 0.94] as const
};
