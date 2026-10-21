import { loginAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";
import { safeNext } from "@/lib/safe-next";

type LoginPageProps = {
  searchParams: Promise<{ required?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { required, next } = await searchParams;

  return (
    <AuthForm
      title="회원 로그인"
      description="회원 계정으로 로그인하면 모든 앱 선택 버튼이 활성화됩니다."
      submitLabel="로그인"
      action={loginAction}
      next={safeNext(next)}
      notice={required ? "이 앱은 회원 로그인 후 이용할 수 있습니다." : undefined}
    />
  );
}
