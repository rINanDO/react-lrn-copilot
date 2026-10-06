import { xmlSchema, type FieldDescriptor, type TypeDescriptor } from './xmlSchema.gen';
import type { Al, Lijst, Plaatje } from './types.gen';

type Model = Record<string, unknown>;

/**
 * Runtime shape of an entry in a `structuurAlgemeen` choice group (the
 * generated types model these fields as `Array<unknown>`, see `convertElement`
 * below). Tagged with `$element` so components can discriminate on it.
 */
export type StructuurAlgemeenItem =
  | ({ $element: 'al' } & Al)
  | ({ $element: 'lijst' } & Lijst)
  | ({ $element: 'plaatje' } & Plaatje)
  | ({ $element: string } & { text?: Array<string> | null });

// Equality checks on `$element` don't narrow `StructuurAlgemeenItem` on their
// own, since the fallback member's `$element` is a plain `string` rather than
// a literal - these type guards narrow explicitly instead.
export function isAlItem(item: StructuurAlgemeenItem): item is { $element: 'al' } & Al {
  return item.$element === 'al';
}
export function isLijstItem(item: StructuurAlgemeenItem): item is { $element: 'lijst' } & Lijst {
  return item.$element === 'lijst';
}
export function isPlaatjeItem(item: StructuurAlgemeenItem): item is { $element: 'plaatje' } & Plaatje {
  return item.$element === 'plaatje';
}

const IGNORED_ATTRIBUTE_PREFIXES = ['xmlns', 'xsi:'];

/** `bwb-ng-vast-deel` → `bwbNgVastDeel`, `li.nr` → `liNr`, `xml:lang` → `lang`. */
function toCamelCase(xmlName: string): string {
    const localName = xmlName.includes(':') ? xmlName.slice(xmlName.indexOf(':') + 1) : xmlName;
    return localName.replace(/[-._]+(.)/g, (_, c: string) => c.toUpperCase());
}

function toPascalCase(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function convertPrimitive(kind: string, value: string): unknown {
    switch (kind) {
        case 'number':
            return Number(value);
        case 'boolean':
            return value === 'true' || value === '1';
        // Enums are numeric in the generated types, but the XML carries the
        // symbolic value (e.g. status="goed"). The ordinal mapping is not
        // available, so the raw value is kept.
        default:
            return value;
    }
}

function assign(target: Model, type: TypeDescriptor, field: string, value: unknown) {
    const [, array] = type[field];
    if (array) {
        const list = (target[field] ??= []) as unknown[];
        list.push(value);
    } else {
        target[field] = value;
    }
    if (`${field}Specified` in type) {
        target[`${field}Specified`] = true;
    }
}

/**
 * Resolves the model field for a child element. XmlSerializer renames members
 * that clash with their class name (`<nadruk>` inside `Nadruk` → `nadrukProperty`).
 */
function resolveElementField(type: TypeDescriptor, name: string): string | undefined {
    if (name in type) return name;
    if (`${name}Property` in type) return `${name}Property`;
    return undefined;
}

/**
 * Resolves the model field for an attribute. When an attribute and a child
 * element share a name, the attribute gets a `1` suffix (`publicatie1`).
 */
function resolveAttributeField(type: TypeDescriptor, name: string): string | undefined {
    if (`${name}1` in type) return `${name}1`;
    if (name in type) return name;
    return undefined;
}

function convertElement(element: Element, descriptor: FieldDescriptor): unknown {
    const [kind] = descriptor;
    if (kind in xmlSchema) return mapElement(element, kind);
    if (kind === 'unknown') {
        const typeName = toPascalCase(toCamelCase(element.localName));
        if (typeName in xmlSchema) return { $element: element.localName, ...mapElement(element, typeName) };
    }
    return convertPrimitive(kind, element.textContent ?? '');
}

/** Maps an XML element onto the generated type named `typeName`. */
export function mapElement(element: Element, typeName: string): Model {
    const type = xmlSchema[typeName];
    if (!type) throw new Error(`Unknown type '${typeName}' for element <${element.localName}>`);

    const result: Model = {};

    for (const attribute of Array.from(element.attributes)) {
        if (IGNORED_ATTRIBUTE_PREFIXES.some((prefix) => attribute.name.startsWith(prefix))) continue;
        const field = resolveAttributeField(type, toCamelCase(attribute.name));
        if (!field) continue;
        assign(result, type, field, convertPrimitive(type[field][0], attribute.value));
    }

    for (const node of Array.from(element.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) {
            const text = node.nodeValue ?? '';
            if ('text' in type && text.trim() !== '') assign(result, type, 'text', text);
            continue;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        const child = node as Element;
        const field = resolveElementField(type, toCamelCase(child.localName));
        if (field) {
            assign(result, type, field, convertElement(child, type[field]));
        } else if ('structuurAlgemeen' in type) {
            // Choice groups (al, lijst, ...) are modelled as an untyped array.
            assign(result, type, 'structuurAlgemeen', convertElement(child, ['unknown', 1]));
        }
    }

    return result;
}
