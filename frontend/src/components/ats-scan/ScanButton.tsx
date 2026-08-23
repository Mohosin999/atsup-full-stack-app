import Button from "../ui/Button";

interface ScanButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}

export default function ScanButton({
  disabled,
  loading,
  onClick,
}: ScanButtonProps) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
    >
      {loading ? "Scanning..." : "Scan Now"}
    </Button>
  );
}
