import { useMemo, useEffect } from 'react'
import { Text } from '@react-three/drei'
import { animated } from '@react-spring/three'
import * as THREE from 'three'
import { useNodeAnimation, type NodeVisualState } from '../../hooks/useNodeAnimation'

type ArrayBoxProps = {
    position?: [number, number, number]
    index: number
    value: number | string
    isOpen?: boolean
    isHighlighted?: boolean
    overrideColor?: string
    isSecondaryHighlight?: boolean // For duplicate values, etc.
    shouldPulse?: boolean
    hideLabels?: boolean
    hideIndex?: boolean
    label?: string // Optional bottom label (e.g. pointer name)
    address?: number
    showAddress?: boolean
    valuePlacement?: 'center' | 'top'
    dimmed?: boolean
    labelColor?: string
    opacity?: number
    visualState?: NodeVisualState // Added new visualState prop
}

export const ArrayBox = ({
    position = [0, 0, 0],
    index,
    value,
    isOpen,
    isHighlighted,
    overrideColor,
    isSecondaryHighlight,
    shouldPulse,
    hideLabels,
    hideIndex,
    label,
    address,
    showAddress,
    valuePlacement = 'center',
    dimmed,
    labelColor = '#64748b', // Default Slate-500
    opacity,
    visualState
}: ArrayBoxProps) => {

    // Derive visualState if not explicitly provided
    const resolvedState = useMemo<NodeVisualState>(() => {
        if (visualState) return visualState
        if (isHighlighted) {
            if (overrideColor === '#22c55e' || overrideColor === 'green') return 'active_found'
            if (overrideColor === '#fbbf24' || overrideColor === 'yellow') return 'active_compare'
            return 'active_pointer'
        }
        if (dimmed) return 'visited'
        if (isOpen) return 'active_pointer'
        return 'idle'
    }, [visualState, isHighlighted, overrideColor, dimmed, isOpen])

    // Use our unified animations hook
    const { springProps, edgeColor, edgeWidth } = useNodeAnimation({
        state: resolvedState,
        position
    })

    // CRITICAL: Memoize geometries to avoid recreating on every render
    const boxGeometry = useMemo(() => new THREE.BoxGeometry(2, 2, 2), [])
    const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(boxGeometry), [boxGeometry])

    // CRITICAL: Dispose of geometries on unmount to prevent GPU memory leaks
    useEffect(() => {
        return () => {
            boxGeometry.dispose()
            edgesGeometry.dispose()
        }
    }, [boxGeometry, edgesGeometry])

    // Respect custom opacity overrides if passed
    const finalOpacity = opacity !== undefined ? opacity : springProps.opacity

    return (
        <animated.group position={springProps.position as any} scale={springProps.scale}>
            {/* Glassy Cube Mesh */}
            {/* @ts-ignore */}
            <animated.mesh geometry={boxGeometry} castShadow receiveShadow>
                {/* @ts-ignore */}
                <animated.meshStandardMaterial
                    color={springProps.color}
                    emissive={springProps.emissive}
                    emissiveIntensity={springProps.emissiveIntensity}
                    transparent
                    opacity={finalOpacity}
                    roughness={0.3}
                    metalness={0.1}
                    depthWrite={true}
                />
            </animated.mesh>

            {/* Wireframe Edges */}
            <animated.lineSegments geometry={edgesGeometry}>
                {/* @ts-ignore */}
                <lineBasicMaterial color={edgeColor} linewidth={edgeWidth} transparent opacity={0.95} />
            </animated.lineSegments>

            {/* Value Text - Centered, Large Yellow */}
            {!hideLabels && (
                <Text
                    position={valuePlacement === 'top' ? [0, 1.5, 0] : [0, 0, 1.01]} // Slightly forward to prevent Z-fighting
                    fontSize={0.8} // Increased from 0.6 based on user feedback (Slightly larger)
                    color="#fde047" // Yellow-300
                    anchorX="center"
                    anchorY="middle"
                    material-toneMapped={false}
                >
                    {value}
                </Text>
            )}



            {/* 3D Pointer Arrow above the INDEX label */}
            {label && (
                <group position={[0, 2.2, 0]}>
                    {/* Arrow Shaft (Cylinder) */}
                    <mesh position={[0, 0.6, 0]} castShadow>
                        <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
                        <meshStandardMaterial
                            color={resolvedState === 'active_found' ? '#10b981' : (resolvedState === 'active_compare' ? '#fbbf24' : '#00ffff')}
                            emissive={resolvedState === 'active_found' ? '#10b981' : (resolvedState === 'active_compare' ? '#fbbf24' : '#00ffff')}
                            emissiveIntensity={0.6}
                            transparent
                            opacity={0.9}
                        />
                    </mesh>

                    {/* Arrow Head (Cone pointing down) */}
                    <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]} castShadow>
                        <coneGeometry args={[0.18, 0.4, 8]} />
                        <meshStandardMaterial
                            color={resolvedState === 'active_found' ? '#10b981' : (resolvedState === 'active_compare' ? '#fbbf24' : '#00ffff')}
                            emissive={resolvedState === 'active_found' ? '#10b981' : (resolvedState === 'active_compare' ? '#fbbf24' : '#00ffff')}
                            emissiveIntensity={0.6}
                            transparent
                            opacity={0.9}
                        />
                    </mesh>

                    {/* Text Label above Arrow with clean spacing */}
                    <Text
                        position={[0, 1.4, 0]}
                        fontSize={0.5}
                        color={resolvedState === 'active_found' ? '#10b981' : (resolvedState === 'active_compare' ? '#fbbf24' : '#00ffff')}
                        fontWeight="bold"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.03}
                        outlineColor="#000000"
                        material-toneMapped={false}
                    >
                        {label.toUpperCase()}
                    </Text>
                </group>
            )}

            {/* Address Label (Bottom - Below Box) */}
            {showAddress && address !== undefined && (
                <Text
                    position={[0, -1.6, 0]}
                    fontSize={0.2}
                    color="#4ade80" // Green-400
                    anchorX="center"
                    anchorY="middle"
                >
                    {address}
                </Text>
            )}
        </animated.group>
    )
}
