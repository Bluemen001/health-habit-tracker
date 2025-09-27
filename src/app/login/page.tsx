export const dynamic = "force-dynamic";

import LoginForm from "@/components/auth/LoginForm";

export default function Page() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4 py-10">
      <LoginForm />
    </div>
  );
}