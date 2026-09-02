import Image from "next/image";

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-10 lg:py-16">
        <div className="relative z-10 max-w-xl">
          <p className="section-label mb-7 animate-[hero-fade-up_650ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
            <span className="section-label-rule" />
            Global surgical instrument manufacturing
          </p>

          <h1 className="section-heading max-w-xl animate-[hero-fade-up_700ms_cubic-bezier(0.22,1,0.36,1)_120ms_both] text-[2.25rem] sm:text-[2.9rem] lg:text-[3.45rem] motion-reduce:animate-none">
            Trusted by hands that save lives.
          </h1>

          <p className="body-copy mt-7 max-w-lg animate-[hero-fade-up_700ms_cubic-bezier(0.22,1,0.36,1)_220ms_both] text-base sm:text-[1.05rem] motion-reduce:animate-none">
            We manufacture precision surgical instruments for distributors, hospitals, surgeons, and medical brands that need a dependable long-term supply partner.
          </p>

          <div className="mt-9 animate-[hero-fade-up_700ms_cubic-bezier(0.22,1,0.36,1)_320ms_both] motion-reduce:animate-none">
            <a href="#categories" className="btn-primary">
              Explore Products
              <span className="size-4">
                <ArrowUpRightIcon />
              </span>
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl animate-[hero-fade-up_800ms_cubic-bezier(0.22,1,0.36,1)_180ms_both] lg:ml-auto lg:mr-0 lg:max-w-[88%] motion-reduce:animate-none">
          <div className="relative aspect-[1.08/1] animate-[hero-float_4.8s_ease-in-out_infinite] overflow-hidden rounded-bl-[4.5rem] rounded-tr-[4.5rem] bg-navy shadow-[0_24px_48px_rgba(10,35,66,0.16)] sm:rounded-bl-[6.5rem] sm:rounded-tr-[6.5rem] motion-reduce:animate-none">
            <Image
              src="/images/ChatGPT%20Image%20Aug%2017%2C%202026%2C%2004_54_45%20PM.png"
              alt="Precision stainless-steel surgical instruments arranged in a studio setting"
              fill
              preload
              sizes="(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) 36rem, 32rem"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
