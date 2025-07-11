import clsx from "clsx";

const IESLoader = ({ classNames }) => {
  return (
    <div
      className={clsx(
        "flex min-h-[75vh] justify-center items-center",
        classNames
      )}
    >
      <div class="loader">
        <svg height="0" width="0" viewBox="0 0 64 64" class="absolute">
          <defs xmlns="http://www.w3.org/2000/svg">
            <linearGradient
              id="b"
              gradientUnits="userSpaceOnUse"
              y2="2"
              x2="0"
              y1="62"
              x1="0"
            >
              <stop stop-color="#973BED" />
              <stop stop-color="#007CFF" offset="1" />
            </linearGradient>
            <linearGradient
              id="c"
              gradientUnits="userSpaceOnUse"
              y2="0"
              x2="0"
              y1="64"
              x1="0"
            >
              <stop stop-color="#FFC800" />
              <stop stop-color="#F0F" offset="1" />
              <animateTransform
                repeatCount="indefinite"
                dur="8s"
                values="0 32 32;-270 32 32;-540 32 32;-810 32 32;-1080 32 32"
                type="rotate"
                attributeName="gradientTransform"
              />
            </linearGradient>
            <linearGradient
              id="d"
              gradientUnits="userSpaceOnUse"
              y2="2"
              x2="0"
              y1="62"
              x1="0"
            >
              <stop stop-color="#00E0ED" />
              <stop stop-color="#00DA72" offset="1" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          class="inline-block"
        >
          <path
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="8"
            stroke="url(#b)"
            d="M32 8 L32 56"
            pathLength="100"
            class="dash"
          />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          class="inline-block"
        >
          <path
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="8"
            stroke="url(#c)"
            d="M48 8 H16 V56 H48 M16 32 H40"
            pathLength="200"
            class="dash"
          />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          class="inline-block"
        >
          <path
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="8"
            stroke="url(#d)"
            d="M48 16 C48 8, 16 8, 16 24 C16 32, 48 32, 48 40 C48 56, 16 56, 16 48"
            pathLength="300"
            class="dash"
          />
        </svg>
      </div>
    </div>
  );
};

export default IESLoader;
