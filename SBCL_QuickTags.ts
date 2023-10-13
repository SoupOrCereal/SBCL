import { con } from "./SBCL"

export enum LogLevel { Production, DebugLite, DebugFull }

/**
 * This solution creates a 3-tier tag system that uses SBCL's tag blacklisting capabilities to quickly toggle which logs are printed to the console.
 * @example
 * // Initialize
 * const q = new QuickTags("MyTag") // (you can optionally override defualt debug _tags)
 * // Usage
 * con.e("Test log", q.debugLiteTag) // productionTag, debugLiteTag, debugFullTag
 * @change-log-level
 * q.SetLogLevel(LogLevel.Production) // initially DebugFull
 */
export class QuickTags{
    /**
     * @param tag_Production "YourTagName"
     * @param tag_DebugLite (optional), *will default to '_ProductionTag'*
     * @param tag_DebugFull (optional), *will default to '__ProductionTag'*
     */
    constructor(tag_Production: string, tag_DebugLite: string = '_', tag_DebugFull: string = '__') {
        this.productionTag = tag_Production
        this.debugLiteTag = tag_DebugLite === '_' ? '_'+tag_Production : tag_DebugLite
        this.debugFullTag = tag_DebugFull === '__' ? '__'+tag_Production : tag_DebugFull
    }  

    productionTag: string = "QuickTag" 
    debugLiteTag: string = '_'
    debugFullTag: string = '__'
    
    /** Choices (LogLevel.) Production, DebugLite, DebugFull @initally DebugFull */
    SetLogLevel(newLogLevel: LogLevel): void {
      switch(newLogLevel){
        case LogLevel.DebugLite:
          con.BlacklistTags.Remove(this.debugLiteTag)
          con.BlacklistTags.Add(this.debugFullTag)
          break;
        case LogLevel.DebugFull:
          con.BlacklistTags.Remove(this.debugLiteTag)
          con.BlacklistTags.Remove(this.debugFullTag)
          break;
        default: // LogLevel.Production
          con.BlacklistTags.Add(this.debugLiteTag)
          con.BlacklistTags.Add(this.debugFullTag)
      }
    }
}