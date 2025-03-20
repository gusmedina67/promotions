import * as React from "react";
import { cn } from "../../lib/utils";

const Alert = React.forwardRef(({ className, type = "info", children, ...props }, ref) => {
  const alertStyles = {
    info: "bg-blue-100 text-blue-800 border-blue-300",
    success: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    error: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div ref={ref} className={cn("border p-3 rounded-md", alertStyles[type], className)} {...props}>
      {children}
    </div>
  );
});

Alert.displayName = "Alert";
export { Alert };
