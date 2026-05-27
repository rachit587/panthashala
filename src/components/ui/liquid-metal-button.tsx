/**
 * LiquidMetalButton — Tinted Liquid Metal version
 *
 * Shows the @paper-design liquid-metal shader across the ENTIRE button surface
 * and tints it with each variant's brand colour (gold, orange, wood, whatsapp,
 * facebook, instagram, white, outline, call) via mix-blend-mode.
 *
 * Layer stack (bottom → top, inside an `isolate` container so blend modes don't
 * leak onto the page background):
 *   1. Shader canvas (z=10)               — animated liquid metal
 *   2. Coloured tint overlay (z=15)       — brand colour with mix-blend-mode
 *   3. Inner highlight ring (z=18)        — subtle 1px border for definition
 *   4. Label text (z=30)                  — children
 *   5. Hit-area button/link (z=40)        — captures clicks & ripples
 *
 * If WebGL is unavailable, falls back to `tok.fallbackBg` solid gradient.
 *
 * Supports router Link (`to`), external anchor (`href`), or plain button.
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
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

type ButtonVariant =
  | 'primary'
  | 'orange'
  | 'outline'
  | 'call'
  | 'wood'
  | 'whatsapp'
  | 'white'
  | 'facebook'
  | 'instagram';

interface VariantTokens {
  /** Tint colour painted over the shader (full opacity is fine — blend handles it) */
  tint: string;
  /** Blend mode used to mix tint with shader */
  blend: CSSProperties['mixBlendMode'];
  /** Optional extra opacity for the tint overlay (1 = full) */
  tintOpacity: number;
  /** Fallback solid background when WebGL is unavailable */
  fallbackBg: string;
  /** Label colour */
  color: string;
  /** Ring shadow (1 px outline + ambient drop shadow) */
  shadowDefault: string;
  shadowHover: string;
  shadowPressed: string;
  /** Subtle inner-border colour (1 px ring inside the pill) */
  innerBorder: string;
}

