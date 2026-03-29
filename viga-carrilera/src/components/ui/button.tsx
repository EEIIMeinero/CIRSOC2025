import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-500",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        outline: "border border-[hsl(230,15%,25%)] bg-transparent text-slate-300 hover:bg-[hsl(230,15%,20%)] hover:text-white",
        secondary: "bg-[hsl(230,15%,20%)] text-slate-300 hover:bg-[hsl(230,15%,25%)] hover:text-white",
        ghost: "text-slate-400 hover:bg-[hsl(230,15%,18%)] hover:text-slate-200",
        link: "text-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-4 py-1.5",
        sm: "h-7 rounded px-3 text-xs",
        lg: "h-9 rounded px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
