import { signUpAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <AuthForm
      title="회원가입"
      description="회원 계정으로 가입하면 모든 악기 교육앱과 음악 게임앱을 이용할 수 있습니다."
      submitLabel="회원가입"
      action={signUpAction}
    />
  );
}
