import Wrapper from "../Wrapper";

const stats = [
  { value: "7/day", label: "Free AI Scans" },
  { value: "100%", label: "ATS Format Score" },
  { value: "5", label: "Saved Resumes" },
  { value: "2s", label: "Auto-Save" },
];

export default function StatsBar() {
  return (
    <section className="py-10 md:py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-secondary/30">
      <Wrapper>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                {stat.value}
              </p>
              <p className="mt-1 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Wrapper>
    </section>
  );
}
