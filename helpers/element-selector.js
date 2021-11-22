export function elementSelector() {
    return {
        fromAttribute: (value, _type) => {
            // TODO Use type of _type to determine how to handle query (throw error if wrong type?)
            if (!value) {
                return null;
            }
            return document.querySelector(`#${value}`);
        },
        toAttribute: (value) => {
            if (!(value instanceof HTMLElement)) {
                return null;
            }
            return value.id;
        },
    };
}
//# sourceMappingURL=element-selector.js.map