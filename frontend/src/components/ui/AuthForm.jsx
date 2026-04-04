const AuthForm = ({ children, onSubmit, submitText }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}

      <button
        type="submit"
        className="w-full !bg-red-500 hover:!bg-red-600 active:!bg-red-700 text-white font-semibold py-3 rounded-full transition"
      >
        {submitText}
      </button>
    </form>
  );
};

export default AuthForm;
