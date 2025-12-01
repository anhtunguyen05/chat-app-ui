import { useCallTimer } from "@/hooks/useCallTimer";

export default function CallDuration() {
  const { formattedDuration } = useCallTimer();

  return (
    <div className="text-white/90 text-xl font-mono">
      {formattedDuration}
    </div>
  );
}
