import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gold text-black",
        outline: "border border-gold text-gold",
        secondary: "bg-muted text-white border border-border",
        destructive: "bg-destructive text-white",
        success: "bg-success text-white",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
