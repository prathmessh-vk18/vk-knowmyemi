import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export function SEO({
  title = "Know My EMI - Loan Calculator & Repayment Strategy Tool",
  description = "Calculate your EMI, understand total interest cost, and discover strategies to pay off your loan faster. No signup required - 100% free loan analysis tool.",
  keywords = "EMI calculator, loan calculator, home loan EMI, personal loan calculator, interest calculator, loan repayment strategy, debt payoff, amortization calculator, India loan calculator",
  canonical = "https://knowmyemi.com/",
  ogImage = "https://knowmyemi.com/icon.png",
  ogType = "website",
}: SEOProps) {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}
