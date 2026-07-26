import { useSpring } from '@react-spring/three'
import { useMemo } from 'react'

export type NodeVisualState =
    | 'idle'
    | 'visited'
    | 'active_pointer'
    | 'active_compare'
    | 'active_found'
    | 'inserting'
    | 'deleting'
    | 'active_error'

interface UseNodeAnimationProps {
    state: NodeVisualState
    position: [number, number, number]
}

export function useNodeAnimation({ state, position }: UseNodeAnimationProps) {
    // Determine target styles based on the state
    const styles = useMemo(() => {
        switch (state) {
            case 'visited':
                return {
                    color: '#020617',
                    emissive: '#0ea5e9',
                    emissiveIntensity: 0.15,
                    scale: 1.0,
                    opacity: 0.4,
                    edgeColor: '#38bdf8',
                    edgeWidth: 1.5,
                    config: { tension: 100, friction: 25 } // Muted transitions
                }
            case 'active_pointer':
                return {
                    color: '#0284c7',
                    emissive: '#38bdf8',
                    emissiveIntensity: 0.6,
                    scale: 1.15,
                    opacity: 0.85,
                    edgeColor: '#00f0ff',
                    edgeWidth: 2.5,
                    config: { tension: 260, friction: 20 } // Responsive snap
                }
            case 'active_compare':
                return {
                    color: '#b45309',
                    emissive: '#fbbf24',
                    emissiveIntensity: 0.6,
                    scale: 1.15,
                    opacity: 0.85,
                    edgeColor: '#fde047',
                    edgeWidth: 2.5,
                    config: { tension: 200, friction: 12 } // Underdamped bounce
                }
            case 'active_found':
                return {
                    color: '#047857',
                    emissive: '#34d399',
                    emissiveIntensity: 0.7,
                    scale: 1.2,
                    opacity: 0.9,
                    edgeColor: '#4ade80',
                    edgeWidth: 3.0,
                    config: { tension: 220, friction: 14 } // High energy success pulse
                }
            case 'inserting':
                return {
                    color: '#020617',
                    emissive: '#00f0ff',
                    emissiveIntensity: 0.2,
                    scale: 1.0,
                    opacity: 0.5,
                    edgeColor: '#00f0ff',
                    edgeWidth: 1.5,
                    config: { tension: 150, friction: 18 }
                }
            case 'deleting':
                return {
                    color: '#000000',
                    emissive: '#000000',
                    emissiveIntensity: 0.0,
                    scale: 0.0,
                    opacity: 0.0,
                    edgeColor: '#334155',
                    edgeWidth: 1.0,
                    config: { tension: 120, friction: 20 }
                }
            case 'active_error':
                return {
                    color: '#7f1d1d',
                    emissive: '#ef4444',
                    emissiveIntensity: 0.8,
                    scale: 1.15,
                    opacity: 1.0,
                    edgeColor: '#ef4444',
                    edgeWidth: 2.5,
                    config: { tension: 200, friction: 12 }
                }
            case 'idle':
            default:
                return {
                    color: '#000000',
                    emissive: '#000000',
                    emissiveIntensity: 0.0,
                    scale: 1.0,
                    opacity: 0.85,
                    edgeColor: '#00f0ff',
                    edgeWidth: 1.5,
                    config: { tension: 120, friction: 22 } // Natural rest state
                }
        }
    }, [state])

    const fromValues = useMemo(() => {
        if (state === 'inserting') {
            return {
                color: '#0f172a',
                emissive: '#000000',
                emissiveIntensity: 0,
                scale: 0.0,
                opacity: 0.0,
                position: [position[0], position[1] - 1, position[2]] // Rise from slightly below
            }
        }
        return null
    }, [state])

    const springProps = useSpring({
        to: {
            color: styles.color,
            emissive: styles.emissive,
            emissiveIntensity: styles.emissiveIntensity,
            scale: styles.scale,
            opacity: styles.opacity,
            position: position
        },
        from: fromValues || undefined,
        config: styles.config
    })

    return {
        springProps,
        edgeColor: styles.edgeColor,
        edgeWidth: styles.edgeWidth
    }
}
