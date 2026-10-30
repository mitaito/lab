import type { Metadata } from "next";
import { ChangelogSection } from "@/components/home/changelog-section";
import { Experiments } from "@/components/home/experiments";
import { Hero } from "@/components/home/hero";
import { JsonLd } from "@/components/ui/json-ld";
import { Manifesto } from "@/components/home/manifesto";
import { PageContainer } from "@/components/ui/page-container";
import { Pillars } from "@/components/home/pillars";
import { Products } from "@/components/home/products";
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
