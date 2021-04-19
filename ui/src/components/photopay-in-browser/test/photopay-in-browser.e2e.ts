/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('photopay-in-browser', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<photopay-in-browser></photopay-in-browser>');

    const element = await page.find('photopay-in-browser');
    expect(element).toHaveClass('hydrated');
  });
});
