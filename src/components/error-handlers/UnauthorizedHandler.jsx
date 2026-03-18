"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import ContentLoader from "@/components/loader";

/**
 * Component to handle 401 unauthorized errors
 * Attempts to refresh session before redirecting to 401 page
 * Usage: Wrap components that might receive 401 errors
 */
export const withUnauthorizedHandler = (Component) => {
  return function ProtectedComponent(props) {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showError, setShowError] = useState(false);

    // Check if there's a 401 error in the error prop
    const hasUnauthorizedError =
      props.error?.response?.status === 401 || props.lastError?.status === 401;

    useEffect(() => {
      if (hasUnauthorizedError && !isRefreshing) {
        setIsRefreshing(true);

        // Attempt to refresh the session
        const refreshSession = async () => {
          try {
            console.log("Attempting to refresh session...");
            const result = await update();

            if (result) {
              console.log("Session refreshed successfully");
              setIsRefreshing(false);
              // Component will retry the query automatically
            } else {
              console.log("Session refresh failed");
              setShowError(true);
              setTimeout(() => {
                router.replace("/401");
              }, 1500);
            }
          } catch (error) {
            console.error("Session refresh error:", error);
            setShowError(true);
            setTimeout(() => {
              router.replace("/401");
            }, 1500);
          }
        };

        refreshSession();
      }
    }, [hasUnauthorizedError, isRefreshing, update, router]);

    if (isRefreshing) {
      return <ContentLoader />;
    }

    return <Component {...props} />;
  };
};

export default withUnauthorizedHandler;
