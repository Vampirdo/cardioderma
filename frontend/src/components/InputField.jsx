import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function InputField({
  label,
  name,
  type = "text",
  error,
  className = "",
  ...props
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-brand-900">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && show ? "text" : type}
          className={`input ${isPassword ? "pr-11" : ""} ${
            error ? "!border-coral focus:!ring-coral-soft" : ""
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute inset-y-0 right-3 text-brand-900/40 transition hover:text-brand-700"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-coral">{error}</p>}
    </div>
  );
}