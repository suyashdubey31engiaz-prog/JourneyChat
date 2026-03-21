import React from "react";

const InputField = ({ placeholder, value, onChange, type = "text", onKeyPress }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-glass-border text-light-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
    />
  );
};

export default InputField;