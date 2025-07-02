import { Plus, Zap, Flame } from "lucide-react";

const GraphpageToggle = () => {
  return (
    <div className="w-[300px] mx-auto flex items-center justify-evenly mb-5 rounded-full overflow-hidden">
      <div className="w-[33.33%] relative group flex items-center justify-center gap-2 bg-stone-700 text-white px-4 py-2.5 text-sm font-bold hover:bg-purple-600 transition">
        <Plus size={16} />
        option
      </div>
      <div className="w-[33.33%] relative group flex items-center justify-center border-x border-[#636363] gap-2 bg-stone-700 text-white px-4 py-2.5 text-sm font-bold hover:bg-purple-600 transition">
        <Zap size={16} />
        option
      </div>
      <div className="w-[33.33%] relative group flex items-center justify-center gap-2 bg-stone-700 text-white px-4 py-2.5 text-sm font-bold hover:bg-purple-600 transition">
        <Flame size={16} />
        option
      </div>
    </div>
  );
};

export default GraphpageToggle;
