interface StatsBarProps {
  name: string;
  value: number;
  max: number;
  color: string;
}

export default function StatsBar({ name, value, max, color }: StatsBarProps) {
  const percentage = (value / max) * 100;
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{name}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`${color} h-3 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
