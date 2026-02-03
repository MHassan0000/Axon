export default function Home() {
  return (
    <div className="min-h-screen p-8">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-zinc-100 dark:text-zinc-100">
          Welcome to Axon
        </h1>
        <p className="text-xl text-zinc-400 dark:text-zinc-400 mb-12">
          Your modern project and task management platform
        </p>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-zinc-900 dark:bg-zinc-900 border border-zinc-700 dark:border-zinc-700 rounded-lg p-6 hover:border-indigo-500 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-2 text-zinc-100 dark:text-zinc-100">
              Projects
            </h3>
            <p className="text-zinc-400 dark:text-zinc-400 text-sm">
              Organize your work into manageable projects and track progress
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900 dark:bg-zinc-900 border border-zinc-700 dark:border-zinc-700 rounded-lg p-6 hover:border-indigo-500 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-2 text-zinc-100 dark:text-zinc-100">
              Tasks
            </h3>
            <p className="text-zinc-400 dark:text-zinc-400 text-sm">
              Break down work into tasks and collaborate with your team
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-900 dark:bg-zinc-900 border border-zinc-700 dark:border-zinc-700 rounded-lg p-6 hover:border-indigo-500 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-2 text-zinc-100 dark:text-zinc-100">
              Analytics
            </h3>
            <p className="text-zinc-400 dark:text-zinc-400 text-sm">
              Track performance and gain insights into team productivity
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-4">
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-lg hover:shadow-xl">
            Get Started
          </button>
          <button className="bg-zinc-800 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-zinc-100 dark:text-zinc-100 px-6 py-3 rounded-lg font-medium border border-zinc-700 dark:border-zinc-700 transition-colors duration-300">
            Learn More
          </button>
        </div>

        {/* Status Messages Demo */}
        <div className="mt-12 space-y-4">
          <div className="bg-zinc-900 dark:bg-zinc-900 border-l-4 border-emerald-500 p-4 rounded">
            <p className="text-zinc-100 dark:text-zinc-100 font-medium">
              ✓ Theme system successfully configured
            </p>
          </div>
          <div className="bg-zinc-900 dark:bg-zinc-900 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-zinc-100 dark:text-zinc-100 font-medium">
              ⚠ Toggle between light/dark mode using the button in the top right
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
