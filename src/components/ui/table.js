import * as React from "react";
import { cn } from "../../lib/utils";

const Table = ({ className, ...props }) => (
  <table className={cn("w-full border-collapse border border-gray-300", className)} {...props} />
);

export { Table };
