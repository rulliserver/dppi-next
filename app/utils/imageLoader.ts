// utils/imageLoader.ts
export const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    const params = new URLSearchParams();
    params.set('w', width.toString());
    params.set('q', (quality || 75).toString());


    if (src.startsWith('http')) {
        return `http://127.0.0.1:8000/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
    }

    return `${src}?${params.toString()}`;
};