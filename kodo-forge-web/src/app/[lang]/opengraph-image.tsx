import { ImageResponse } from 'next/og';

export const alt = 'Kodo Forge — Master TypeScript in the Terminal';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0b0d',
          backgroundImage:
            'linear-gradient(rgba(255, 176, 0, 0.04) 1px, transparent 1px), linear-gradient(180deg, #0b0b0d 0%, #000000 100%)',
          backgroundSize: '100% 4px, 100% 100%',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Subtle corner accent */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            fontSize: 20,
            color: '#52525b',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          kodoforge.dev
        </div>
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            fontSize: 20,
            color: '#52525b',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          v1.0 · MIT
        </div>

        {/* Top line */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: '#FFB000',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textShadow: '0 0 40px rgba(255, 176, 0, 0.35)',
            marginBottom: 36,
          }}
        >
          KODO FORGE
        </div>

        {/* Middle */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 48,
            maxWidth: 1000,
          }}
        >
          Master TypeScript in the Terminal
        </div>

        {/* Bottom line */}
        <div
          style={{
            fontSize: 30,
            color: '#a1a1aa',
            letterSpacing: '0.08em',
          }}
        >
          144+ lessons · 100% offline · open source
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
