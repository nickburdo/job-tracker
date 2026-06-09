export type FormFieldErrors<TField extends string> = Partial<
  Record<TField, string>
>;

type FormErrorOptions<TField extends string> = {
  error: unknown;
  fields?: readonly TField[];
  setFieldError: (field: TField, message: string) => void;
  showToast: (message: string) => void;
  fallbackMessage?: string;
};

const readText = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim() ? value : null;
};

const readFieldErrors = (value: unknown): Record<string, string> | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const payload = value as {
    fieldErrors?: Record<string, string>;
    data?: unknown;
  };

  if (payload.fieldErrors && Object.keys(payload.fieldErrors).length > 0) {
    return payload.fieldErrors;
  }

  if ('data' in payload) {
    return readFieldErrors(payload.data);
  }

  return null;
};

const readNestedValue = (
  value: unknown,
  keys: readonly string[],
): string | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const payload = value as Record<string, unknown>;
  const response = payload.response as
    | { _data?: unknown }
    | undefined;

  for (const key of keys) {
    const nextValue = payload[key];

    if (typeof nextValue === 'string' && nextValue.trim()) {
      return nextValue;
    }
  }

  return (
    readNestedValue(payload.data, keys) ??
    readNestedValue(response?._data, keys)
  );
};

export const extractApiFormFieldErrors = <TField extends string>(
  error: unknown,
): FormFieldErrors<TField> | null => {
  const payload = error as Record<string, unknown> | null;

  const fieldErrors =
    readFieldErrors(error) ??
    readFieldErrors(payload?.data) ??
    readFieldErrors(
      (payload?.response as { _data?: unknown } | undefined)?._data,
    );

  if (!fieldErrors) {
    return null;
  }

  return fieldErrors as FormFieldErrors<TField>;
};

const readErrorMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return readText(value);
  }

  return readNestedValue(value, ['statusMessage', 'message']);
};

export const handleApiFormError = <TField extends string>({
  error,
  fields,
  setFieldError,
  showToast,
  fallbackMessage = 'Failed to save form',
}: FormErrorOptions<TField>) => {
  const fieldList = fields?.length ? fields : null;
  const fieldErrors = extractApiFormFieldErrors<TField>(error);

  if (!fieldList || !fieldErrors) {
    showToast(readErrorMessage(error) ?? fallbackMessage);
    return false;
  }

  let handled = false;

  for (const field of fieldList) {
    const message = readText(fieldErrors[field]);

    if (message) {
      setFieldError(field, message);
      handled = true;
    }
  }

  if (!handled) {
    showToast(readErrorMessage(error) ?? fallbackMessage);
  }

  return handled;
};
