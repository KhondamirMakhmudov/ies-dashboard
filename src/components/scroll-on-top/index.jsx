import { useState, useEffect } from "react";

const ScrollToTopButton = ({ containerRef = null }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = containerRef?.current ?? window;

    const getScrollY = () => {
      if (containerRef?.current) return containerRef.current.scrollTop;
      return window.scrollY || document.documentElement.scrollTop;
    };

    const onScroll = () => {
      setIsVisible(getScrollY() > 300);
    };

    // initial check
    onScroll();

    target.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", onScroll);
    };
  }, [containerRef]);

  const scrollToTop = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed z-50 bottom-8 right-8">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`bg-[#0256BA] p-[8px] animate-bounce rounded-full cursor-pointer shadow-lg hover:bg-[#0255bae0] transition-all duration-300 transform hover:scale-110 
            ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            } 
            ease-in-out`}
          style={{ transitionProperty: "transform, opacity" }}
        >
          <svg
            width="44"
            height="44"
            className="xl:w-[44px] xl:h-[44px] lg:w-[40px] lg:h-[40px] md:w-[35px] md:h-[35px] w-[30px] h-[30px]"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_888_275)">
              <path
                d="M22 9.1665V34.8332"
                stroke="white"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M33 20.1665L22 9.1665"
                stroke="white"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 20.1665L22 9.1665"
                stroke="white"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_888_275">
                <rect width="44" height="44" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ScrollToTopButton;
