import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const buttonVariants = {
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  primary: "bg-blue-600 text-white hover:bg-blue-700",
};

const Button = React.forwardRef(({ className, variant = "primary", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn("px-4 py-2 rounded", buttonVariants[variant], className)} {...props} />;
});

Button.displayName = "Button";
export { Button };
