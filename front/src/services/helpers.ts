import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Type predicate to narrow an unknown error to `FetchBaseQueryError`
 */
export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error
}

/**
 * Type predicate to narrow an unknown error to an object with a string 'message' property
 */
export function isErrorWithMessage(
  error: unknown
): error is { message: string } {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

export function getErrorMessage(
  error: unknown, 
  defaultMessage = ""): string {
  if (isFetchBaseQueryError(error) && isErrorWithMessage(error)) {
    return error.message;
  }
  return defaultMessage;
}

/**
 * Return the media breaking point size
 * @param width - the width of the window
 * @returns "xs" | "sm" | "md" | "lg" | "xl"
 */
export function getBreakingpoint(width: number): "xs" | "sm" | "md" | "lg" | "xl"{
  if(width < 600){
    //xs
    return "xs";
  } else if (width < 900) {
    //sm
    return "sm";
  } else if (width < 1200) {
    //md
    return "md";
  } else if (width < 1536){
    //lg
    return "lg";
  } else {
    //xl
    return "xl";
  }
}