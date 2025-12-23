import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const calculateStrength = (): {
    score: number;
    label: string;
    color: string;
    requirements: {
      minLength: boolean;
      hasUpperCase: boolean;
      hasLowerCase: boolean;
      hasNumber: boolean;
      hasSpecial: boolean;
    };
  } => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let label = "Weak";
    let color = "destructive";

    if (score === 5) {
      label = "Strong";
      color = "success";
    } else if (score >= 3) {
      label = "Medium";
      color = "warning";
    }

    return { score, label, color, requirements };
  };

  if (!password) return null;

  const { score, label, color, requirements } = calculateStrength();
  const percentage = (score / 5) * 100;

  const getProgressColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password Strength:</span>
          <span
            className={`font-medium ${
              color === "success"
                ? "text-green-600"
                : color === "warning"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {label}
          </span>
        </div>
        <Progress value={percentage} className="h-2">
          <div
            className={`h-full transition-all rounded-full ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </Progress>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          {requirements.minLength ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className={requirements.minLength ? "text-green-600" : "text-muted-foreground"}>
            At least 8 characters
          </span>
        </div>
        <div className="flex items-center gap-2">
          {requirements.hasUpperCase ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className={requirements.hasUpperCase ? "text-green-600" : "text-muted-foreground"}>
            One uppercase letter
          </span>
        </div>
        <div className="flex items-center gap-2">
          {requirements.hasLowerCase ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className={requirements.hasLowerCase ? "text-green-600" : "text-muted-foreground"}>
            One lowercase letter
          </span>
        </div>
        <div className="flex items-center gap-2">
          {requirements.hasNumber ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className={requirements.hasNumber ? "text-green-600" : "text-muted-foreground"}>
            One number
          </span>
        </div>
        <div className="flex items-center gap-2">
          {requirements.hasSpecial ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className={requirements.hasSpecial ? "text-green-600" : "text-muted-foreground"}>
            One special character (!@#$%^&*)
          </span>
        </div>
      </div>
    </div>
  );
};

export const validatePasswordStrength = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};
