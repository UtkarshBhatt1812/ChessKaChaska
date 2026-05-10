type EvaluationBarProps = {
  evalScore: number; 
  mate?: number | null;
};

export default function EvaluationBar({ evalScore, mate }: EvaluationBarProps) {
  let percentage = 50;
  if (mate !== null && mate !== undefined) {
    percentage = mate > 0 ? 100 : 0;
  } else {
    const clamped = Math.max(-2000, Math.min(2000, evalScore));
    const normalized = clamped / 400; 
    percentage = 50 + normalized * 50;
    percentage = Math.max(0, Math.min(100, percentage));
  }

  return (
    <div className="hidden lg:flex flex-col items-center gap-3">
      <div className="relative w-3 h-[480px] rounded-full overflow-hidden border border-gray-600 bg-neutral-800">

        <div
          className="absolute top-0 w-full bg-black transition-all duration-500 ease-out"
          style={{ height: `${100 - percentage}%` }}
        />

        <div
          className="absolute bottom-0 w-full bg-white transition-all duration-500 ease-out"
          style={{ height: `${percentage}%` }}
        />
        


        <div className="absolute top-1/2 w-full h-[1px] bg-gray-500 opacity-40" />
      </div>
      <span className="text-xs text-gray-400 font-medium">
        {mate !== null && mate !== undefined
          ? `M${mate > 0 ? mate : mate}`
          : evalScore > 0
          ? `+${(evalScore / 100).toFixed(1)}`
          : (evalScore / 100).toFixed(1)}
      </span>
    </div>
  );
}