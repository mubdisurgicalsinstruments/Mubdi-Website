import type { PolicyPageDefinition } from "@/app/lib/policy-pages";

type PolicyPageContentProps = {
  policy: PolicyPageDefinition;
};

export default function PolicyPageContent({ policy }: PolicyPageContentProps) {
  return (
    <section className="bg-background py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="section-label">
            <span className="section-label-rule" />
            Policies
          </p>
          <h1 className="section-heading mt-4 text-3xl sm:text-4xl">{policy.title}</h1>
          <p className="body-copy mt-4 text-sm sm:text-base">{policy.intro}</p>
        </div>

        <article className="mt-8 rounded-xl border border-border bg-white px-5 py-6 sm:px-7 sm:py-8 lg:mt-10">
          <div className="mx-auto max-w-3xl">
            {policy.sections.map((section) => (
              <section key={section.title} className="border-b border-border-light py-6 first:pt-0 last:border-b-0 last:pb-0">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-navy sm:text-xl">
                  {section.title}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="body-copy mt-3 text-sm leading-7 sm:text-[0.95rem]">
                    {paragraph}
                  </p>
                ))}

                {section.bullets ? (
                  <ul className="mt-3 space-y-2.5 text-sm leading-7 text-navy-muted sm:text-[0.95rem]">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-navy/70" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
