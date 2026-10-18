import { Link } from "react-router-dom";

const HEART =
  "M32 58 C10 42 4 30 4 21 C4 12 11 6 19 6 C25 6 29.5 9.5 32 14 C34.5 9.5 39 6 45 6 C53 6 60 12 60 21 C60 30 54 42 32 58 Z";

// Cœur en deux moitiés : visage de profil (dermatologie) + ECG (cardiologie)
export function LogoMark({ size = 44, light = false }) {
  const greenA = light ? "#4FD6B9" : "#14A58C";
  const greenB = light ? "#17A38A" : "#0B6355";
  const rightId = light ? "cd-right-light" : "cd-right";

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <clipPath id="cd-clip">
          <path d={HEART} />
        </clipPath>
        <linearGradient id="cd-left" x1="6" y1="8" x2="30" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB08E" />
          <stop offset="1" stopColor="#E5605A" />
        </linearGradient>
        <linearGradient id={rightId} x1="34" y1="8" x2="58" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor={greenA} />
          <stop offset="1" stopColor={greenB} />
        </linearGradient>
      </defs>

      <g clipPath="url(#cd-clip)">
        {/* Moitié gauche (derma) */}
        <rect width="64" height="64" fill="url(#cd-left)" />
        {/* Moitié droite (cardio) */}
        <path
          d="M32 0 L32 10 C27.5 22 36.5 34 32 60 L32 64 L64 64 L64 0 Z"
          fill={`url(#${rightId})`}
        />
        {/* Séparation ondulée */}
        <path
          d="M32 10 C27.5 22 36.5 34 32 60"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Mèche de cheveux */}
        <path
          d="M11 22 C13 13 21 9.5 27 11.5"
          stroke="#FFFFFF"
          strokeOpacity="0.45"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* Visage de profil */}
        <path
          d="M27 17 C21 17 16.2 21 15.8 26 C15.6 28 14.8 29.6 13.8 31.4 C13.2 32.5 13.5 33.6 14.5 34 L15.8 34.4 C15.5 35.4 15.9 36.2 16.5 36.5 C15.9 37.1 16.2 37.9 16.8 38.2 C16.4 39 16.7 40 17.5 40.5 C17.4 42.2 18.4 43.6 20.4 44.1 L24 44.6 C25.8 45 27 46.5 27.5 48.5 C29.5 40 29 25 27 17 Z"
          fill="#FFF4EC"
        />
        <path d="M17.2 25.2 Q19.6 24 22.2 25.2" stroke="#0A4A41" strokeWidth="1" strokeLinecap="round" />
        <path d="M17.8 28.2 Q19.8 29.6 21.8 28.2" stroke="#0A4A41" strokeWidth="1" strokeLinecap="round" />
        <circle cx="22.6" cy="33.5" r="0.8" fill="#E5605A" />
        <circle cx="24.6" cy="36" r="0.7" fill="#E5605A" />
        <circle cx="21.8" cy="37" r="0.6" fill="#E5605A" />

        {/* ECG */}
        <path
          d="M35.5 34 H40 L42.5 27 L46.5 41 L49.5 30.5 L51.2 34 H56"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <LogoMark light={light} />
      <span className="font-heading text-xl font-extrabold tracking-tight">
        <span className={light ? "text-white" : "text-brand-900"}>Cardio</span>
        <span className="text-coral">Derma</span>
      </span>
    </Link>
  );
}