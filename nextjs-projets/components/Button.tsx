"use client";

const handleClick = () => {
  console.log("Hello");
};

const Button = () => {
  return (
    <button className="bg-red-500 p-4 rounded-3xl" onClick={handleClick}>
      Lets explore more
    </button>
  );
};

export default Button;