const V: Record<ButtonVariant, VariantTokens> = {
  primary: {
    tint: 'linear-gradient(180deg, #f5d35a 0%, #b8922a 100%)',
    blend: 'overlay',
    tintOpacity: 0.95,
    fallbackBg: 'linear-gradient(135deg, #D4AF37 0%, #c9a227 100%)',
    color: '#2a1a04',
    shadowDefault:
      '0px 0px 0px 1px rgba(180,140,0,0.45), 0px 9px 9px 0px rgba(180,140,0,0.12), 0px 2px 5px 0px rgba(180,140,0,0.18)',
    shadowHover:
      '0px 0px 0px 1px rgba(180,140,0,0.6), 0px 8px 14px 0px rgba(180,140,0,0.22), 0px 4px 6px 0px rgba(180,140,0,0.2)',
    shadowPressed:
      '0px 0px 0px 1px rgba(180,140,0,0.7), 0px 1px 2px 0px rgba(180,140,0,0.3)',
    innerBorder: 'rgba(255, 230, 140, 0.45)',
  },
  orange: {
    tint: 'linear-gradient(180deg, #ff8c33 0%, #cc4400 100%)',
    blend: 'overlay',
    tintOpacity: 0.95,
    fallbackBg: 'linear-gradient(135deg, #FF6B00 0%, #e55e00 100%)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(200,80,0,0.45), 0px 9px 9px 0px rgba(200,80,0,0.12), 0px 2px 5px 0px rgba(200,80,0,0.18)',
    shadowHover:
      '0px 0px 0px 1px rgba(200,80,0,0.6), 0px 8px 14px 0px rgba(200,80,0,0.22), 0px 4px 6px 0px rgba(200,80,0,0.2)',
    shadowPressed:
      '0px 0px 0px 1px rgba(200,80,0,0.7), 0px 1px 2px 0px rgba(200,80,0,0.3)',
    innerBorder: 'rgba(255, 200, 140, 0.45)',
  },
  outline: {
    tint: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 100%)',
    blend: 'screen',
    tintOpacity: 0.6,
    fallbackBg: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(255,255,255,0.35), 0px 9px 9px 0px rgba(0,0,0,0.12)',
    shadowHover:
      '0px 0px 0px 1px rgba(255,255,255,0.6), 0px 8px 14px 0px rgba(0,0,0,0.15)',
    shadowPressed:
      '0px 0px 0px 1px rgba(255,255,255,0.6), inset 0 2px 4px rgba(0,0,0,0.2)',
    innerBorder: 'rgba(255, 255, 255, 0.5)',
  },
  call: {
    tint: 'linear-gradient(180deg, rgba(220,230,245,0.5) 0%, rgba(140,160,190,0.3) 100%)',
    blend: 'screen',
    tintOpacity: 0.55,
    fallbackBg: 'rgba(255,255,255,0.12)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(255,255,255,0.3), 0px 9px 9px 0px rgba(0,0,0,0.1)',
    shadowHover:
      '0px 0px 0px 1px rgba(255,255,255,0.55), 0px 8px 14px 0px rgba(0,0,0,0.12)',
    shadowPressed:
      '0px 0px 0px 1px rgba(255,255,255,0.6), inset 0 2px 4px rgba(0,0,0,0.15)',
    innerBorder: 'rgba(255, 255, 255, 0.4)',
  },
  wood: {
    tint: 'linear-gradient(180deg, #8a5a30 0%, #3a1f08 100%)',
    blend: 'multiply',
    tintOpacity: 0.92,
    fallbackBg: 'linear-gradient(135deg, #7a4f2a 0%, #4a2c10 100%)',
    color: '#f5e6c8',
    shadowDefault:
      '0px 0px 0px 1px rgba(70,40,10,0.5), 0px 9px 9px 0px rgba(70,40,10,0.18)',
    shadowHover:
      '0px 0px 0px 1px rgba(70,40,10,0.65), 0px 8px 14px 0px rgba(70,40,10,0.25)',
    shadowPressed:
      '0px 0px 0px 1px rgba(70,40,10,0.75), 0px 1px 2px 0px rgba(70,40,10,0.3)',
    innerBorder: 'rgba(212, 175, 55, 0.35)',
  },
  whatsapp: {
    tint: 'linear-gradient(180deg, #3fe27a 0%, #128a3d 100%)',
    blend: 'overlay',
    tintOpacity: 0.95,
    fallbackBg: 'linear-gradient(135deg, #25D366 0%, #1da851 100%)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(37,211,102,0.45), 0px 9px 9px 0px rgba(37,211,102,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(37,211,102,0.6), 0px 8px 14px 0px rgba(37,211,102,0.22)',
    shadowPressed:
      '0px 0px 0px 1px rgba(37,211,102,0.7), 0px 1px 2px 0px rgba(37,211,102,0.3)',
    innerBorder: 'rgba(180, 255, 200, 0.5)',
  },
  white: {
    tint: 'linear-gradient(180deg, #ffffff 0%, #d8d8d8 100%)',
    blend: 'screen',
    tintOpacity: 0.85,
    fallbackBg: '#ffffff',
    color: '#4a2c10',
    shadowDefault:
      '0px 0px 0px 1px rgba(0,0,0,0.12), 0px 9px 9px 0px rgba(0,0,0,0.06)',
    shadowHover:
      '0px 0px 0px 1px rgba(212,175,55,0.5), 0px 8px 14px 0px rgba(212,175,55,0.15)',
    shadowPressed:
      '0px 0px 0px 1px rgba(212,175,55,0.6), 0px 1px 2px 0px rgba(212,175,55,0.2)',
    innerBorder: 'rgba(212, 175, 55, 0.3)',
  },
  facebook: {
    tint: 'linear-gradient(180deg, #5b9bf7 0%, #1140a8 100%)',
    blend: 'overlay',
    tintOpacity: 0.95,
    fallbackBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(59,130,246,0.45), 0px 9px 9px 0px rgba(59,130,246,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(59,130,246,0.6), 0px 8px 14px 0px rgba(59,130,246,0.22)',
    shadowPressed:
      '0px 0px 0px 1px rgba(59,130,246,0.7), 0px 1px 2px 0px rgba(59,130,246,0.3)',
    innerBorder: 'rgba(180, 210, 255, 0.5)',
  },
  instagram: {
    tint: 'linear-gradient(180deg, #f04488 0%, #a01044 100%)',
    blend: 'overlay',
    tintOpacity: 0.95,
    fallbackBg: 'linear-gradient(135deg, #e1306c 0%, #c11252 100%)',
    color: '#ffffff',
    shadowDefault:
      '0px 0px 0px 1px rgba(225,48,108,0.45), 0px 9px 9px 0px rgba(225,48,108,0.15)',
    shadowHover:
      '0px 0px 0px 1px rgba(225,48,108,0.6), 0px 8px 14px 0px rgba(225,48,108,0.22)',
    shadowPressed:
      '0px 0px 0px 1px rgba(225,48,108,0.7), 0px 1px 2px 0px rgba(225,48,108,0.3)',
    innerBorder: 'rgba(255, 180, 210, 0.5)',
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

    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) {
        setAvailable(false);
        return;
      }
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
          0.6,
        );
        setAvailable(true);
      } catch {
        setAvailable(false);
      }
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      try {
        mountRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
      mountRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSpeed = useCallback((s: number) => {
    try {
      mountRef.current?.setSpeed?.(s);
    } catch {
      /* ignore */
    }
  }, []);

  return { available, setSpeed };
}

