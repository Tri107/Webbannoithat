const AuthCard = ({ children }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      {children}
    </div>
  );
};

export default AuthCard;
