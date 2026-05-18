interface ExerciseCardProps {
  name: string;
  color: string;
  onClick: () => void;
}

export function ExerciseCard({ name, color, onClick }: ExerciseCardProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 h-40 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer hover:opacity-90`}
    >
      <p className="text-white font-semibold text-center text-lg">{name}</p>
    </button>
  );
}