// ─── Interaction + measurement hook ───────────────────────────────────────────

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

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.offsetWidth;
      if (w > 0) setWidth(Math.max(w + 52, 120));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
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
      setSpeed(2.4);
      setTimeout(() => setSpeed(isHovered ? 1 : 0.6), 300);
      if (hitRef.current) {
        const rect = hitRef.current.getBoundingClientRect();
        const ripple = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          id: rid.current++,
        };
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
  const shadow = isPressed ? tok.shadowPressed : isHovered ? tok.shadowHover : tok.shadowDefault;
  const pressXf = isPressed ? 'translateY(1px) scale(0.98)' : 'translateY(0) scale(1)';

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${H}px`,
        transition: `${SPRING}, width 0.4s ease`,
        pointerEvents: 'none',
        // isolate so mix-blend-mode only blends inside this stack
        isolation: 'isolate',
      }}
    >
      {/* Outer ring shadow + pressed transform wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '100px',
          boxShadow: shadow,
          transform: pressXf,
          transition: `${SPRING}, box-shadow 0.15s ease`,
          overflow: 'hidden',
          // Fallback solid colour shown when shader is unavailable; covered
          // by the shader canvas when WebGL works.
          background: webGl ? 'transparent' : tok.fallbackBg,
        }}
      >
        {/* Layer 1 (z=10): Shader canvas */}
        <div
          ref={shaderContainerRef}
          className="lmb-shader-host"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '100px',
            overflow: 'hidden',
            zIndex: 10,
          }}
        />

        {/* Layer 2 (z=15): Coloured tint overlay (blends with shader) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '100px',
            background: tok.tint,
            mixBlendMode: webGl ? tok.blend : 'normal',
            opacity: webGl ? tok.tintOpacity : 0,
            zIndex: 15,
            pointerEvents: 'none',
          }}
        />

        {/* Layer 3 (z=18): Inner 1px highlight ring for definition */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '100px',
            boxShadow: `inset 0 0 0 1px ${tok.innerBorder}, inset 0 1px 0 0 rgba(255,255,255,0.18)`,
            zIndex: 18,
            pointerEvents: 'none',
          }}
        />

        {/* Layer 4 (z=30): Press shadow (only when pressed) */}
        {isPressed && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '100px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35)',
              zIndex: 19,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Layer 5 (z=30): Label text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          zIndex: 30,
          pointerEvents: 'none',
          transform: pressXf,
          transition: `${SPRING}`,
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
            textShadow: '0px 1px 2px rgba(0,0,0,0.35)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {children}
        </span>
      </div>

      {/* Ripple effects */}
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            left: `${r.x}px`,
            top: `${r.y}px`,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'lmb-ripple-anim 0.6s ease-out',
            zIndex: 50,
          }}
        />
      ))}
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function LiquidMetalButton(props: LiquidMetalButtonProps) {
  const { children, variant = 'primary', className = '', id, 'aria-label': ariaLabel } = props;
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
