import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)}>
      <ArrowLeft className="w-5 h-5 text-gray-800 hover:text-green-500" />
    </button>
  );
}
