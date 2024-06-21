
export interface FieldInfo {
  entitiesWithFieldCount: number,
  fieldOccurancesTotalCount: number,
  uniqueValues: Array<[value: any, count: number]> | null,
}

export type PathReducer = (path: string[]) => string;
export type PrintFn = (parts: string[]) => void

export interface StructureAnalyzerOptions {
  /** Maximum number of unique values for a given field to gather.
   *  If more values are encountered, `null` is returned
   *  for `uniqueValues`. Default: 1000 */
  maxUniqueValuesPerField?: number,
  /** If set to false, numeric keys will not be collapsed to `#`. 
   *  Default: `true` */
  collapseNumericKeys?: boolean,
  /** Custom path reducer for generating field keys.
   *  See `makePathReducer` helper.
   *  Default: `path => path.join('.')` */
  pathReducer?: PathReducer,
}

export interface PrintAnalyzerEntriesOptions {
  /** If set to true, will not print fields with `uniqueValues: null` 
   *  (contained more unique values than `maxUniqueValuesPerField`).
   *  Default: false */
  omitTooManyValues?: boolean,
  /** If set to true, will not print fields with only one unique 
   *  value `"[object]"`. Default: false */
  omitObjectOnlyEntries?: boolean,
  /** Maximum unique number of values to display. Number of
   *  omitted values will be shown. Default: 10 */
  valueLimit?: number,
  /** Function called with few parts representing the entry.
   *  You may want to join these parts by a newline or space.
   *  Default: `(parts) => console.log(...parts)` */
  printFn?: PrintFn,
}
