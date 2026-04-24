import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = "Contraseña", 
  required = true,
  name = "clave",
  className = ""
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full p-4 rounded-2xl bg-base-200 border-2 border-transparent text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-100 focus:border-jungle_teal focus:ring-4 focus:ring-jungle_teal/10 transition-all font-medium pr-12 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
        tabIndex={-1}
      >
        {visible ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};