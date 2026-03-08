import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const calculatePasswordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;
  return Math.min(score, 4);
};

const getStrengthColor = (strength: number): string => {
  switch (strength) {
    case 0: return "bg-red-500";
    case 1: return "bg-red-500";
    case 2: return "bg-orange-500";
    case 3: return "bg-yellow-500";
    case 4: return "bg-green-500";
    default: return "bg-gray-300";
  }
};

const getStrengthLabel = (strength: number): string => {
  switch (strength) {
    case 0: return "Very Weak";
    case 1: return "Weak";
    case 2: return "Fair";
    case 3: return "Good";
    case 4: return "Strong";
    default: return "";
  }
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const [showPassword, setShowPassword] = React.useState(false);
    const [isHolding, setIsHolding] = React.useState(false);
    const [strength, setStrength] = React.useState(0);
    const [showStrength, setShowStrength] = React.useState(false);

    React.useEffect(() => {
      if (type === "password" && props.value) {
        setStrength(calculatePasswordStrength(props.value as string));
        setShowStrength(true);
      } else {
        setShowStrength(false);
      }
    }, [props.value, type]);

    const handleMouseDown = () => {
      setIsHolding(true);
      setShowPassword(true);
    };

    const handleMouseUp = () => {
      setIsHolding(false);
      setShowPassword(false);
    };

    const handleTouchStart = () => {
      setIsHolding(true);
      setShowPassword(true);
    };

    const handleTouchEnd = () => {
      setIsHolding(false);
      setShowPassword(false);
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={showPassword ? "text" : type}
            className={cn(
              "flex h-10 sm:h-11 w-full rounded-lg border border-input bg-background px-3 sm:px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              error && "border-destructive focus-visible:ring-destructive",
              isHolding && "bg-yellow-50 dark:bg-yellow-950/30",
              className
            )}
            ref={ref}
            {...props}
          />
          {type === "password" && (
            <button
              type="button"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded",
                isHolding && "text-yellow-600 dark:text-yellow-400"
              )}
              aria-label={showPassword ? "Hide password" : "Hold to show password"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </>
                )}
              </svg>
            </button>
          )}
        </div>

        {showStrength && type === "password" && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-full flex-1 rounded-full transition-colors duration-300",
                    i < strength ? getStrengthColor(strength) : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>
            <p className={cn(
              "text-xs",
              strength <= 1 ? "text-red-500" :
              strength === 2 ? "text-orange-500" :
              strength === 3 ? "text-yellow-500" : "text-green-500"
            )}>
              {getStrengthLabel(strength)}
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
