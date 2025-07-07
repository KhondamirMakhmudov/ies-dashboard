const Input = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  classNames,
  inputClass,
  ...props
}) => {
  return (
    <div className={`${classNames}`}>
      <label>{label}</label>
      <input
        {...props}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full h-[55px] border border-gray-400 rounded-[5px] p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
      />
    </div>
  );
};

export default Input;
