import { Suspense } from "react";
import { LoadingIndicator } from "components";
import { ErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { Outlet } from "react-router-dom";
export const MainLayout = () => {
  return (
    <div className="box-border text-gray-900 bg-gray-50 h-[calc(100vh-0.5rem)]">
      <ErrorBoundary>
        <Suspense fallback={<LoadingIndicator center />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
