import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import type {
    CropperCanvas,
    CropperCrosshair,
    CropperGrid,
    CropperHandle,
    CropperImage,
    CropperSelection,
    CropperShade,
    CropperViewer
} from 'cropperjs';

type CropperCanvasAttributes = DetailedHTMLProps<HTMLAttributes<CropperCanvas>, CropperCanvas> & {
    background?: boolean;
    disabled?: boolean;
    'scale-step'?: number;
    'theme-color'?: string;
};

type CropperImageAttributes = DetailedHTMLProps<HTMLAttributes<CropperImage>, CropperImage> & {
    src?: string;
    alt?: string;
    crossorigin?: string;
    rotatable?: boolean;
    scalable?: boolean;
    skewable?: boolean;
    translatable?: boolean;
    'initial-center-size'?: string;
};

type CropperSelectionAttributes = DetailedHTMLProps<HTMLAttributes<CropperSelection>, CropperSelection> & {
    'aspect-ratio'?: number;
    'initial-aspect-ratio'?: number;
    'initial-coverage'?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    movable?: boolean;
    resizable?: boolean;
    zoomable?: boolean;
    multiple?: boolean;
    keyboard?: boolean;
    outlined?: boolean;
    dynamic?: boolean;
    linked?: boolean;
    precise?: boolean;
};

type CropperShadeAttributes = DetailedHTMLProps<HTMLAttributes<CropperShade>, CropperShade> & {
    hidden?: boolean;
    'theme-color'?: string;
};

type CropperHandleAttributes = DetailedHTMLProps<HTMLAttributes<CropperHandle>, CropperHandle> & {
    action?: string;
    plain?: boolean;
    'theme-color'?: string;
};

type CropperGridAttributes = DetailedHTMLProps<HTMLAttributes<CropperGrid>, CropperGrid> & {
    role?: string;
    bordered?: boolean;
    covered?: boolean;
    'theme-color'?: string;
};

type CropperCrosshairAttributes = DetailedHTMLProps<HTMLAttributes<CropperCrosshair>, CropperCrosshair> & {
    centered?: boolean;
    'theme-color'?: string;
};

type CropperViewerAttributes = DetailedHTMLProps<HTMLAttributes<CropperViewer>, CropperViewer> & {
    selection?: string;
    'theme-color'?: string;
};

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'cropper-canvas': CropperCanvasAttributes;
            'cropper-crosshair': CropperCrosshairAttributes;
            'cropper-grid': CropperGridAttributes;
            'cropper-handle': CropperHandleAttributes;
            'cropper-image': CropperImageAttributes;
            'cropper-selection': CropperSelectionAttributes;
            'cropper-shade': CropperShadeAttributes;
            'cropper-viewer': CropperViewerAttributes;
        }
    }
}
