import { ComplexAttributeConverter } from '@lit/reactive-element';
export declare type QueryResult = HTMLElement | null;
export declare class ElementSelector implements ComplexAttributeConverter<HTMLElement | null, HTMLElement> {
    static query(selector: string | null): QueryResult;
    fromAttribute(value: string | null, _type?: HTMLElement): QueryResult;
    toAttribute(value: QueryResult): String | null;
}
export declare function elementSelector(): ElementSelector;
//# sourceMappingURL=element-selector.d.ts.map