interface QapybaraIconProps {
  className?: string;
}

export function QapybaraIcon({ className = "size-6" }: QapybaraIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Flask body (test tube shape) */}
      <path
        d="M26 12 L26 20 L20 35 C20 35 18 42 22 46 C26 50 32 50 32 50 C32 50 38 50 42 46 C46 42 44 35 44 35 L38 20 L38 12"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M26 12 L26 20 L20 35 C20 35 18 42 22 46 C26 50 32 50 32 50 C32 50 38 50 42 46 C46 42 44 35 44 35 L38 20 L38 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Liquid in flask */}
      <ellipse
        cx="32"
        cy="40"
        rx="8"
        ry="6"
        fill="currentColor"
        opacity="0.3"
      />

      {/* Capybara head on top of flask */}
      <ellipse
        cx="32"
        cy="10"
        rx="12"
        ry="10"
        fill="currentColor"
        opacity="0.15"
      />
      <ellipse
        cx="32"
        cy="10"
        rx="12"
        ry="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Capybara ears */}
      <ellipse
        cx="25"
        cy="5"
        rx="3"
        ry="4"
        fill="currentColor"
        opacity="0.15"
      />
      <ellipse
        cx="25"
        cy="5"
        rx="3"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <ellipse
        cx="39"
        cy="5"
        rx="3"
        ry="4"
        fill="currentColor"
        opacity="0.15"
      />
      <ellipse
        cx="39"
        cy="5"
        rx="3"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Capybara eyes */}
      <circle
        cx="28"
        cy="10"
        r="1.5"
        fill="currentColor"
      />
      <circle
        cx="36"
        cy="10"
        r="1.5"
        fill="currentColor"
      />

      {/* Capybara nose */}
      <ellipse
        cx="32"
        cy="13"
        rx="2"
        ry="1.5"
        fill="currentColor"
        opacity="0.6"
      />

      {/* Bubbles in flask (test/experiment indicator) */}
      <circle
        cx="28"
        cy="38"
        r="1.5"
        fill="currentColor"
        opacity="0.5"
      />
      <circle
        cx="35"
        cy="36"
        r="1"
        fill="currentColor"
        opacity="0.5"
      />
      <circle
        cx="30"
        cy="42"
        r="1"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}
