import { QuizClient } from "./quiz-client";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <QuizClient token={token} />;
}
