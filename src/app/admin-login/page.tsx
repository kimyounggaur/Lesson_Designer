import { adminLoginAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";

export default function AdminLoginPage() {
  return (
    <AuthForm
      title="관리자 로그인"
      description="관리자 role이 지정된 계정만 관리자 페이지에 들어갈 수 있습니다."
      submitLabel="관리자 로그인"
      action={adminLoginAction}
    />
  );
}
