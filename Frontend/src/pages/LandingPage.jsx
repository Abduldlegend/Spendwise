import LandingHeader from '../components/landing/LandingHeader'
import HeroSection from '../components/landing/HeroSection'
import ProblemSection from '../components/landing/ProblemSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import ShowcaseSection from '../components/landing/ShowcaseSection'
import PrinciplesSection from '../components/landing/PrinciplesSection'
import FaqSection from '../components/landing/FaqSection'
import FinalCtaSection from '../components/landing/FinalCtaSection'
import LandingFooter from '../components/landing/LandingFooter'

/**
 * Public marketing landing page, mounted at `/`.
 *
 * Composed entirely of presentational sections from `components/landing/`; it
 * reads no app data. The header's theme control is the only shared state it
 * touches, and only through `ThemeContext`.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <LandingHeader />
      <main className="ledger-grid flex-1">
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ShowcaseSection />
        <PrinciplesSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
