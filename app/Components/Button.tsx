export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
}: Readonly<{
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // <-- now optional
  className?: string;
}>) {
  return (
    <button
      onClick={onClick}
      className={`bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700 cursor-pointer ${className}`}
      type={type}
    >
      {children}
    </button>
  );
}
