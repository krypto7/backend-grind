import { Logo } from "@/components/auth/logo";

const steps = [
  {
    number: "01",
    title: "Create an account",
    text: "Name, username, email, and a photo.",
  },
  {
    number: "02",
    title: "Confirm the code",
    text: "A 6-digit code arrives in your inbox.",
  },
  {
    number: "03",
    title: "Sign in",
    text: "Use the same email and password next time.",
  },
];

export function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[#14241f] text-[#f6f3ec] lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-between lg:px-10 lg:py-10 xl:px-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[#c4a574]/15 blur-3xl"
      />
      <Logo tone="light" />

      <div className="relative max-w-md">
        <p className="text-xs font-medium tracking-[0.18em] text-[#c4a574] uppercase">
          The Networth
        </p>
        <h2 className="mt-4 font-serif text-4xl leading-[1.15] tracking-tight text-balance xl:text-5xl">
          A simple way in.
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-6 text-[#d7e0db]">
          Create an account, confirm the code we email you, then sign in. That
          is the whole start.
        </p>

        <ol className="mt-10 space-y-5">
          {steps.map((step) => (
            <li key={step.number} className="flex gap-4">
              <span className="mt-0.5 text-xs font-medium tracking-wide text-[#c4a574]">
                {step.number}
              </span>
              <span>
                <span className="block text-sm font-medium">{step.title}</span>
                <span className="mt-1 block text-sm leading-5 text-[#b7c4be]">
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="relative text-sm text-[#b7c4be]">
        A short setup. Then the account is yours.
      </p>
    </aside>
  );
}
