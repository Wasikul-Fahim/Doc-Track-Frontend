"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider } from "react-hook-form";
import { cn } from "./utils";

// Provides the react-hook-form context. It must not render a <form> itself:
// the pages render their own <form onSubmit>, and nesting two forms breaks submit.
const Form = FormProvider;

const FormField = <TFieldValues extends FieldValues = FieldValues>({
  ...props
}: ControllerProps<TFieldValues>) => <Controller {...props} />;

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
));
FormLabel.displayName = LabelPrimitive.Root.displayName;

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium text-destructive", className)}
    {...props}
  >
    {children}
  </p>
));
FormMessage.displayName = "FormMessage";

interface FormFieldContextValue<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
}

const FormFieldContext = React.createContext<FormFieldContextValue<FieldValues> | null>(null);

const FormPrimitive = React.forwardRef<HTMLDivElement, { name: FieldPath<FieldValues> } & React.HTMLAttributes<HTMLDivElement>>(
  ({ name, ...props }, ref) => (
    <FormFieldContext.Provider value={{ name }}>
      <div ref={ref} {...props} />
    </FormFieldContext.Provider>
  )
);
FormPrimitive.displayName = "FormPrimitive";

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormPrimitive };
