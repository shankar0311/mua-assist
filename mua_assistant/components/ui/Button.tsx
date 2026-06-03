import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary";
    size?: "default" | "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95";

        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all",
            destructive:
                "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
            outline:
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
            secondary:
                "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow hover:shadow-lg transition-all active:scale-[0.98]",
        };

        const sizes = {
            default: "h-11 px-6 py-2", // Taller default
            sm: "h-9 rounded-md px-3",
            lg: "h-14 rounded-xl px-8 text-lg", // Large CTA
            icon: "h-10 w-10",
            md: "h-11 px-8 py-2",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = "Button";
