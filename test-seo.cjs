const { chromium } = require('playwright');
const fs = require('fs');

/**
 * Comprehensive SEO Test Suite for Know My EMI
 *
 * Tests cover:
 * 1. Meta tags (title, description, keywords, robots)
 * 2. Open Graph tags
 * 3. Twitter Card tags
 * 4. Structured data (JSON-LD)
 * 5. Canonical URLs
 * 6. Semantic HTML structure
 * 7. Heading hierarchy
 * 8. Image alt attributes
 * 9. Performance metrics (page load)
 */

(async () => {
  let browser;
  let exitCode = 0;
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    console.log('\n🔍 Starting SEO Optimization Test Suite...\n');
    console.log('=' .repeat(60));

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the page
    console.log('\n📄 Loading page: http://localhost:8080\n');
    const startTime = Date.now();
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    console.log(`✓ Page loaded in ${loadTime}ms\n`);

    if (loadTime > 3000) {
      results.warnings.push(`Page load time (${loadTime}ms) exceeds recommended 3000ms`);
    } else {
      results.passed.push(`Page load time (${loadTime}ms) is excellent`);
    }

    // ===== 1. PRIMARY META TAGS =====
    console.log('🏷️  Testing Primary Meta Tags...\n');

    const title = await page.title();
    if (title && title.length > 0 && title.length <= 60) {
      console.log(`✓ Page title: "${title}" (${title.length} chars)`);
      results.passed.push('Page title exists and is optimal length');
    } else if (title.length > 60) {
      console.log(`⚠ Page title too long: ${title.length} chars (recommended: 50-60)`);
      results.warnings.push('Page title exceeds 60 characters');
    } else {
      console.log('✗ Page title missing or empty');
      results.failed.push('Page title missing');
      exitCode = 1;
    }

    const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
    if (metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160) {
      console.log(`✓ Meta description: ${metaDescription.length} chars (optimal)`);
      results.passed.push('Meta description exists and is optimal length');
    } else if (metaDescription && metaDescription.length > 160) {
      console.log(`⚠ Meta description too long: ${metaDescription.length} chars`);
      results.warnings.push('Meta description exceeds 160 characters');
    } else {
      console.log('✗ Meta description missing or too short');
      results.failed.push('Meta description missing or suboptimal');
      exitCode = 1;
    }

    const metaKeywords = await page.getAttribute('meta[name="keywords"]', 'content');
    if (metaKeywords) {
      const keywordCount = metaKeywords.split(',').length;
      console.log(`✓ Meta keywords: ${keywordCount} keywords defined`);
      results.passed.push(`Meta keywords present (${keywordCount} keywords)`);
    } else {
      console.log('⚠ Meta keywords missing (optional but helpful)');
      results.warnings.push('Meta keywords not defined');
    }

    const robotsMeta = await page.getAttribute('meta[name="robots"]', 'content');
    if (robotsMeta && robotsMeta.includes('index') && robotsMeta.includes('follow')) {
      console.log(`✓ Robots meta tag: "${robotsMeta}"`);
      results.passed.push('Robots meta tag configured correctly');
    } else {
      console.log('✗ Robots meta tag missing or misconfigured');
      results.failed.push('Robots meta tag not properly configured');
      exitCode = 1;
    }

    // ===== 2. OPEN GRAPH TAGS =====
    console.log('\n📱 Testing Open Graph Tags...\n');

    const ogTags = {
      'og:title': await page.getAttribute('meta[property="og:title"]', 'content'),
      'og:description': await page.getAttribute('meta[property="og:description"]', 'content'),
      'og:image': await page.getAttribute('meta[property="og:image"]', 'content'),
      'og:url': await page.getAttribute('meta[property="og:url"]', 'content'),
      'og:type': await page.getAttribute('meta[property="og:type"]', 'content'),
      'og:locale': await page.getAttribute('meta[property="og:locale"]', 'content'),
      'og:site_name': await page.getAttribute('meta[property="og:site_name"]', 'content')
    };

    let ogPassed = true;
    for (const [key, value] of Object.entries(ogTags)) {
      if (value) {
        console.log(`✓ ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
      } else {
        console.log(`✗ ${key}: missing`);
        ogPassed = false;
      }
    }

    if (ogPassed) {
      results.passed.push('All Open Graph tags present');
    } else {
      results.failed.push('Some Open Graph tags missing');
      exitCode = 1;
    }

    // ===== 3. TWITTER CARD TAGS =====
    console.log('\n🐦 Testing Twitter Card Tags...\n');

    const twitterTags = {
      'twitter:card': await page.getAttribute('meta[name="twitter:card"]', 'content'),
      'twitter:title': await page.getAttribute('meta[name="twitter:title"]', 'content'),
      'twitter:description': await page.getAttribute('meta[name="twitter:description"]', 'content'),
      'twitter:image': await page.getAttribute('meta[name="twitter:image"]', 'content')
    };

    let twitterPassed = true;
    for (const [key, value] of Object.entries(twitterTags)) {
      if (value) {
        console.log(`✓ ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
      } else {
        console.log(`✗ ${key}: missing`);
        twitterPassed = false;
      }
    }

    if (twitterPassed) {
      results.passed.push('All Twitter Card tags present');
    } else {
      results.failed.push('Some Twitter Card tags missing');
      exitCode = 1;
    }

    // ===== 4. STRUCTURED DATA (JSON-LD) =====
    console.log('\n🏗️  Testing Structured Data (JSON-LD)...\n');

    const jsonLdScripts = await page.$$eval('script[type="application/ld+json"]', scripts =>
      scripts.map(script => {
        try {
          return JSON.parse(script.textContent);
        } catch (e) {
          return null;
        }
      }).filter(Boolean)
    );

    if (jsonLdScripts.length > 0) {
      console.log(`✓ Found ${jsonLdScripts.length} JSON-LD structured data block(s)`);

      const firstSchema = jsonLdScripts[0];
      if (firstSchema['@graph']) {
        const types = firstSchema['@graph'].map(item => item['@type']).filter(Boolean);
        console.log(`✓ Schema types: ${types.join(', ')}`);
        results.passed.push(`Structured data present with types: ${types.join(', ')}`);
      } else if (firstSchema['@type']) {
        console.log(`✓ Schema type: ${firstSchema['@type']}`);
        results.passed.push(`Structured data present (${firstSchema['@type']})`);
      }
    } else {
      console.log('✗ No JSON-LD structured data found');
      results.failed.push('JSON-LD structured data missing');
      exitCode = 1;
    }

    // ===== 5. CANONICAL URL =====
    console.log('\n🔗 Testing Canonical URL...\n');

    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    if (canonical) {
      console.log(`✓ Canonical URL: ${canonical}`);
      results.passed.push('Canonical URL defined');
    } else {
      console.log('✗ Canonical URL missing');
      results.failed.push('Canonical URL not defined');
      exitCode = 1;
    }

    // ===== 6. SEMANTIC HTML =====
    console.log('\n📋 Testing Semantic HTML Structure...\n');

    const semanticElements = {
      'header': await page.locator('header').count(),
      'main': await page.locator('main').count(),
      'footer': await page.locator('footer').count(),
      'article': await page.locator('article').count(),
      'section': await page.locator('section').count(),
      'nav': await page.locator('nav').count()
    };

    let semanticPassed = true;
    for (const [tag, count] of Object.entries(semanticElements)) {
      if (count > 0) {
        console.log(`✓ <${tag}>: ${count} element(s) found`);
      } else if (tag === 'header' || tag === 'main' || tag === 'footer') {
        console.log(`✗ <${tag}>: missing (required)`);
        semanticPassed = false;
      } else {
        console.log(`⚠ <${tag}>: not found`);
      }
    }

    if (semanticPassed) {
      results.passed.push('Core semantic HTML elements present');
    } else {
      results.failed.push('Missing required semantic HTML elements');
      exitCode = 1;
    }

    // ===== 7. HEADING HIERARCHY =====
    console.log('\n📑 Testing Heading Hierarchy...\n');

    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();

    console.log(`H1 tags: ${h1Count}`);
    console.log(`H2 tags: ${h2Count}`);
    console.log(`H3 tags: ${h3Count}`);

    if (h1Count === 1) {
      console.log('✓ Exactly one H1 tag (optimal)');
      results.passed.push('Single H1 tag present');
    } else if (h1Count === 0) {
      console.log('✗ No H1 tag found');
      results.failed.push('H1 tag missing');
      exitCode = 1;
    } else {
      console.log(`⚠ Multiple H1 tags found (${h1Count})`);
      results.warnings.push(`Multiple H1 tags (${h1Count}) detected`);
    }

    // ===== 8. IMAGE ALT ATTRIBUTES =====
    console.log('\n🖼️  Testing Image Alt Attributes...\n');

    const images = await page.$$('img');
    let imagesWithAlt = 0;
    let imagesWithoutAlt = 0;

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (alt !== null) {
        imagesWithAlt++;
      } else {
        imagesWithoutAlt++;
      }
    }

    console.log(`Total images: ${images.length}`);
    console.log(`Images with alt text: ${imagesWithAlt}`);
    console.log(`Images without alt text: ${imagesWithoutAlt}`);

    if (imagesWithoutAlt === 0 && images.length > 0) {
      console.log('✓ All images have alt attributes');
      results.passed.push('All images have alt text');
    } else if (imagesWithoutAlt > 0) {
      console.log(`⚠ ${imagesWithoutAlt} image(s) missing alt attributes`);
      results.warnings.push(`${imagesWithoutAlt} images missing alt text`);
    }

    // ===== 9. ADDITIONAL SEO CHECKS =====
    console.log('\n🔧 Additional SEO Checks...\n');

    // Check for viewport meta tag
    const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
    if (viewport) {
      console.log(`✓ Viewport meta tag: ${viewport}`);
      results.passed.push('Viewport meta tag present');
    } else {
      console.log('✗ Viewport meta tag missing');
      results.failed.push('Viewport meta tag missing');
      exitCode = 1;
    }

    // Check for theme color
    const themeColor = await page.getAttribute('meta[name="theme-color"]', 'content');
    if (themeColor) {
      console.log(`✓ Theme color: ${themeColor}`);
      results.passed.push('Theme color defined');
    } else {
      console.log('⚠ Theme color not defined');
      results.warnings.push('Theme color not defined');
    }

    // Check for favicon
    const favicon = await page.locator('link[rel="icon"]').count();
    if (favicon > 0) {
      console.log('✓ Favicon defined');
      results.passed.push('Favicon present');
    } else {
      console.log('✗ Favicon missing');
      results.failed.push('Favicon missing');
      exitCode = 1;
    }

    // Check for lang attribute
    const lang = await page.getAttribute('html', 'lang');
    if (lang) {
      console.log(`✓ HTML lang attribute: ${lang}`);
      results.passed.push(`Language defined (${lang})`);
    } else {
      console.log('✗ HTML lang attribute missing');
      results.failed.push('HTML lang attribute missing');
      exitCode = 1;
    }

    // ===== SUMMARY =====
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 SEO Test Results Summary\n');
    console.log('='.repeat(60));
    console.log(`\n✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);

    if (results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      results.failed.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item}`);
      });
    }

    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.warnings.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item}`);
      });
    }

    console.log('\n' + '='.repeat(60));

    if (exitCode === 0) {
      console.log('\n✅ All SEO tests passed!\n');
    } else {
      console.log('\n❌ Some SEO tests failed. Please review the results above.\n');
    }

    // Save detailed results to file
    const reportPath = 'seo-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      loadTime: `${loadTime}ms`,
      results,
      summary: {
        passed: results.passed.length,
        failed: results.failed.length,
        warnings: results.warnings.length
      }
    }, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);

  } catch (error) {
    console.error('\n❌ Error during SEO testing:', error.message);
    exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
    process.exit(exitCode);
  }
})();
