/**
 * LiquidMetalButton
 *
 * Integrates @paper-design/shaders ShaderMount with the liquidMetalFragmentShader
 * for an authentic liquid-metal effect, while preserving the site's brand colors.
 *
 * SAFETY: WebGL availability is checked BEFORE creating ShaderMount so that
 * environments without WebGL (headless browsers, old devices) get a graceful
 * CSS-gradient fallback instead of a thrown error that crashes React.
 *
 * Supports: router Link (`to`), external anchor (`href`), or plain button.
 */

import { liquidMetalFragmentShader, ShaderMount } from '@paper-design/shaders';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './liquid-metal-button.css';

// ─── WebGL availability (checked once, synchronously) ─────────────────────────

let _webGlAvailable: boolean | null = null;

function isWebGlAvailable(): boolean {
  if (_webGlAvailable !== null) return _webGlAvailable;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    _webGlAvailable = !!gl;
    // Clean up the test context
    if (gl && 'getExtension' in gl) {
      const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
      ext?.loseContext();
    }
  } catch {
    _webGlAvailable = false;
  }
  return _webGlAvailable;
}

// ─── Variant colour tokens ────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'orange' | 'outline' | 'call' | 'wood' | 'whatsapp' | 'white' | 'facebook' | 'instagram';

interface VariantTokens {
  innerBg: string;     // pill face gradient (Z=10 layer)
  fallbackBg: string;  // CSS-only fallback when WebGL unavailable
  color: string;       // text colour
  shadowDefault: string;
  shadowHover: string;
  shadowPressed: string;
}

