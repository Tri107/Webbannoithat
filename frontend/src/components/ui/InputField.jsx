const InputField = ({
  type = "text",
  name,
  placeholder,
  value = "",
  onChange,
  required = false,
  autoComplete,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm 
                 focus:outline-none focus:ring-2 focus:ring-orange-500 
                 transition duration-200 bg-white"
    />
  );
};

export default InputField;
