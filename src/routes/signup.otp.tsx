import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppScreen } from "@/components/vessa/AppScreen";
import { FlowHeader } from "@/components/vessa/FlowHeader";
import { OtpStep } from "@/components/vessa/OtpStep";
import { useRequireDraft } from "@/hooks/use-guards";
import { useVessa } from "@/lib/store";
import { formatPhone, isValidPhone } from "@/lib/vessa-rules";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/signup/otp")({
  head: () =>
    pageHead("Enter OTP", "Verify your mobile number with the one-time code we sent you."),
  component: SignupOtp,
});

function SignupOtp() {
  const navigate = useNavigate();
  const draft = useVessa((s) => s.draft);
  const ready = useRequireDraft((s) => isValidPhone(s.draft.countryCode, s.draft.phone));
  if (!ready) return <AppScreen>{null}</AppScreen>;

  return (
    <AppScreen>
      <FlowHeader showLogo={false} />
      <OtpStep
        purpose="signup"
        countryCode={draft.countryCode}
        phone={draft.phone}
        phoneDisplay={formatPhone(draft.countryCode, draft.phone)}
        onChangeNumber={() => navigate({ to: "/signup/phone" })}
        onVerified={() => {
          useVessa.getState().updateDraft({ otpVerified: true });
          useVessa.getState().clearOtp();
          navigate({ to: "/signup/profile" });
        }}
      />
    </AppScreen>
  );
}
