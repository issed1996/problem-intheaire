// TiffViewer.js

import React, { useRef, useEffect } from 'react';
import { fromUrl } from 'geotiff';

function TiffViewer({ fileUrl }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!fileUrl) return;

        (async () => {
            try {
                const tiff = await fromUrl(fileUrl);
                const image = await tiff.getImage();
                const width = image.getWidth();
                const height = image.getHeight();
                const data = await image.readRasters();

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;

                const imageData = ctx.createImageData(width, height);
                imageData.data.set(data[0]);
                ctx.putImageData(imageData, 0, 0);
            } catch (error) {
                console.error('Error displaying .tif file:', error);
            }
        })();
    }, [fileUrl]);

    return (
        <div>
            <h2>.tif Image Viewer</h2>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}

export default TiffViewer;
