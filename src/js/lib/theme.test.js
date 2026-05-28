import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { applyTheme } from './theme.js';

let dom;

before(() => {
  dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
  global.document = dom.window.document;
});

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('sets data-theme="light" when mode is light', () => {
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).to.equal('light');
  });

  it('sets data-theme="dark" when mode is dark', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).to.equal('dark');
  });

  it('removes data-theme attribute when mode is default', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    applyTheme('default');
    expect(document.documentElement.getAttribute('data-theme')).to.be.null;
  });

  it('removes data-theme attribute when mode is undefined', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    applyTheme(undefined);
    expect(document.documentElement.getAttribute('data-theme')).to.be.null;
  });

  it('is idempotent for light: calling twice yields data-theme="light"', () => {
    applyTheme('light');
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).to.equal('light');
  });

  it('is idempotent for default: calling twice yields absent attribute', () => {
    applyTheme('default');
    applyTheme('default');
    expect(document.documentElement.getAttribute('data-theme')).to.be.null;
  });
});
