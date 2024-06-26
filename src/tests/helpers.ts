import type { Locator, Page } from "@playwright/test";

export async function insertHtml(page: Page, html: string) {
  await page.setContent(html);
  await page.waitForLoadState("networkidle");
}

export async function catchEvent(page: Page, name: string) {
  return page.evaluate((name: string) => {
    return new Promise((resolve) => {
      document.addEventListener(name, (data) => resolve(data));
    });
  }, name);
}

// TODO: We can smartly work out if it is a method or a property, and invoke it or read it
// we can also work out if it is a primitive or not. If it is not, we should serialize it
export async function getBrowserValue<T extends HTMLElement>(component: any, key: keyof T): Promise<T[keyof T]> {
  return await component.evaluate((element: T, { key }: { key: keyof T }) => element[key], { key });
}

export async function setBrowserValue<T>(component: any, key: keyof T, value: T[keyof T]) {
  await component.evaluate((element: T, { key, value }: any) => ((element as any)[key] = value), { key, value });
}

// TODO: The generic typing here is incorrect because it's for properties not attributes
/**
 * @param component
 * @param key
 * @param value - The value to set the attribute to. If a value is not provided, it will be set as a boolean attribute
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute#parameters
 */
export async function setBrowserAttribute<T extends HTMLElement>(component: Locator, key: keyof T, value = "") {
  await component.evaluate((element: T, { key, value }: any) => element.setAttribute(key.toString(), value), {
    key,
    value,
  });
}

export async function removeBrowserAttribute<T extends HTMLElement>(component: any, key: keyof T) {
  await component.evaluate((element: T, { key }: { key: keyof T }) => element.removeAttribute(key.toString()), { key });
}

export async function getBrowserAttribute<T extends HTMLElement>(component: any, key: string): Promise<string> {
  return await component.evaluate((element: T, { key }: { key: string }) => element.getAttribute(key.toString()), {
    key,
  });
}

export async function hasBrowserAttribute<T extends HTMLElement>(component: any, key: keyof T) {
  return await component.evaluate((element: T, { key }: { key: keyof T }) => element.hasAttribute(key.toString()), {
    key,
  });
}

export async function invokeBrowserMethod<T extends HTMLElement>(
  component: any,
  key: keyof T,
  ...args: any[]
): Promise<unknown> {
  return await component.evaluate(
    (element: T, key: keyof T, args: any[] = []) => (element[key] as (...args: any) => any)(...args),
    key,
    args,
  );
}
