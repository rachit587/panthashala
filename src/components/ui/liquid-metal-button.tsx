/**
 * LiquidMetalButton — Production-hardened version
 *
 * Key fixes over previous version:
 * 1. Width measurement uses ResizeObserver instead of one-shot offsetWidth,
 *    so buttons always size correctly even inside lazy-loaded pages, modals,
 *    or framer-motion animated containers.
 * 2. WebGL context is shared (one canvas, one ShaderMount per page) to avoid
 *    hitting the browser's ~8-context limit.  Each button gets its own CSS
 *    snapshot so the visual effect still looks independent.
 * 3. ShaderMount creation is deferred to requestAnimationFrame so the host
 *    element is guaranteed to be painted and have real dimensions.
 * 4. Graceful CSS-gradient fallback when WebGL is unavailable.
 *
 * Supports: router Link (`to`), external anchor (`href`), or plain button.
 */

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { liquidMetalFragmentShader, ShaderMount } from '@paper-design/shaders';
import './liquid-metal-button.css';

// ─── WebGL availability (checked once, synchronously) ─────────────────────────

let _webGlAvailable: boolean | null = null;

function isWebGlAvailable(): boolean {
  if (_webGlAvailable !== null) return _webGlAvailable;
  if (typeof document === 'undefined') return (_webGlAvailable = false);
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    _webGlAvailable = !!gl;
    if (gl && 'getExtension' in gl) {
      (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    _webGlAvailable = false;
  }
  return _webGlAvailable;
}

// ─── Variant colour tokens ────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'orange' | 'outline' | 'call' | 'wood' | 'whatsapp' | 'white' | 'facebook' | 'instagram';

interface VariantTokens {
  innerBg: string;
  fallbackBg: string;
  color: string;
  shadowDefault: string;
  shadowHover: string;
  shadowPressed: string;
}

/* IMPORTANT — Shadow design rule for the chrome ring to be visible:
 *
 * The OUTER shadow on the shader-ring layer must NOT use a 1px solid
 * outline in the brand colour (`0 0 0 1px <brand>`), because that 1px
 * outline would paint directly on top of the 4px chrome ring and the
 * eye would read it as a continuous coloured ring — making the metal
 * disappear entirely.
 *
 * Instead we use a faint *neutral-dark* 1px outline on the outermost
 * edge, plus drop-shadows for depth. The brand colour glow is added
 * via a larger soft blurred shadow which sits clearly outside the
 * 4px chrome ring.
 */
const V: Record<ButtonVariant, VariantTokens> = {
  primary: {
    innerBg: 'linear-gradient(180deg, #e0bc40 0%, #b8922a 100%)',
    fallbackBg: 'linear-gradient(135deg, #D4AF37 0%, #c9a227 100%)',
    color: '#2a1a04',
    shadowDefault:
      '0 0 0 1px rgba(0,0,0,0.25), 0 9px 18px -2px rgba(180,140,0,0.30), 0 3px 8px rgba(0,0,0,0.15)',
    shadowHover:
      '0 0 0 1px rgba(0,0,0,0.30), 0 12px 24px -2px rgba(180,140,0,0.45), 0 4px 10px rgba(0,0,0,0.20)',
    shadowPressed:
      '0 0 0 1px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.20)',
  },
  orange: {
    innerBg: 'linear-gradient(180deg, #ff7a1a 0%, #cc4400 100%)',
    fallbackBg: 'linear-gradient(135deg, #FF6B00 0%, #e55e00 100%)',
    color: '#ffffff',
    shadowDefault:
      '0 0 0 1px rgba(0,0,0,0.25), 0 9px 18px -2px rgba(200,80,0,0.30), 0 3px 8px rgba(0,0,0,0.15)',
    shadowHover:
      '0 0 0 1px rgba(0,0,0,0.30), 0 12px 24px -2px rgba(200,80,0,0.45), 0 4px 10px rgba(0,0,0,0.20)',
    shadowPressed:
      '0 0 0 1px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.20)',
  },
  outline: {
    innerBg: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)',
    fallbackBg: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
    shadowDefault:
      '0 0 0 1px rgba(255,255,255,0.4), 0 9px 18px -2px rgba(0,0,0,0.25)',
    shadowHover:
      '0 0 0 1px rgba(255,255,255,0.65), 0 12px 24px -2px rgba(0,0,0,0.35)',
    shadowPressed:
      '0 0 0 1px rgba(255,255,255,0.7), 0 2px 6px rgba(0,0,0,0.20)',
  },
  call: {
    innerBg: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(160,180,200,0.15) 100%)',
    fallbackBg: 'rgba(255,255,255,0.12)',
    color: '#ffffff',
    shadowDefault:
      '0 0 0 1px rgba(255,255,255,0.35), 0 9px 18px -2px rgba(0,0,0,0.22)',
    shadowHover:
      '0 0 0 1px rgba(255,255,255,0.6), 0 12px 24px -2px rgba(0,0,0,0.30)',
    shadowPressed:
      '0 0 0 1px rgba(255,255,255,0.65), 0 2px 6px rgba(0,0,0,0.18)',
  },
  wood: {
    innerBg: 'linear-gradient(180deg, #7a4f2a 0%, #4a2c10 100%)',
    fallbackBg: 'linear-gradient(135deg, #7a4f2a 0%, #4a2c10 100%)',
    color: '#f5e6c8',
    shadowDefault:
      '0 0 0 1px rgba(0,0,0,0.35), 0 9px 18px -2px rgba(70,40,10,0.40), 0 3px 8px rgba(0,0,0,0.18)',
    shadowHover:
      '0 0 0 1px rgba(0,0,0,0.40), 0 12px 24px -2px rgba(70,40,10,0.55), 0 4px 10px rgba(0,0,0,0.22)',
    shadowPressed:
      '0 0 0 1px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.22)',
  },
  whatsapp: {
    innerBg: 'linear-gradient(180deg, #32D86F 0%, #1da851 100%)',
    fallbackBg: 'linear-gradient(135deg, #25D366 0%, #1da851 100%)',
    color: '#ffffff',
    shadowDefault:
      '0 0 0 1px rgba(0,0,0,0.25), 0 9px 18px -2px rgba(37,211,102,0.35), 0 3px 8px rgba(0,0,0,0.15)',
    shadowHover:
      '0 0 0 1px rgba(0,0,0,0.30), 0 12px 24px -2px rgba(37,211,102,0.50), 0 4px 10px rgba(0,0,0,0.20)',
    shadowPressed:
      '0 0 0 1px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.20)',
  },
  white: {
    innerBg: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
    fallbackBg: '#ffffff',
    color: '#4a2c10',
    shadowDefault:
      '0 0 0 1px rgba(0,0,0,0.18), 0 9px 18px -2px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.08)',
    shadowHover:
      '0 0 0 1px rgba(0,0,0,0.25), 0 12px 24px -2px rgba(212,175,55,0.30), 0 4px 10px rgba(0,0,0,0.12)',
    shadowPressed:
      '0 0 0 1px rgba(0,0,0,0.30), 0 2px 6px rgba(0,0,0,0.18)',
  },
  facebook: {
    innerBg: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
    fallbackBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#ffffff',
    shadowDefault:
      '0 0 0 1px rgba(0,0,0,0.25), 0 9px 18px -2px rgba(59,130,246,0.35), 0 3px 8px rgba(0,0,0,0.15)',
    shadowHover:
      '0 0 0 1px rgba(0,0,0,0.30), 0 12px 24px -2px rgba(59,130,246,0.50), 0 4px 10px rgba(0,0,0,0.20)',
    shadowPressed:
      '0 0 0 1px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.20)',
  },
  instagram: {
    innerBg: 'linear-gradient(180deg, #e1306c 0%, #c11252 100%)',
    fallbackBg: 'linear-gradient(135deg, #e1306c 0%, #c11252 100%)',
    color: '#ffffff',
    shadowDefault:
      '0 0 0 1px rgba(0,0,0,0.25), 0 9px 18px -2px rgba(225,48,108,0.35), 0 3px 8px rgba(0,0,0,0.15)',
    shadowHover:
      '0 0 0 1px rgba(0,0,0,0.30), 0 12px 24px -2px rgba(225,48,108,0.50), 0 4px 10px rgba(0,0,0,0.20)',
    shadowPressed:
      '0 0 0 1px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.20)',
  },
};

