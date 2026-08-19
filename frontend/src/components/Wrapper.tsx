interface WrapperProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

const Wrapper = ({ children, maxWidth = "w-full", className }: WrapperProps) => {
  return (
    <div className={`${maxWidth} mx-auto px-4 lg:px-16 ${className}`}>
      {children}
    </div>
  );
};

export default Wrapper;
