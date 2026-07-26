import { useMemo } from 'react'
import { ArrayBox } from '../3d/ArrayBox'
import { Text as ThreeText } from '@react-three/drei'
import type { Step } from '../../shared/types/Algorithm'

interface DefaultArrayVisualizerProps {
    visualData: any
    steps: Step[]
    currentStepIndex: number
}

export const DefaultArrayVisualizer = ({ visualData, steps, currentStepIndex }: DefaultArrayVisualizerProps) => {

    const currentStep = (currentStepIndex >= 0 && currentStepIndex < steps.length) ? steps[currentStepIndex] : null

    // Derived Grid State for Mutations
    const derivedGrid = useMemo(() => {
        if (!Array.isArray(visualData)) return null

        // Detect Matrix Mode: Single argument which is a 2D array
        const isMatrix = visualData.length === 1 && Array.isArray(visualData[0]) && Array.isArray(visualData[0][0])

        if (isMatrix) {
            // Deep copy the matrix (visualData[0])
            const matrix = (visualData[0] as any[][]).map(row => [...row])
            const gridWrapper = [matrix]

            if (!steps.length || currentStepIndex < 0) return gridWrapper

            for (let i = 0; i <= currentStepIndex; i++) {
                const s = steps[i]
                if (s.type === 'MUTATE_GRID' && s.indices && s.indices.length === 2 && s.value !== undefined) {
                    const [r, c] = s.indices
                    if (gridWrapper[0][r] && gridWrapper[0][r][c] !== undefined) {
                        gridWrapper[0][r][c] = s.value
                    }
                }
            }
            return gridWrapper
        }

        // Standard Multi-Array or Single-Array (Non-Matrix)
        if (visualData.length > 0 && !Array.isArray(visualData[0])) {
            // 1D Array of primitives - just shallow copy
            return [...visualData]
        }

        const grid = (visualData as any[][]).map(row => [...row])
        return grid
    }, [visualData, steps, currentStepIndex])

    const getHighlight = (index: number) => {
        if (!currentStep || !currentStep.indices) return false
        return currentStep.indices.includes(index)
    }

    const getBoxColor = (val: string | number, r: number, c: number) => {
        const isMultiRow = Array.isArray(visualData) && visualData.length > 0 && Array.isArray(visualData[0])

        // STRICT MEDIAN GUARD
        if (isMultiRow) {
            const phase = (currentStep as any)?.phase
            if (phase === 'valid') {
                return '#22c55e' // Green
            }
            if (phase === 'search') {
                if (currentStep?.rowHighlights?.[r]?.includes(c)) return '#00ffff' // Cyan
                if (currentStep?.indices?.[0] === r && currentStep?.indices?.[1] === c) return '#fbbf24' // Yellow (Pointer)

                return undefined // Neutral
            }
        }

        // 1. Highlight from Step
        if (currentStep) {
            if (currentStep.indices) {
                let shouldHighlight = false

                if (isMatrix) {
                    if (currentStep.indices[0] === r && currentStep.indices[1] === c) shouldHighlight = true
                } else {
                    if (currentStep.indices.includes(c)) shouldHighlight = true
                }

                if (shouldHighlight) {
                    if (currentStep.type === 'POINTER') return '#fbbf24' // Yellow for scan/check
                    if (currentStep.type === 'FOUND') return '#22c55e' // Green for Land Found
                    if (currentStep.type === 'MUTATE_GRID') return '#3b82f6' // Blue for Water/Sunken
                    if (currentStep.type === 'DFS_CALL') return '#a855f7' // Purple for DFS
                }
            }
        }

        // 2. Base Color based on Value (Land vs Water)
        if (val === '1' || val === 1) return '#15803d' // Dark Green Land
        if (val === '0' || val === 0) return '#1e3a8a' // Dark Blue Water

        // 3. Default row highlights (Cyan)
        if (currentStep?.rowHighlights?.[r]?.includes(c)) return '#00ffff'

        return undefined
    }

    // Render Logic
    const rawData = derivedGrid || visualData
    if (!Array.isArray(rawData)) return null

    const isMatrix = rawData.length === 1 && Array.isArray(rawData[0]) && Array.isArray(rawData[0][0])

    if (isMatrix) {
        // MATRIX MODE (2D Grid)
        const matrix = rawData[0] as any[][]
        return (
            <group>
                {/* Centered Grid Container */}
                <group position={[
                    -(matrix[0].length * 2.5) / 2 + 1.25, // Center X
                    0, // Center Y (relative)
                    -(matrix.length * 2.5) / 2 + 1.25  // Center Z
                ]}>
                    {matrix.map((row, r) => (
                        row.map((val: string | number, c: number) => (
                            <ArrayBox
                                key={`${r}-${c}`}
                                index={c}
                                value={val}
                                position={[c * 2.5, 0, r * 2.5]}
                                isOpen={false}
                                isHighlighted={
                                    (currentStep?.indices?.[0] === r && currentStep?.indices?.[1] === c) ||
                                    (currentStep?.type === 'POINTER' && currentStep?.indices?.[0] === r && currentStep?.indices?.[1] === c)
                                }
                                overrideColor={getBoxColor(val, r, c)}
                                valuePlacement="top"
                            />
                        ))
                    ))}
                </group>

                {/* Label axes */}
                <ThreeText position={[-((matrix[0].length * 2.5) / 2 + 1), 0, -((matrix.length * 2.5) / 2 + 1)]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#94a3b8">
                    (0,0)
                </ThreeText>
            </group>
        )
    } else {
        // STANDARD ARRAY / MULTI-ARRAY MODE
        return (
            <group>
                {(rawData as any[][]).length > 0 && Array.isArray(rawData[0]) && Array.isArray((rawData as any[])[0]) ? (
                    (rawData as any[]).map((row: any[], rowIndex: number) => (
                        <group key={rowIndex} position={[-(row.length * 2.5) / 2 + 1.25, (rawData.length - rowIndex * 2.5), 0]}>
                            <ThreeText position={[-2, 0, 0]} fontSize={0.4} color="#64748b" anchorX="right">{rowIndex}</ThreeText>

                            {row.map((val: number | string, c: number) => (
                                <ArrayBox
                                    key={`${rowIndex}-${c}`}
                                    index={c}
                                    value={val}
                                    position={[c * 2.5, 0, 0]}
                                    isOpen={false}
                                    isHighlighted={
                                        (currentStep?.rowHighlights?.[rowIndex]?.includes(c)) ||
                                        (currentStep?.indices?.[0] === rowIndex && currentStep?.indices?.[1] === c)
                                    }
                                    overrideColor={getBoxColor(val, rowIndex, c)}
                                />
                            ))}
                        </group>
                    ))
                ) : (
                    (rawData as any[]).map((val: number | string, i: number) => (
                        <ArrayBox
                            key={i}
                            index={i}
                            value={val}
                            position={[i * 2.5 - (rawData.length * 2.5) / 2, 0, 0]}
                            isOpen={false}
                            isHighlighted={getHighlight(i)}
                            overrideColor={getBoxColor(val, 0, i)}
                        />
                    ))
                )}
            </group>
        )
    }
}
