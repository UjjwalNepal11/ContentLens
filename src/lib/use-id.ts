"use client";

import * as React from "react";

export function useId(prefix: string = "id"): string {
  const generatedId = React.useId();

  return `${prefix}${generatedId.replace(/:/g, '-')}`;
}
