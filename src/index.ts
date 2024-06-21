
import type { FieldInfo, PathReducer, StructureAnalyzerOptions } from "./types";

export * from './utils'
export type * from './types'

interface InternalFieldInfo {
  entitiesWithFieldCount: number,
  fieldOccurancesTotalCount: number,
  uniqueValues: Map<any, number> | null,
}

export class StructureAnalyzer {
  private _entitiesProcessed = 0;
  private readonly fields: Map<string, InternalFieldInfo> = new Map();
  private readonly maxUniqueValuesPerField: number;
  private readonly collapseNumericKeys: boolean;
  private readonly pathReducer: PathReducer;
  
  constructor(options: StructureAnalyzerOptions = {}) {
    this.maxUniqueValuesPerField = options.maxUniqueValuesPerField ?? 1000;
    this.collapseNumericKeys = options.collapseNumericKeys ?? true;
    this.pathReducer = options.pathReducer ?? (x => x.join('.'));
  }

  /** Get total number of entities processed */
  get entitiesProcessed() : number { return this._entitiesProcessed; }
  
  /** Get all fields, by default sorts unique values by how many 
   *  times they occur. Entries are not sorted by key. */
  *entries(sortFieldValuesDescendingCount = true) : Iterable<[string, FieldInfo]> {
    const entries = this.fields.entries();
    for(let [key, value] of entries) {
      const externalEntry: FieldInfo = {
        entitiesWithFieldCount: value.entitiesWithFieldCount,
        fieldOccurancesTotalCount: value.fieldOccurancesTotalCount,
        uniqueValues: value.uniqueValues === null ? null : [...value.uniqueValues.entries()],
      }
      if(sortFieldValuesDescendingCount && externalEntry.uniqueValues) {
        externalEntry.uniqueValues.sort(([, a], [, b]) => b - a);
      }
      yield [key, externalEntry] as [string, FieldInfo];
    }
  }

  /** Like `entries`, but sorts them alphabetically by their key */
  sorted(sortFieldValuesDescendingCount = true) : [string, FieldInfo][] {
    const entities = [...this.entries(sortFieldValuesDescendingCount)];
    entities.sort(([a], [b]) => a.localeCompare(b, undefined, { usage: "sort", ignorePunctuation: false }));
    return entities;
  }

  /** Process many entries */
  processEntities(entities: Iterable<any>) : void {
    for(let e of entities) {
      this.processEntity(e);
    }
  }

  /** Process single entry */
  processEntity(entity: any) : void {
    this.processEntityInternal(entity, [], new Set());
    this._entitiesProcessed++;
  }

  private processEntityInternal(entity: any, currentPath: string[], currentEntityFields: Set<string>) {
    if(entity && typeof entity === "object") {
      this.countValue(currentPath, entity instanceof Array ? `[array(${entity.length})]` : '[object]', currentEntityFields);
      for(let k of Object.keys(entity)) {
        let key = k;
        if(this.collapseNumericKeys && /^[0-9]+$/.test(key)) {
          key = '#';
        }
        this.processEntityInternal(entity[k], [...currentPath, key], currentEntityFields)
      }
    }else{
      this.countValue(currentPath, entity, currentEntityFields);
    }
  }

  private countValue(path: string[], value: any, currentEntityFields: Set<string>) {
    const key = this.pathReducer(path);
    if(!this.fields.has(key)) {
      this.fields.set(key, {
        entitiesWithFieldCount: 0,
        fieldOccurancesTotalCount: 0,
        uniqueValues: new Map(),
      });
    }
    const fieldInfo = this.fields.get(key)!;

    fieldInfo.fieldOccurancesTotalCount++;
    
    if(!currentEntityFields.has(key)) {
      currentEntityFields.add(key);
      fieldInfo.entitiesWithFieldCount++;
    }
    if(fieldInfo.uniqueValues !== null) {
      const valueCount = fieldInfo.uniqueValues.get(value) ?? 0;
      fieldInfo.uniqueValues.set(value, valueCount + 1);
      if(fieldInfo.uniqueValues.size > this.maxUniqueValuesPerField) {
        fieldInfo.uniqueValues = null;
      }
    }
  }
}
