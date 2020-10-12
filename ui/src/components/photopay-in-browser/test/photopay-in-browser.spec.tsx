import { newSpecPage } from '@stencil/core/testing';
import { PhotopayInBrowser } from '../photopay-in-browser';

describe('photopay-in-browser', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PhotopayInBrowser],
      html: `<photopay-in-browser></photopay-in-browser>`,
    });
    expect(page.root).toEqualHtml(`
      <photopay-in-browser>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </photopay-in-browser>
    `);
  });
});