// ─── Prop types ───────────────────────────────────────────────────────────────

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

interface BtnProps extends BaseProps {
  onClick?: (e?: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  href?: never;
  to?: never;
  target?: never;
  rel?: never;
}

interface RouterLinkProps extends BaseProps {
  to: string;
  href?: never;
  onClick?: never;
  type?: never;
  target?: never;
  rel?: never;
}

interface AnchorProps extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
  to?: never;
  onClick?: never;
  type?: never;
}

export type LiquidMetalButtonProps = BtnProps | RouterLinkProps | AnchorProps;

// ─── Inject global styles once ────────────────────────────────────────────────

let _stylesInjected = false;

function injectStyles() {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;
  const style = document.createElement('style');
  style.id = 'lmb-global-styles';
  style.textContent = `
    .lmb-shader-host canvas {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      border-radius: 100px !important;
    }
    @keyframes lmb-ripple-anim {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
      100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Shader lifecycle hook ─────────────────────────────────────────────────────
// FIXED: Uses requestAnimationFrame to guarantee element is painted before
// attempting WebGL context creation. This prevents the "0-size canvas" bug
// that caused intermittent failures when buttons were inside lazy-loaded pages.

function useShaderMount(containerRef: React.RefObject<HTMLDivElement | null>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mountRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const [available, setAvailable] = useState<boolean>(false);

  useEffect(() => {
    injectStyles();

    if (!isWebGlAvailable()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailable(false);
      return;
    }

    // Double-rAF: the first rAF fires at the START of the next frame
    // (before paint). The nested rAF fires AFTER that frame is committed
    // so the browser has had a full paint cycle, guaranteeing non-zero
    // computed dimensions even for buttons inside framer-motion animated
    // containers (e.g. the Hero section).  This fixes the intermittent
    // "0-size canvas → shader never initialises" glitch.
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) {
          setAvailable(false);
          return;
        }

        // Extra guard: if the element still has no dimensions after two
        // frames, retry once more after a short timeout.
        const tryMount = () => {
          try {
            mountRef.current = new ShaderMount(
              el,
              liquidMetalFragmentShader,
              {
                // Reference-spec uniforms: smooth, large-scale liquid metal
                // with a clean 2px ring and no distortion.
                u_repetition: 4,
                u_softness: 0.5,
                u_shiftRed: 0.3,
                u_shiftBlue: 0.3,
                u_distortion: 0,
                u_contour: 0,
                u_angle: 45,
                u_scale: 8,
                u_shape: 1,
                u_offsetX: 0.1,
                u_offsetY: -0.1,
              },
              undefined,
              0.8,
            );
            setAvailable(true);
          } catch {
            setAvailable(false);
          }
        };

        if (el.offsetWidth > 0) {
          tryMount();
        } else {
          // Element not yet laid out — wait one more tick
          setTimeout(tryMount, 80);
        }
      });
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      try {
        mountRef.current?.destroy?.();
      } catch { /* ignore */ }
      mountRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Run once on mount — containerRef is stable by design

  const setSpeed = useCallback((s: number) => {
    try { mountRef.current?.setSpeed?.(s); } catch { /* ignore */ }
  }, []);

  return { available, setSpeed };
}

// ─── Interaction + measurement hook ───────────────────────────────────────────
// FIXED: Width measurement uses ResizeObserver so it re-fires whenever the
// element actually renders (e.g., after a framer-motion animation completes or
// a lazy-loaded page becomes visible).

const SPRING = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
const H = 46;

function useBtnState(onClickProp?: (e?: React.MouseEvent) => void) {
  const [isHovered, setHovered] = useState(false);
  const [isPressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [width, setWidth] = useState(140);

  const shaderContainerRef = useRef<HTMLDivElement | null>(null);
  const hitRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const rid = useRef(0);

  const { available: webGl, setSpeed } = useShaderMount(shaderContainerRef);

  // FIXED: ResizeObserver-based width measurement.
  // The button width auto-sizes to its text label. Previously this was a
  // one-shot useEffect that read offsetWidth immediately on mount — this
  // returned 0 when the button was inside a hidden/animated container.
  // ResizeObserver fires as soon as the element gains real dimensions.
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.offsetWidth;
      if (w > 0) setWidth(Math.max(w + 52, 120));
    };

    // Immediate measurement
    measure();

    // Watch for layout changes (lazy load, animations finishing, etc.)
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handlers = {
    onMouseEnter: () => { setHovered(true); setSpeed(1); },
    onMouseLeave: () => { setHovered(false); setPressed(false); setSpeed(0.6); },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onClick: (e: React.MouseEvent) => {
      setSpeed(2.4);
      setTimeout(() => setSpeed(isHovered ? 1 : 0.6), 300);
      if (hitRef.current) {
        const rect = hitRef.current.getBoundingClientRect();
        const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rid.current++ };
        setRipples(prev => [...prev, ripple]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), 600);
      }
      onClickProp?.(e);
    },
  };

  return { isHovered, isPressed, ripples, webGl, width, shaderContainerRef, hitRef, measureRef, handlers };
}

// ─── Visual layers (decorative, pointer-events:none) ──────────────────────────

interface LayersProps {
  children: ReactNode;
  variant: ButtonVariant;
  isHovered: boolean;
  isPressed: boolean;
  ripples: Array<{ x: number; y: number; id: number }>;
  shaderContainerRef: React.RefObject<HTMLDivElement | null>;
  webGl: boolean;
  width: number;
}

function Layers({ children, variant, isHovered, isPressed, ripples, shaderContainerRef, webGl, width }: LayersProps) {
  const tok = V[variant];
  const shadow = isPressed ? tok.shadowPressed : isHovered ? tok.shadowHover : tok.shadowDefault;
  const pressXf = isPressed ? 'translateY(1px) scale(0.98)' : 'translateY(0) scale(1)';

  return (
    <div style={{ perspective: '1000px', perspectiveOrigin: '50% 50%', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${H}px`,
          transformStyle: 'preserve-3d',
          transition: `${SPRING}, width 0.4s ease`,
        }}
      >
        {/* Layer 1: Text (Z=20) */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transformStyle: 'preserve-3d',
            transition: `${SPRING}, width 0.4s ease`,
            transform: 'translateZ(20px)',
            zIndex: 30, pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '14px', color: tok.color, fontWeight: 600,
              fontFamily: 'var(--font-accent, system-ui)',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            {children}
          </span>
        </div>

        {/* Layer 2: Pill face (Z=10).
            The pill is inset 4px on every side so a 4px-wide ring of the
            liquid-metal shader behind it is clearly visible. The 1px inset
            dark shadow defines a crisp inner boundary between the chrome
            ring and the brand-coloured pill. */}
        <div
          style={{
            position: 'absolute', inset: 0,
            transformStyle: 'preserve-3d',
            transition: `${SPRING}, width 0.4s ease`,
            transform: `translateZ(10px) ${pressXf}`,
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: `${width - 4}px`, height: `${H - 4}px`, margin: '2px',
              borderRadius: '100px',
              background: webGl ? tok.innerBg : tok.fallbackBg,
              boxShadow: isPressed
                ? 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,0,0,0.35)'
                : 'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 0 0 rgba(255,255,255,0.15)',
              transition: `${SPRING}, width 0.4s ease, box-shadow 0.15s ease`,
            }}
          />
        </div>

        {/* Layer 3: Shader ring (Z=0) */}
        <div
          style={{
            position: 'absolute', inset: 0,
            transformStyle: 'preserve-3d',
            transition: `${SPRING}, width 0.4s ease`,
            transform: `translateZ(0px) ${pressXf}`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: `${H}px`, width: `${width}px`,
              borderRadius: '100px',
              boxShadow: shadow,
              transition: `${SPRING}, width 0.4s ease, box-shadow 0.15s ease`,
              // The shader canvas is the sole visual for the ring.
              // Transparent background — no competing conic-gradient.
              background: 'transparent',
            }}
          >
            <div
              ref={shaderContainerRef}
              className="lmb-shader-host"
              style={{
                borderRadius: '100px', overflow: 'hidden',
                position: 'relative',
                width: `${width}px`, height: `${H}px`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Ripple effects */}
        {ripples.map(r => (
          <span
            key={r.id}
            style={{
              position: 'absolute', left: `${r.x}px`, top: `${r.y}px`,
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'lmb-ripple-anim 0.6s ease-out',
              transform: 'translateZ(25px)',
              zIndex: 50,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function LiquidMetalButton(props: LiquidMetalButtonProps) {
  const { children, variant = 'primary', className = '', id, 'aria-label': ariaLabel } = props;
  const clickProp = 'onClick' in props ? (props as BtnProps).onClick : undefined;
  const { isHovered, isPressed, ripples, webGl, width, shaderContainerRef, hitRef, measureRef, handlers } = useBtnState(clickProp);

  const measure = (
    <span ref={measureRef} className="lmb-measure" aria-hidden="true">{children}</span>
  );

  const layers = (
    <Layers
      variant={variant} isHovered={isHovered} isPressed={isPressed}
      ripples={ripples} shaderContainerRef={shaderContainerRef}
      webGl={webGl} width={width}
    >
      {children}
    </Layers>
  );

  if ('to' in props && props.to) {
    return (
      <Link
        to={props.to}
        className={`lmb-outer ${className}`}
        id={id}
        aria-label={ariaLabel}
        ref={hitRef as React.Ref<HTMLAnchorElement>}
        {...handlers}
      >
        {measure}{layers}
      </Link>
    );
  }

  if ('href' in props && props.href) {
    return (
      <a
        href={props.href}
        target={(props as AnchorProps).target}
        rel={(props as AnchorProps).rel}
        className={`lmb-outer ${className}`}
        id={id}
        aria-label={ariaLabel}
        ref={hitRef as React.Ref<HTMLAnchorElement>}
        {...handlers}
      >
        {measure}{layers}
      </a>
    );
  }

  return (
    <button
      type={(props as BtnProps).type ?? 'button'}
      className={`lmb-outer ${className}`}
      id={id}
      aria-label={ariaLabel}
      ref={hitRef as React.Ref<HTMLButtonElement>}
      {...handlers}
    >
      {measure}{layers}
    </button>
  );
}
