interface WrapperProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

const WrapperHome = ({
  children,
  maxWidth = "w-full",
  className,
}: WrapperProps) => {
  return (
    <div
      className={`${maxWidth} mx-auto px-4 lg:px-24 xl:px-32 2xl:px-40 ${className}`}
    >
      {children}
    </div>
  );
};

export default WrapperHome;
