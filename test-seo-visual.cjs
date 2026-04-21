const { chromium } = require('playwright');
const fs = require('fs');

/**
 * Visual SEO Test - Captures screenshots and validates visual elements
 */

(async () => {
  let browser;
  let exitCode = 0;

  try {
    console.log('\n📸 Starting Visual SEO Test...\n');
    console.log('=' .repeat(60));

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Navigate to the page
    console.log('\n📄 Loading page: http://localhost:8080\n');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    // Take full page screenshot
    console.log('📸 Capturing full page screenshot...');
    await page.screenshot({
      path: 'seo-test-fullpage.png',
      fullPage: true
    });
    console.log('✓ Saved: seo-test-fullpage.png\n');

    // Test and capture hero section
    console.log('📸 Capturing hero section...');
    const heroSection = await page.locator('header').first();
    if (heroSection) {
      await heroSection.screenshot({ path: 'seo-test-hero.png' });
      console.log('✓ Saved: seo-test-hero.png\n');
    }

    // Validate SEO elements are visible
    console.log('🔍 Validating visible SEO elements...\n');

    // Check H1 is visible
    const h1 = await page.locator('h1').first();
    const h1Text = await h1.textContent();
    const h1Visible = await h1.isVisible();

    if (h1Visible) {
      console.log(`✓ H1 is visible: "${h1Text}"`);
    } else {
      console.log('✗ H1 is not visible');
      exitCode = 1;
    }

    // Check logo alt text
    const logo = await page.locator('img[alt*="Know My EMI"]').first();
    if (logo) {
      const altText = await logo.getAttribute('alt');
      console.log(`✓ Logo has alt text: "${altText}"`);
    } else {
      console.log('⚠ Logo alt text not found');
    }

    // Verify structured data in HTML
    console.log('\n🏗️  Extracting structured data...\n');
    const structuredData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      if (script) {
        try {
          return JSON.parse(script.textContent);
        } catch (e) {
          return null;
        }
      }
      return null;
    });

    if (structuredData && structuredData['@graph']) {
      console.log('✓ Structured data found with @graph');
      const types = structuredData['@graph'].map(item => item['@type']);
      console.log(`  Types: ${types.join(', ')}\n`);

      // Save structured data to file
      fs.writeFileSync('seo-structured-data.json', JSON.stringify(structuredData, null, 2));
      console.log('✓ Saved: seo-structured-data.json\n');
    }

    // Test meta tags in rendered HTML
    console.log('🏷️  Verifying meta tags in DOM...\n');

    const metaTags = await page.evaluate(() => {
      const tags = {};

      // Get all meta tags
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          tags[name] = content;
        }
      });

      // Get title
      tags['title'] = document.title;

      // Get canonical
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        tags['canonical'] = canonical.getAttribute('href');
      }

      return tags;
    });

    console.log('Meta Tags Found:');
    console.log(`  Title: ${metaTags.title}`);
    console.log(`  Description: ${metaTags.description?.substring(0, 50)}...`);
    console.log(`  Keywords: ${metaTags.keywords?.split(',').length} keywords`);
    console.log(`  OG:Title: ${metaTags['og:title']}`);
    console.log(`  OG:Image: ${metaTags['og:image']}`);
    console.log(`  Twitter:Card: ${metaTags['twitter:card']}`);
    console.log(`  Canonical: ${metaTags.canonical}\n`);

    // Test mobile viewport
    console.log('📱 Testing mobile viewport...\n');
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.screenshot({
      path: 'seo-test-mobile.png',
      fullPage: true
    });
    console.log('✓ Saved: seo-test-mobile.png\n');

    // Test tablet viewport
    console.log('💻 Testing tablet viewport...\n');
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.screenshot({
      path: 'seo-test-tablet.png',
      fullPage: true
    });
    console.log('✓ Saved: seo-test-tablet.png\n');

    // Verify page is responsive
    console.log('📐 Verifying responsive design...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    const isResponsive = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      return viewport && viewport.getAttribute('content').includes('width=device-width');
    });

    if (isResponsive) {
      console.log('✓ Page is responsive (viewport meta tag configured)\n');
    } else {
      console.log('✗ Page may not be responsive\n');
      exitCode = 1;
    }

    // Generate SEO preview card
    console.log('🎴 Generating SEO preview card...\n');

    const seoPreview = {
      title: metaTags.title,
      description: metaTags.description,
      url: metaTags.canonical,
      image: metaTags['og:image'],
      favicon: await page.evaluate(() => {
        const favicon = document.querySelector('link[rel="icon"]');
        return favicon ? favicon.getAttribute('href') : null;
      })
    };

    fs.writeFileSync('seo-preview.json', JSON.stringify(seoPreview, null, 2));
    console.log('✓ Saved: seo-preview.json');
    console.log(`  This shows how your page will appear in search results\n`);

    // Summary
    console.log('=' .repeat(60));
    console.log('\n✅ Visual SEO Test Complete!\n');
    console.log('Screenshots generated:');
    console.log('  • seo-test-fullpage.png - Full page desktop view');
    console.log('  • seo-test-hero.png - Hero section');
    console.log('  • seo-test-mobile.png - Mobile view (iPhone)');
    console.log('  • seo-test-tablet.png - Tablet view (iPad)');
    console.log('\nData files generated:');
    console.log('  • seo-structured-data.json - JSON-LD schema');
    console.log('  • seo-preview.json - Search result preview\n');
    console.log('=' .repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error during visual SEO testing:', error.message);
    exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
    process.exit(exitCode);
  }
})();
