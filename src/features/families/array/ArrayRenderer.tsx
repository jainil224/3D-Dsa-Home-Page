import { useMemo } from 'react'
import { Text as ThreeText } from '@react-three/drei'
import type { Step } from '../../../shared/types/Algorithm'
import { ArrayBox } from '../../../components/3d/ArrayBox'

interface ArrayRendererProps {
    visualData: any
    steps: Step[]
    currentStepIndex: number
}

export const ArrayRenderer = ({ visualData, steps, currentStepIndex }: ArrayRendererProps) => {

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

    const getBoxColor = (_val: string | number, r: number, c: number) => {
        // STRICT NEUTRAL RENDERER
        const STATE_COLOR: Record<string, string> = {
            accessed: '#3b82f6', // BLUE
            processing: '#facc15', // YELLOW
            executed: '#22c55e',   // GREEN
            idle: '#001133'        // Neutral Dark Blue
        };

        // 1. Highlight from Step (State Priority)
        if (currentStep && currentStep.customValues && currentStep.customValues.state) {
            const state = currentStep.customValues.state as string;
            const color = STATE_COLOR[state];

            if (currentStep.rowHighlights?.[r]?.includes(c)) {
                return color;
            }
        }

        // 1b. Fallback to animation types if state is missing
        if (currentStep && currentStep.customValues && currentStep.customValues.animation) {
            const anim = currentStep.customValues.animation;
            if (anim.type === 'cut_move') {
                if (currentStep.rowHighlights?.[r]?.includes(c)) return '#00ffff' // Cyan
            }
            if (anim.type === 'partition_valid') {
                if (currentStep.rowHighlights?.[r]?.includes(c)) return '#84cc16' // Lime
            }
            if (anim.type === 'median_select') {
                if (currentStep.rowHighlights?.[r]?.includes(c)) return '#facc15' // Gold
            }
        }

        // 2. Fallback to Standard Highlights
        if (currentStep) {
            if (currentStep.rowHighlights?.[r]?.includes(c)) return '#00ffff'

            if (currentStep.indices) {
                const isMultiRow = Array.isArray(visualData) && visualData.length > 0 && Array.isArray(visualData[0]);
                let shouldHighlight = false;
                if (isMultiRow) {
                    if (currentStep.indices.length === 2 && currentStep.indices[0] === r && currentStep.indices[1] === c) shouldHighlight = true;
                } else {
                    if (r === 0 && currentStep.indices.includes(c)) shouldHighlight = true;
                }

                if (shouldHighlight) return '#fbbf24';
            }
        }

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
                <group position={[
                    -(matrix[0].length * 2.5) / 2 + 1.25,
                    0,
                    -(matrix.length * 2.5) / 2 + 1.25
                ]}>
                    {matrix.map((row, r) => (
                        row.map((val: string | number, c: number) => (
                            <ArrayBox
                                key={`${r}-${c}`}
                                index={c}
                                value={val}
                                position={[c * 2.5, 0, r * 2.5]}
                                isHighlighted={
                                    (currentStep?.indices?.[0] === r && currentStep?.indices?.[1] === c)
                                }
                                overrideColor={getBoxColor(val, r, c)}
                            />
                        ))
                    ))}
                </group>
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
                            isHighlighted={getHighlight(i)}
                            overrideColor={getBoxColor(val, 0, i)}
                        />
                    ))
                )}
            </group>
        )
    }
}