const V: Record<ButtonVariant, VariantTokens> = {
  primary: {
    innerBg: 'linear-gradient(180deg, #e0bc40 0%, #b8922a 100%)',
    fallbackBg: 'linear-gradient(135deg, #D4AF37 0%, #c9a227 100%)',
    color: '#2a1a04',
    shadowDefault:
      '0px 0px 0px 1px rgba(180,140,0,0.4), 0px 36px 14px 0px rgba(180,140,0,0.02), 0px 20px 12px 0px rgba(180,140,0,0.08), 0px 9px 9px 0px rgba(180,140,0,0.12), 0px 2px 5px 0px rgba(180,140,0,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(180,140,0,0.5), 0px 12px 6px 0px rgba(180,140,0,0.08), 0px 8px 5px 0px rgba(180,140,0,0.15), 0px 4px 4px 0px rgba(180,140,0,0.2), 0px 1px 2px 0px rgba(180,140,0,0.25)',
    shadowPressed:
      '0px 0px 0px 1px rgba(180,140,0,0.6), 0px 1px 2px 0px rgba(180,140,0,0.3)',
  },
  orange: {
    innerBg: 'linear-gradient(180deg, #ff7a1a 0%, #cc4400 100%)',
    fallbackBg: 'linear-gradient(135deg, #FF6B00 0%, #e55e00 100%)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(200,80,0,0.4), 0px 36px 14px 0px rgba(200,80,0,0.02), 0px 20px 12px 0px rgba(200,80,0,0.08), 0px 9px 9px 0px rgba(200,80,0,0.12), 0px 2px 5px 0px rgba(200,80,0,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(200,80,0,0.5), 0px 12px 6px 0px rgba(200,80,0,0.08), 0px 8px 5px 0px rgba(200,80,0,0.15), 0px 4px 4px 0px rgba(200,80,0,0.2), 0px 1px 2px 0px rgba(200,80,0,0.25)',
    shadowPressed:
      '0px 0px 0px 1px rgba(200,80,0,0.6), 0px 1px 2px 0px rgba(200,80,0,0.3)',
  },
  outline: {
    innerBg: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)',
    fallbackBg: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(255,255,255,0.3), 0px 9px 9px 0px rgba(0,0,0,0.12), 0px 2px 5px 0px rgba(0,0,0,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(255,255,255,0.55), 0px 8px 5px 0px rgba(0,0,0,0.1), 0px 4px 4px 0px rgba(0,0,0,0.15)',
    shadowPressed:
      '0px 0px 0px 1px rgba(255,255,255,0.6), inset 0 2px 4px rgba(0,0,0,0.2)',
  },
  call: {
    innerBg: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(160,180,200,0.15) 100%)',
    fallbackBg: 'rgba(255,255,255,0.12)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(255,255,255,0.25), 0px 9px 9px 0px rgba(0,0,0,0.1), 0px 2px 5px 0px rgba(0,0,0,0.12)',
    shadowHover:
      '0px 0px 0px 1px rgba(255,255,255,0.5), 0px 8px 5px 0px rgba(0,0,0,0.08), 0px 4px 4px 0px rgba(0,0,0,0.12)',
    shadowPressed:
      '0px 0px 0px 1px rgba(255,255,255,0.55), inset 0 2px 4px rgba(0,0,0,0.15)',
  },
  wood: {
    innerBg: 'linear-gradient(180deg, #7a4f2a 0%, #4a2c10 100%)',
    fallbackBg: 'linear-gradient(135deg, #7a4f2a 0%, #4a2c10 100%)',
    color: '#f5e6c8',
    shadowDefault:
      '0px 0px 0px 1px rgba(80,40,0,0.4), 0px 9px 9px 0px rgba(80,40,0,0.12), 0px 2px 5px 0px rgba(80,40,0,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(80,40,0,0.5), 0px 8px 5px 0px rgba(80,40,0,0.15), 0px 4px 4px 0px rgba(80,40,0,0.2)',
    shadowPressed:
      '0px 0px 0px 1px rgba(80,40,0,0.6), 0px 1px 2px 0px rgba(80,40,0,0.3)',
  },
  whatsapp: {
    innerBg: 'linear-gradient(180deg, #32D86F 0%, #1da851 100%)',
    fallbackBg: 'linear-gradient(135deg, #25D366 0%, #1da851 100%)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(37,211,102,0.4), 0px 9px 9px 0px rgba(37,211,102,0.12), 0px 2px 5px 0px rgba(37,211,102,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(37,211,102,0.5), 0px 8px 5px 0px rgba(37,211,102,0.15), 0px 4px 4px 0px rgba(37,211,102,0.2)',
    shadowPressed:
      '0px 0px 0px 1px rgba(37,211,102,0.6), 0px 1px 2px 0px rgba(37,211,102,0.3)',
  },
  white: {
    innerBg: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
    fallbackBg: '#ffffff',
    color: '#4a2c10',
    shadowDefault:
      '0px 0px 0px 1px rgba(0,0,0,0.1), 0px 9px 9px 0px rgba(0,0,0,0.05), 0px 2px 5px 0px rgba(0,0,0,0.05)',
    shadowHover:
      '0px 0px 0px 1px rgba(212,175,55,0.4), 0px 8px 5px 0px rgba(212,175,55,0.1), 0px 4px 4px 0px rgba(212,175,55,0.1)',
    shadowPressed:
      '0px 0px 0px 1px rgba(212,175,55,0.5), 0px 1px 2px 0px rgba(212,175,55,0.2)',
  },
  facebook: {
    innerBg: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
    fallbackBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(59,130,246,0.4), 0px 9px 9px 0px rgba(59,130,246,0.12), 0px 2px 5px 0px rgba(59,130,246,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(59,130,246,0.5), 0px 8px 5px 0px rgba(59,130,246,0.15), 0px 4px 4px 0px rgba(59,130,246,0.2)',
    shadowPressed:
      '0px 0px 0px 1px rgba(59,130,246,0.6), 0px 1px 2px 0px rgba(59,130,246,0.3)',
  },
  instagram: {
    innerBg: 'linear-gradient(180deg, #e1306c 0%, #c11252 100%)',
    fallbackBg: 'linear-gradient(135deg, #e1306c 0%, #c11252 100%)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(225,48,108,0.4), 0px 9px 9px 0px rgba(225,48,108,0.12), 0px 2px 5px 0px rgba(225,48,108,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(225,48,108,0.5), 0px 8px 5px 0px rgba(225,48,108,0.15), 0px 4px 4px 0px rgba(225,48,108,0.2)',
    shadowPressed:
      '0px 0px 0px 1px rgba(225,48,108,0.6), 0px 1px 2px 0px rgba(225,48,108,0.3)',
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
  if (_stylesInjected) return;
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

// ─── Shader lifecycle hook ────────────────────────────────────────────────────

function useShaderMount(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mountRef = useRef<any>(null);
  const [available, setAvailable] = useState(() => isWebGlAvailable());

  useEffect(() => {
    injectStyles();

    const el = containerRef.current;
    if (!el || !isWebGlAvailable()) {
      setAvailable(false);
      return;
    }

    // ShaderMount can throw if WebGL context creation fails at runtime.
    // We guard with try/catch so React's effect error handler doesn't kill the tree.
    try {
      mountRef.current = new ShaderMount(
        el,
        liquidMetalFragmentShader,
        {
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
        0.6, // initial speed
      );
      setAvailable(true);
    } catch {
      setAvailable(false);
    }

    return () => {
      try {
        mountRef.current?.destroy?.();
      } catch {
        /* ignore cleanup errors */
      }
      mountRef.current = null;
    };
  }, [containerRef]);

  const setSpeed = (s: number) => {
    try {
      mountRef.current?.setSpeed?.(s);
    } catch {
      /* ignore */
    }
  };

  return { available, setSpeed };
}

// ─── Interaction + measurement hook ───────────────────────────────────────────

function useBtnState(onClickProp?: (e?: React.MouseEvent) => void) {
  const [isHovered, setHovered] = useState(false);
  const [isPressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [width, setWidth] = useState(160);

  const shaderContainerRef = useRef<HTMLDivElement | null>(null);
  const hitRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const rid = useRef(0);

  const { available: webGl, setSpeed } = useShaderMount(shaderContainerRef);

  // Measure text width
  useEffect(() => {
    if (measureRef.current) {
      setWidth(Math.max(measureRef.current.offsetWidth + 52, 120));
    }
  }, []);

  const handlers = {
    onMouseEnter: () => {
      setHovered(true);
      setSpeed(1);
    },
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
      setSpeed(0.6);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onClick: (e: React.MouseEvent) => {
      // Burst speed on click
      setSpeed(2.4);
      setTimeout(() => setSpeed(isHovered ? 1 : 0.6), 300);

      // Ripple at click position
      if (hitRef.current) {
        const rect = hitRef.current.getBoundingClientRect();
        const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rid.current++ };
        setRipples((prev) => [...prev, ripple]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)), 600);
      }

      onClickProp?.(e);
    },
  };

  return {
    isHovered,
    isPressed,
    ripples,
    webGl,
    width,
    shaderContainerRef,
    hitRef,
    measureRef,
    handlers,
  };
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

const SPRING = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';

function Layers({
  children,
  variant,
  isHovered,
  isPressed,
  ripples,
  shaderContainerRef,
  webGl,
  width,
}: LayersProps) {
  const tok = V[variant];
  const h = 46;
  const shadow = isPressed ? tok.shadowPressed : isHovered ? tok.shadowHover : tok.shadowDefault;
  const pressXf = isPressed ? 'translateY(1px) scale(0.98)' : 'translateY(0) scale(1)';

  return (
    <div style={{ perspective: '1000px', perspectiveOrigin: '50% 50%', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${h}px`,
          transformStyle: 'preserve-3d',
          transition: `${SPRING}, width 0.4s ease, height 0.4s ease`,
          transform: 'none',
        }}
      >
        {/* ── Layer 1: Text content (Z=20, closest to viewer) ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${width}px`,
            height: `${h}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transformStyle: 'preserve-3d',
            transition: `${SPRING}, width 0.4s ease, height 0.4s ease, gap 0.4s ease`,
            transform: 'translateZ(20px)',
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: tok.color,
              fontWeight: 600,
              fontFamily: 'var(--font-accent, system-ui)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)',
              transition: SPRING,
              transform: 'scale(1)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {children}
          </span>
        </div>

        {/* ── Layer 2: Pill face (Z=10) — brand color gradient ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${width}px`,
            height: `${h}px`,
            transformStyle: 'preserve-3d',
            transition: `${SPRING}, width 0.4s ease, height 0.4s ease`,
            transform: `translateZ(10px) ${pressXf}`,
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: `${width - 4}px`,
              height: `${h - 4}px`,
              margin: '2px',
              borderRadius: '100px',
              background: webGl ? tok.innerBg : tok.fallbackBg,
              boxShadow: isPressed
                ? 'inset 0px 2px 4px rgba(0, 0, 0, 0.4), inset 0px 1px 2px rgba(0, 0, 0, 0.3)'
                : 'none',
              transition: `${SPRING}, width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          />
        </div>

        {/* ── Layer 3: Outer ring + liquid metal shader (Z=0) ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${width}px`,
            height: `${h}px`,
            transformStyle: 'preserve-3d',
            transition: `${SPRING}, width 0.4s ease, height 0.4s ease`,
            transform: `translateZ(0px) ${pressXf}`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: `${h}px`,
              width: `${width}px`,
              borderRadius: '100px',
              boxShadow: shadow,
              transition: `${SPRING}, width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)`,
              background: 'transparent',
            }}
          >
            <div
              ref={shaderContainerRef}
              className="lmb-shader-host"
              style={{
                borderRadius: '100px',
                overflow: 'hidden',
                position: 'relative',
                width: `${width}px`,
                maxWidth: `${width}px`,
                height: `${h}px`,
                transition: 'width 0.4s ease, height 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* ── Ripple effects ── */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            style={{
              position: 'absolute',
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)',
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
  const {
    children,
    variant = 'primary',
    className = '',
    id,
    'aria-label': ariaLabel,
  } = props;

  const clickProp = 'onClick' in props ? (props as BtnProps).onClick : undefined;

  const {
    isHovered,
    isPressed,
    ripples,
    webGl,
    width,
    shaderContainerRef,
    hitRef,
    measureRef,
    handlers,
  } = useBtnState(clickProp);

  const measure = (
    <span ref={measureRef} className="lmb-measure" aria-hidden="true">
      {children}
    </span>
  );

  const layers = (
    <Layers
      variant={variant}
      isHovered={isHovered}
      isPressed={isPressed}
      ripples={ripples}
      shaderContainerRef={shaderContainerRef}
      webGl={webGl}
      width={width}
    >
      {children}
    </Layers>
  );

  // ── Router link ────────────────────────────────────────────────────
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
        {measure}
        {layers}
      </Link>
    );
  }

  // ── External anchor ────────────────────────────────────────────────
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
        {measure}
        {layers}
      </a>
    );
  }

  // ── Plain button ───────────────────────────────────────────────────
  return (
    <button
      type={(props as BtnProps).type ?? 'button'}
      className={`lmb-outer ${className}`}
      id={id}
      aria-label={ariaLabel}
      ref={hitRef as React.Ref<HTMLButtonElement>}
      {...handlers}
    >
      {measure}
      {layers}
    </button>
  );
}
