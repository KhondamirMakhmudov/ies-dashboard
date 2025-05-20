const Button = ({ children }) => {
  return (
    <button className="bg-blue-500 text-white hover:bg-blue-600 w-full py-[10px] rounded-md cursor-pointer">
      {children}
    </button>
  );
};

export default Button;
