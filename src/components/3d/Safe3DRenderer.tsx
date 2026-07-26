import { Canvas, type CanvasProps } from '@react-three/fiber'
import { useEffect, useState, useRef, useCallback } from 'react'

interface Safe3DRendererProps extends CanvasProps {
    loadingMessage?: string
    className?: string
}

export const Safe3DRenderer = ({
    children,
    loadingMessage = "Initializing Visualization...",
    className = "",
    onCreated,
    ...props
}: Safe3DRendererProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [canRender, setCanRender] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [contextLostCount, setContextLostCount] = useState(0)
    const retryTimeoutRef = useRef<any>(null)

    // 1. Monitor container size
    useEffect(() => {
        if (!containerRef.current) return

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (entry) {
                const { width, height } = entry.contentRect

                // Only enable rendering if we have valid dimensions
                if (width > 0 && height > 0) {
                    setDimensions({ width, height })

                    // Small delay to ensure layout is stable
                    requestAnimationFrame(() => {
                        setCanRender(true)
                    })
                }
            }
        })

        const currentContainer = containerRef.current
        observer.observe(currentContainer)

        return () => {
            observer.disconnect()
            setCanRender(false)

            // Clean up context handlers if they exist
            const canvas = currentContainer?.querySelector('canvas')
            if (canvas && (canvas as any).__contextHandlersCleanup) {
                (canvas as any).__contextHandlersCleanup()
            }

            // Clear any pending retry
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current)
            }
        }
    }, [])

    // 2. Delayed visibility trigger (avoids "flash" of unstyled content)
    useEffect(() => {
        if (canRender) {
            const timer = requestAnimationFrame(() => {
                setIsVisible(true)
            })
            return () => cancelAnimationFrame(timer)
        } else {
            setIsVisible(false)
        }
    }, [canRender])

    // 3. Tab Visibility Handler - Force refresh when tab becomes active
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && canRender) {
                if (containerRef.current) {
                    const { width, height } = containerRef.current.getBoundingClientRect()
                    if (width !== dimensions.width || height !== dimensions.height) {
                        setDimensions({ width, height })
                    }
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [canRender, dimensions])

    // 4. Custom onCreated handler to force initial frame + add context handlers
    const handleCreated = useCallback((state: any) => {
        state.gl.setSize(dimensions.width, dimensions.height)
        state.camera.aspect = dimensions.width / dimensions.height
        state.camera.updateProjectionMatrix()

        state.gl.render(state.scene, state.camera)

        const canvas = state.gl.domElement

        const handleContextLost = (event: Event) => {
            event.preventDefault()
            console.warn('[Safe3DRenderer] WebGL context lost - preventing default behavior')
            setContextLostCount(prev => prev + 1)
        }

        const handleContextRestored = () => {
            console.warn('[Safe3DRenderer] WebGL context restored - attempting recovery')

            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current)
            }

            retryTimeoutRef.current = setTimeout(() => {
                setCanRender(false)
                requestAnimationFrame(() => {
                    setCanRender(true)
                    setContextLostCount(0)
                })
            }, 100)
        }

        canvas.addEventListener('webglcontextlost', handleContextLost)
        canvas.addEventListener('webglcontextrestored', handleContextRestored)

        canvas.__contextHandlersCleanup = () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost)
            canvas.removeEventListener('webglcontextrestored', handleContextRestored)
        }

        if (onCreated) {
            onCreated(state)
        }
    }, [dimensions, onCreated])

    if (contextLostCount > 3) {
        return (
            <div className={`relative w-full h-full ${className}`}>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-red-400 p-8">
                    <h3 className="text-lg font-bold mb-2">WebGL Context Lost</h3>
                    <p className="text-sm text-slate-400 text-center max-w-md">
                        Your browser lost the WebGL context multiple times.
                    </p>
                    <button
                        onClick={() => {
                            setContextLostCount(0)
                            setCanRender(false)
                            requestAnimationFrame(() => setCanRender(true))
                        }}
                        className="mt-6 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div ref={containerRef} className={`relative w-full h-full ${className}`}>
            {(!canRender || !isVisible) && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/50 backdrop-blur-sm text-cyan-400">
                    <span className="text-xs font-bold tracking-widest uppercase">{loadingMessage}</span>
                </div>
            )}

            {canRender && (
                <div className={`w-full h-full transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <Canvas
                        {...props}
                        onCreated={handleCreated}
                        resize={{ debounce: 0, scroll: false }}
                    >
                        {children}
                    </Canvas>
                </div>
            )}
        </div>
    )
}
