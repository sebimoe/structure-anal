import type { FieldInfo, PrintAnalyzerEntriesOptions } from "./types";

function replaceAll(str: string, a: string, b: string) {
  let old: string;
  do {
    old = str;
    str = str.replaceAll(a, b);
  } while (old !== str);
  return str;
}

export function makePathReducer(collapseList: string[] | null, removeList?: string[]) {
  return (path: string[]) => {
    let ret = '.' + path.join('.');
    const replaces = [
      ...(collapseList ?? []).map(collapse => [
        [`.${collapse}.#.${collapse}.#`, `.${collapse}.#`],
        [`.${collapse}.#.${collapse}`, `.${collapse}`],
        [`.${collapse}.${collapse}`, `.${collapse}`],
      ]),
      ...(removeList ?? []).map(remove => [
        [`.${remove}.#`, ''],
        [`.${remove}`, ''],
      ]),
    ].flat(1);
    for(let [from, to] of replaces) {
      ret = replaceAll(ret, from, to);
    }
    return ret;
  };
}

export function valueText(value: any) {
  if(typeof value === "string" && value.length > 300) {
    const truncated = value.substring(0, 280);
    return `${JSON.stringify(truncated + '...')}[truncated ${value.length - truncated.length} chars]`;
  }
  return JSON.stringify(value);
}

export function fieldInfoSummary(field: FieldInfo, valueLimit?: number): string[] {
  let valueSummary = "too many unique values";
  if(field.uniqueValues) {
    const usedValues = (!valueLimit || field.uniqueValues === null || field.uniqueValues.length <= valueLimit) ? field.uniqueValues : field.uniqueValues.slice(0, valueLimit);
    const valueList = usedValues.map(([value, count]) => `${valueText(value)} (${count})`).join(", ");
    const moreText = (usedValues === field.uniqueValues) ? '' : ` <${field.uniqueValues.length - usedValues.length} values omitted>`;
    valueSummary = `${field.uniqueValues.length} unique value${field.uniqueValues.length > 1 ? 's' : ''}: ${valueList}${moreText}`;
  }
  return [
    `${field.entitiesWithFieldCount} entities, ${field.fieldOccurancesTotalCount} occurances -`,
    valueSummary,
  ];
}

export function printAnalyzerEntries(entries: Iterable<[string, FieldInfo]>, options: PrintAnalyzerEntriesOptions = {}) {
  const omitTooManyValues = options.omitTooManyValues ?? false; 
  const omitObjectOnlyEntries = options.omitObjectOnlyEntries ?? false; 
  const valueLimit = options.valueLimit ?? 10;
  const printFn = options.printFn ?? (parts => console.log(...parts));

  for(let [key, field] of entries) {
    if(omitTooManyValues && field.uniqueValues === null) continue;
    if(omitObjectOnlyEntries && field.uniqueValues?.length === 1  && field.uniqueValues[0][0] === '[object]') continue;
    printFn([`${key.length ? key : '<root>'}:`, ...fieldInfoSummary(field, valueLimit)])
  }
}
