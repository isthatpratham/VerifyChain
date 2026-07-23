/**
 * Field.jsx
 * Wraps a form field with label, hint, and error message.
 * Every form input should be wrapped by this component.
 *
 * Usage:
 *   <Field label="GSTIN" htmlFor="gstin" required hint="15-digit alphanumeric" error={errors.gstin}>
 *     <Input id="gstin" ... />
 *   </Field>
 */
import { useId } from 'react';
import { Label }        from './Label';
import { Hint }         from './Hint';
import { ErrorMessage } from './ErrorMessage';

/**
 * @param {Object} props
 * @param {string}  props.label
 * @param {string}  [props.htmlFor]
 * @param {boolean} [props.required=false]
 * @param {string}  [props.hint]
 * @param {string}  [props.error]
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 */
export function Field({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  className = '',
  children,
}) {
  const generatedId = useId();
  const fieldId = htmlFor || generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>

      {/* Clone child to pass id and aria-describedby */}
      <div>
        {children}
      </div>

      {hint && !error && <Hint>{hint}</Hint>}
      {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
    </div>
  );
}
