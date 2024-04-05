import type { Page } from "@playwright/test";

export async function insertHtml(page: Page, html: string) {
  await page.setContent(html);
  await page.waitForLoadState("networkidle");
}

// TODO: We can smartly work out if it is a method or a property, and invoke it or read it
// we can also work out if it is a primitive or not. If it is not, we should serialize it
export async function getBrowserValue<T extends HTMLElement>(component: any, key: keyof T): Promise<T[keyof T]> {
  return await component.evaluate((element: T, { key }: { key: keyof T }) => element[key], { key });
}

export async function setBrowserValue<T>(component: any, key: keyof T, value: T[keyof T]) {
  await component.evaluate((element: T, { key, value }: any) => ((element as any)[key] = value), { key, value });
}

export async function getBrowserAttribute<T extends HTMLElement, Key extends keyof T>(
  component: any,
  key: Key,
): Promise<string> {
  return await component.evaluate((element: T, { key }: { key: Key }) => element.getAttribute(key.toString()), {
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
