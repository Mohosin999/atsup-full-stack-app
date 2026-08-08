/* ===================================
Credits Badge Component
=================================== */
interface CreditsBadgeProps {
  user: {
    subscription: {
      credits: number;
    };
  };
}

export default function CreditsBadge({ user }: CreditsBadgeProps) {
  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
      <span className="text-sm font-medium text-green-600">{user.subscription.credits} credits</span>
    </div>
  );
}
