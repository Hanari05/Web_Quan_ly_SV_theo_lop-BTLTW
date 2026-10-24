export default function Field({ label, name, error, children, ...props }) {
  return <div className="field">
    <label htmlFor={name}>{label}</label>
    {children || <input id={name} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} {...props} />}
    {error && <small id={`${name}-error`} className="field-error" role="alert">{error}</small>}
  </div>;
}
