import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-indigo-500 hover:bg-indigo-600",
            card: "shadow-xl",
          }
        }}
      />
    </div>
  );
}

