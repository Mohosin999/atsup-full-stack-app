interface WrapperProps {
  children: React.ReactNode;
  maxWidth?: string;
}

const Wrapper = ({ children, maxWidth = "w-full" }: WrapperProps) => {
  return (
    <div className={`${maxWidth} mx-auto px-3 lg:px-16`}>
      {children}
    </div>
  );
};

export default Wrapper;
