import React, { useEffect, useRef } from 'react';
import '@google/model-viewer';

export default function ModelViewer3D({ src, alt, colorHex }) {
    const modelRef = useRef(null);
    const applyColor = (hex) => {
        if (!modelRef.current || !modelRef.current.model) return;
        const materials = modelRef.current.model.materials;
        if (materials && materials.length > 0) {
            materials.forEach(material => {
                material.pbrMetallicRoughness.setBaseColorFactor(hex);
            });
        }
    };
    useEffect(() => {
        if (colorHex) {
            applyColor(colorHex);
        }
    }, [colorHex]);

    if (!src) return <div className="text-gray-400">Không có mô hình 3D</div>;

    return (
        <div className="w-full h-full min-h-[400px]">
            <model-viewer
                ref={modelRef}
                src={src}
                alt={alt || "Sản phẩm 3D"}
                auto-rotate
                camera-controls
                shadow-intensity="1"
                environment-image="neutral"
                style={{ width: '100%', height: '100%', minHeight: '400px', backgroundColor: 'transparent' }}
                onLoad={() => {
                    if (colorHex) applyColor(colorHex);
                }}
            ></model-viewer>
        </div>
    );
}