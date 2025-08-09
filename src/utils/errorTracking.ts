/**
 * Production Error Tracking System
 * Centralized error handling and monitoring for production builds
 */

import { config } from "../config/environment";

export interface ErrorContext {
    userId?: string;
    projectId?: string;
    component?: string;
    action?: string;
    metadata?: Record<string, unknown>;
}

export interface ErrorReport {
    id: string;
    timestamp: Date;
    error: Error;
    context: ErrorContext;
    userAgent: string;
    url: string;
    stackTrace?: string;
}

class ErrorTracker {
    private errorQueue: ErrorReport[] = [];
    private isOnline = navigator.onLine;

    constructor() {
        this.setupGlobalErrorHandlers();
        this.setupNetworkListeners();
    }

    private setupGlobalErrorHandlers(): void {
        // Handle uncaught JavaScript errors
        window.addEventListener("error", (event) => {
            this.captureError(new Error(event.message), {
                component: "Global",
                action: "Uncaught Error",
                metadata: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                },
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener("unhandledrejection", (event) => {
            this.captureError(
                new Error(`Unhandled Promise Rejection: ${event.reason}`),
                {
                    component: "Global",
                    action: "Unhandled Promise Rejection",
                    metadata: { reason: event.reason },
                },
            );
        });

        // Handle React error boundaries
        window.addEventListener(
            "react-error",
            ((event: CustomEvent) => {
                this.captureError(event.detail.error, {
                    component: event.detail.componentStack,
                    action: "React Error Boundary",
                    metadata: event.detail.errorInfo,
                });
            }) as EventListener,
        );
    }

    private setupNetworkListeners(): void {
        window.addEventListener("online", () => {
            this.isOnline = true;
            this.flushErrorQueue();
        });

        window.addEventListener("offline", () => {
            this.isOnline = false;
        });
    }

    public captureError(error: Error, context: ErrorContext = {}): void {
        const errorReport: ErrorReport = {
            id: this.generateErrorId(),
            timestamp: new Date(),
            error,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href,
            stackTrace: error.stack,
        };

        // Log error for development
        if (config.app.debug) {
            console.error("[Error Tracker]", errorReport);
        }

        // Add to queue
        this.errorQueue.push(errorReport);

        // Try to send immediately if online
        if (this.isOnline && config.features.enableErrorTracking) {
            this.sendErrorReport(errorReport);
        }

        // Keep queue size manageable
        if (this.errorQueue.length > 50) {
            this.errorQueue = this.errorQueue.slice(-25);
        }
    }

    public captureException(error: Error, context: ErrorContext = {}): void {
        this.captureError(error, { ...context, action: "Exception" });
    }

    public captureMessage(
        message: string,
        level: "info" | "warning" | "error" = "info",
        context: ErrorContext = {},
    ): void {
        if (level === "error") {
            this.captureError(new Error(message), {
                ...context,
                action: "Message",
            });
        } else if (config.app.debug) {
            console.log(`[${level.toUpperCase()}]`, message, context);
        }
    }

    private async sendErrorReport(errorReport: ErrorReport): Promise<void> {
        try {
            // In production, this would send to your error tracking service
            // For now, we'll use a mock endpoint or local storage

            if (config.app.environment === "production") {
                // Example: Send to error tracking service
                // await fetch('/api/errors', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(errorReport)
                // });

                // For now, store in localStorage for debugging
                this.storeErrorLocally(errorReport);
            }

            // Remove from queue after successful send
            this.errorQueue = this.errorQueue.filter((e) =>
                e.id !== errorReport.id
            );
        } catch (sendError) {
            console.error("Failed to send error report:", sendError);
        }
    }

    private storeErrorLocally(errorReport: ErrorReport): void {
        try {
            const existingErrors = JSON.parse(
                localStorage.getItem("error_reports") || "[]",
            );
            existingErrors.push({
                ...errorReport,
                error: {
                    name: errorReport.error.name,
                    message: errorReport.error.message,
                    stack: errorReport.error.stack,
                },
            });

            // Keep only last 10 errors
            const recentErrors = existingErrors.slice(-10);
            localStorage.setItem("error_reports", JSON.stringify(recentErrors));
        } catch (storageError) {
            console.error("Failed to store error locally:", storageError);
        }
    }

    private flushErrorQueue(): void {
        if (!config.features.enableErrorTracking) return;

        const queueCopy = [...this.errorQueue];
        queueCopy.forEach((errorReport) => {
            this.sendErrorReport(errorReport);
        });
    }

    private generateErrorId(): string {
        return `error_${Date.now()}_${
            Math.random().toString(36).substring(2, 11)
        }`;
    }

    public getStoredErrors(): unknown[] {
        try {
            return JSON.parse(localStorage.getItem("error_reports") || "[]");
        } catch {
            return [];
        }
    }

    public clearStoredErrors(): void {
        localStorage.removeItem("error_reports");
    }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// Convenience functions
export const captureError = (error: Error, context?: ErrorContext) => {
    errorTracker.captureError(error, context);
};

export const captureException = (error: Error, context?: ErrorContext) => {
    errorTracker.captureException(error, context);
};

export const captureMessage = (
    message: string,
    level?: "info" | "warning" | "error",
    context?: ErrorContext,
) => {
    errorTracker.captureMessage(message, level, context);
};

// React Error Boundary helper
export const notifyErrorBoundary = (
    error: Error,
    errorInfo: Record<string, unknown>,
) => {
    const event = new CustomEvent("react-error", {
        detail: { error, errorInfo },
    });
    window.dispatchEvent(event);
};
