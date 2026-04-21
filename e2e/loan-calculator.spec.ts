import { test, expect } from "@playwright/test";

// Helper: click Calculate and wait for results to appear
async function calculate(page: any) {
  await page.getByRole("button", { name: /calculate my emi/i }).click();
  await expect(page.getByText(/monthly emi/i)).toBeVisible({ timeout: 8000 });
}

// Helper: get a strategy's Switch button by its 0-based index in the panel
// Order: 0=Step-Up, 1=Annual Prepayment, 2=Extra EMI, 3=One-Time, 4=Monthly Top-Up, 5=Refinance
function strategySwitch(page: any, index: number) {
  return page.locator('[role="switch"]').nth(index);
}

test.describe("Know My EMI — Loan Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero section and logo", async ({ page }) => {
    await expect(page.locator("header img[alt='Know My EMI Logo']")).toBeVisible();
    const cta = page.getByRole("button", { name: /calculate/i }).first();
    await expect(cta).toBeVisible();
  });

  test("shows input panel with default Home Loan values", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Loan Details" })).toBeVisible();
    // Home loan type button should exist
    const homeBtn = page.getByRole("button", { name: /^home$/i });
    await expect(homeBtn).toBeVisible();
  });

  test("calculates EMI on button click", async ({ page }) => {
    await calculate(page);
    // Both summary cards should be visible after calculation
    await expect(page.getByRole("heading", { name: /total interest/i })).toBeVisible();
  });

  test("switching loan type changes defaults", async ({ page }) => {
    await page.getByRole("button", { name: /^car$/i }).click();
    // Car loan default is ₹7,00,000
    await expect(page.getByText(/7,00,000/)).toBeVisible({ timeout: 3000 });
  });

  test("currency selector changes symbol", async ({ page }) => {
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /USD/i }).click();
    await expect(page.getByText(/\$ USD/i)).toBeVisible({ timeout: 3000 });
  });

  test("all 6 strategy cards appear after calculating", async ({ page }) => {
    await calculate(page);
    await expect(page.getByText("Step-Up EMI")).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Annual Prepayment")).toBeVisible();
    await expect(page.getByText("One Extra EMI Per Year")).toBeVisible();
    await expect(page.getByText("One-Time Lump Sum")).toBeVisible();
    await expect(page.getByText("Monthly Top-Up")).toBeVisible();
    await expect(page.getByText("Refinance Check")).toBeVisible();
  });

  test("enabling Step-Up EMI shows interest and time saved", async ({ page }) => {
    await calculate(page);
    await page.waitForSelector("text=Step-Up EMI", { timeout: 8000 });
    await strategySwitch(page, 0).click();

    await expect(page.getByText(/interest saved/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/time saved/i)).toBeVisible({ timeout: 5000 });
  });

  test("enabling One Extra EMI Per Year shows savings", async ({ page }) => {
    await calculate(page);
    await page.waitForSelector("text=One Extra EMI Per Year", { timeout: 8000 });
    await strategySwitch(page, 2).click();

    await expect(page.getByText(/interest saved/i)).toBeVisible({ timeout: 5000 });
  });

  test("enabling Monthly Top-Up shows savings", async ({ page }) => {
    await calculate(page);
    await page.waitForSelector("text=Monthly Top-Up", { timeout: 8000 });
    await strategySwitch(page, 4).click();

    await expect(page.getByText(/interest saved/i)).toBeVisible({ timeout: 5000 });
  });

  test("amortization chart SVG is visible after calculation", async ({ page }) => {
    await calculate(page);
    await page.waitForTimeout(1000);
    const svg = page.locator("svg").first();
    await expect(svg).toBeVisible({ timeout: 5000 });
  });

  test("collapsible schedule expands and shows Y1 row", async ({ page }) => {
    await calculate(page);
    await page.getByText("Complete Amortization Schedule").click();
    // Table uses "Y1", "Y2", ... format — scope to tbody to avoid matching chart axis labels
    await expect(page.locator("tbody").getByText("Y1").first()).toBeVisible({ timeout: 5000 });
  });

  test("EMI calculation is mathematically correct (25L @ 8.5% / 20y ≈ ₹21,694)", async ({ page }) => {
    await calculate(page);
    const bodyText = await page.locator("body").textContent();
    // EMI should be ~21,694; check for ₹21,xxx pattern
    expect(bodyText).toMatch(/21[,.]?\d{3}/);
  });

  test("personal loan type sets correct defaults (₹3L)", async ({ page }) => {
    await page.getByRole("button", { name: /^personal$/i }).click();
    await expect(page.getByText(/3,00,000/)).toBeVisible({ timeout: 3000 });
  });

  test("refinance strategy expands rate and timing sliders", async ({ page }) => {
    await calculate(page);
    await page.waitForSelector("text=Refinance Check", { timeout: 8000 });
    await strategySwitch(page, 5).click();

    await expect(page.getByText(/new rate/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/switch at year/i)).toBeVisible({ timeout: 3000 });
  });

  test("refinance at lower rate shows positive savings", async ({ page }) => {
    // Default loan: 8.5%. Default refinance: 7.5% at month 24 — should save interest.
    await calculate(page);
    await page.waitForSelector("text=Refinance Check", { timeout: 8000 });
    await strategySwitch(page, 5).click();

    await expect(page.getByText(/interest saved/i)).toBeVisible({ timeout: 5000 });
    // The saved amount should be positive (not negative)
    const interestSavedCard = page.locator("text=Interest Saved").locator("..");
    const valueEl = interestSavedCard.locator("p.text-xl, p.text-2xl, p.text-3xl").first();
    const text = await valueEl.textContent({ timeout: 3000 });
    // Value should be a positive number
    const numStr = text?.replace(/[^0-9,]/g, "").replace(/,/g, "") ?? "0";
    expect(parseInt(numStr)).toBeGreaterThan(0);
  });

  test("show me how to save button scrolls to strategy section", async ({ page }) => {
    await calculate(page);
    await page.getByRole("button", { name: /show me how to save/i }).click();
    await expect(page.getByText(/pay less interest/i)).toBeVisible({ timeout: 3000 });
  });

  test("disabling a strategy hides savings panel", async ({ page }) => {
    await calculate(page);
    await page.waitForSelector("text=Step-Up EMI", { timeout: 8000 });

    // Enable then disable
    await strategySwitch(page, 0).click();
    await expect(page.getByText(/interest saved/i)).toBeVisible({ timeout: 5000 });

    await strategySwitch(page, 0).click();
    // Savings panel should disappear (replaced by placeholder message)
    await expect(page.getByText(/ready when you are/i)).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Loan Calculation Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("very short tenure (1 year) still calculates", async ({ page }) => {
    // Click the tenure display value button to edit it
    const tenureBtn = page.getByRole("button", { name: /20 years/i });
    await tenureBtn.click();
    const input = page.locator("input").last();
    await input.fill("1");
    await input.press("Enter");

    await page.getByRole("button", { name: /calculate my emi/i }).click();
    await expect(page.getByText(/monthly emi/i)).toBeVisible({ timeout: 5000 });
  });

  test("large loan amount (5Cr) calculates without crash", async ({ page }) => {
    const principalBtn = page.getByRole("button", { name: /25,00,000/i });
    await principalBtn.click();
    const input = page.locator("input").last();
    await input.fill("50000000");
    await input.press("Enter");

    await page.getByRole("button", { name: /calculate my emi/i }).click();
    await expect(page.getByText(/monthly emi/i)).toBeVisible({ timeout: 5000 });
  });
});
