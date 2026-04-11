export default function EvaluationBar() {
  return (
    <div className="hidden lg:flex flex-col items-center gap-3">
      <div className="w-2 h-[480px] bg-white rounded-full overflow-hidden flex flex-col justify-end">
        <div className="bg-black w-full h-[54%]" />
      </div>
      <span className="text-xs text-gray-400">Eval</span>
    </div>
  );
}