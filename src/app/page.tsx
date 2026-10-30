import type { Metadata } from "next";
import { ChangelogSection } from "@/components/changelog-section";
import { Experiments } from "@/components/experiments";
import { Hero } from "@/components/hero";
import { JsonLd } from "@/components/json-ld";
import { Manifesto } from "@/components/manifesto";
import { PageContainer } from "@/components/page-container";
import { Pillars } from "@/components/pillars";
import { Products } from "@/components/products";
import {
  absoluteUrl,
  GITHUB_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <PageContainer>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              inLanguage: "en",
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: SITE_NAME,
              url: SITE_URL,
              logo: absoluteUrl("/icon.svg"),
              sameAs: [GITHUB_URL],
            },
          ],
        }}
      />
      <Hero />
      <Products />
      <Pillars />
      <Experiments />
      <ChangelogSection />
      <Manifesto />
    </PageContainer>
  );
}
