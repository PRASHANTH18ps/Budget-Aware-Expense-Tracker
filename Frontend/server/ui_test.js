const puppeteer = require('puppeteer');

function clickButtonByText(page, text) {
  return page.$$eval('button', (buttons, text) => {
    const btn = buttons.find(b => (b.innerText || '').trim().toLowerCase() === text.toLowerCase());
    if (btn) btn.click();
    return !!btn;
  }, text);
}

(async () => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3001';
  console.log('Launching browser for', frontend);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    // Signup (if user exists this may show an alert but we'll continue)
    await page.goto(frontend + '/signup', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[placeholder="Email"]');
    await page.type('input[placeholder="Email"]', 'ui@local');
    await page.type('input[placeholder="Password"]', 'ui-test');
    await clickButtonByText(page, 'Signup');
    await page.waitForTimeout(800);

    // Login
    await page.goto(frontend + '/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[placeholder="Email"]');
    await page.evaluate(() => document.querySelector('input[placeholder="Email"]').value = '');
    await page.type('input[placeholder="Email"]', 'ui@local');
    await page.type('input[placeholder="Password"]', 'ui-test');
    await clickButtonByText(page, 'Login');
    // wait for navigation to dashboard or signup
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('Logged in, creating category...');

    // Create category
    await page.goto(frontend + '/categories', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[placeholder="Category name"]');
    await page.type('input[placeholder="Category name"]', 'UITest Cat');
    await page.type('input[placeholder="Color code (#ff0000)"]', '#3366ff');
    await clickButtonByText(page, 'Add Category');
    await page.waitForTimeout(800);

    // Create budget
    await page.goto(frontend + '/budgets', { waitUntil: 'networkidle2' });
    await page.waitForSelector('select');
    // pick first category in select
    await page.select('select', await page.$eval('select option:nth-child(2)', o => o.value));
    // set month input
    await page.waitForSelector('input[type="month"]');
    // keep default month
    await page.type('input[placeholder="Budget amount"]', '500');
    await clickButtonByText(page, 'Save Budget');
    await page.waitForTimeout(800);

    // Add expense from dashboard
    await page.goto(frontend + '/dashboard', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.fab');
    await page.click('.fab');
    await page.waitForSelector('.modal-content');
    // select the category in modal
    await page.waitForSelector('.modal-content select');
    const sel = await page.$('.modal-content select');
    const val = await page.$eval('.modal-content select option:nth-child(2)', o => o.value);
    await page.select('.modal-content select', val);
    await page.type('.modal-content input[type="number"]', '600');
    // click Save
    await clickButtonByText(page, 'Save');
    // wait for toast
    await page.waitForSelector('.toast', { timeout: 5000 });
    const toastText = await page.$eval('.toast', el => el.innerText);
    console.log('Toast text:', toastText);

    console.log('UI test completed successfully');
  } catch (err) {
    console.error('UI test failed:', err);
    await page.screenshot({ path: 'server/ui_test_error.png' }).catch(() => {});
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
