# `structure-anal` [github](https://github.com/sebimoe/structure-anal), [npm](https://www.npmjs.com/package/structure-anal)

A small library for analysis of fields in JSON-like data structures. 

Consumes a number of JSON-like entities and returns a summary of fields encontered across any entities along with their unique values. Contains helpers for converting that summary to text.

See npx cli command `structure-anal-cli` for console use: [github](https://github.com/sebimoe/structure-anal-cli), [npm](https://www.npmjs.com/package/structure-anal-cli).

## Usage
For options, see types below this example. All options are optional. See [an example file](https://github.com/sebimoe/structure-anal/blob/master/examples/example.ts).

```ts
import { 
  StructureAnalyzer, 
  makePathReducer, 
  printAnalyzerEntries 
} from 'structure-anal';

const anal = new StructureAnalyzer({
  pathReducer: makePathReducer(['children']),
});

anal.processEntity(exampleData);

console.log("Processed", anal.entitiesProcessed, "entities");

const entries = anal.sorted(); 
// array of entries [key: string, info: FieldInfo]

printAnalyzerEntries(entries, {
  omitObjectOnlyEntries: true,
  printFn: paths => '---\n' + paths.join("\n")
});
```

## Types

### Available types

```ts
import {
  StructureAnalyzer,    // Main class
  makePathReducer,      // Helper for making collapsing path reducers
  printAnalyzerEntries, // Helper for printing entries
  fieldInfoSummary,     // Helper for text representation of an entry
} from 'structure-analyzer';

import type { 
  StructureAnalyzerOptions,
  PathReducer,
  FieldInfo,
  PrintAnalyzerEntriesOptions,
  PrintFn,
} from 'structure-analyzer'
```

### Results

Results are returned as arrays/iterables of entries `[string, FieldInfo]`.

```ts
interface FieldInfo {
  entitiesWithFieldCount: number,
  fieldOccurancesTotalCount: number,
  uniqueValues: Array<[value: any, count: number]> | null,
}
```


### Main class `StructureAnalyzer`

```ts
class StructureAnalyzer {
  constructor(options: StructureAnalyzerOptions = {})

  /** Get total number of entities processed */
  get entitiesProcessed() : number
  
  /** Get all fields, by default sorts unique values by how many 
   *  times they occur. Entries are not sorted by key. */
  entries(sortFieldValuesDescendingCount = true) : Iterable<[string, FieldInfo]>

  /** Like `entries`, but sorts them alphabetically by their key */
  sorted(sortFieldValuesDescendingCount = true) : [string, FieldInfo][]
  
  /** Process many entries */
  processEntities(entities: Iterable<any>) : void

  /** Process single entry */
  processEntity(entity: any) : void
}
```

#### `StructureAnalyzerOptions` (constructor parameter)
```ts
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
pathReducer?: PathReducer, // (path: string[]) => string
```

### Printing results

```ts
printAnalyzerEntries(
  entries: Iterable<[string, FieldInfo]>, 
  options: PrintAnalyzerEntriesOptions = {}
) : void

fieldInfoSummary(field: FieldInfo, valueLimit?: number): string[]
```

#### `PrintAnalyzerEntriesOptions` (`printAnalyzerEntries` parameter)

```ts
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
printFn?: PrintFn, // (parts: string[]) => void
```

## Contributing

Please feel free to open a pull request or an issue if you find something wrong or would like to contribute an improvement.
