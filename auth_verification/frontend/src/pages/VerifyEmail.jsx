function VerifyEmail() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="min-h-screen flex items-center justify-center bg-geen-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">
            Check you email
          </h2>
          <p>
            we have sent you email to verify account.Please check you inbox and
            click the verification link
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
