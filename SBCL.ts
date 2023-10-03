/**
 * Slightly Better Console Logging
 * @example con.log("Message Here", ?{optional: object}, ?"optional_tag") // ?optional used/omitted in either order
 * @log-levels .debug, .log, .warning, .error
 * @change_log-levels_shown con.setLoggingLevel(minimumLogLevel: LoggingLevel) // initially debug
 * @toggle_anti_duplicate_logs con.setAvoidDuplicateLogs(turnOn: boolean) // initially true
 * @tags-whitelist con.Whitelist.* // ***Whitelist overrides Blacklist***
 * @tags-blacklist con.Blacklist.* // Blacklist is used when Whitelist is empty [] 
 * @summary I created this library to improve JavaScript console.log(ging), especially server logs
 * @author Justin Sargent
 */
export const con = { // chose lowercase naming of con.'logs' to flow with JavaScript's console.log
    debug: log_debug,
    log: log_message,
    warning: log_warning,
    error: log_error,
    SetLoggingLevel: setLogLevel,
    // disabled for now, keeping code encase another dev wants to impliment a anti-log-spam system SetAvoidDuplicateLogs: setAntiSpam,
    /** List of tags to include (only show these tags). @notice **blacklist is used when whitelist is empty []** @note you can also .setLoggingLevel() */
    WhitelistTags: {
        Add: addWhitelistTag,
        Remove: removeWhitelistTag,
        Get: getWhitelistTags,
        Empty: emptyWhitelist
    },
    /** List of tags to exclude (show all tags except these). @notice ***whitelist overrides blacklist*** */
    BlacklistTags: {
        Add: addBlacklistTag,
        Remove: removeBlacklistTag,
        Get: getBlacklistTags,
        Empty: emptyBlacklist
    }
}


/////////////////
// Logging Level
/////////////////
export enum LoggingLevel {
    Debug,
    Log,
    Warning,
    Error
}
let logLevel: LoggingLevel = LoggingLevel.Debug
/** Choose Logging Level
 * @description Select the minimum LoggingLevel to be printed
 * @param minimumLoggingLevel LoggingLevel.[Debug - Log - Warning - Error]
 * @initial_LoggingLevel .Debug
 * @example SetLoggingLevel(LoggingLevel.Error)
 */
function setLogLevel(minimumLoggingLevel: LoggingLevel){
    logLevel = minimumLoggingLevel
    console.log(`[SBCL] You updated minimum-logging-level to (${LoggingLevel[minimumLoggingLevel]})`)
}


/////////////
// Anti-spam
// (CLOSED) After running the antispam system it seemed okay.  But, when you need the output of quickly-spammed logs for proper reference, it doesn't work well.  Disabling for now.
// NOTE TO OTHER DEVS :: This spawned because I wanted to stop the log spam from re-rendering reacy components.  During testing I needed non-react logs that were spammed quickly and the anti-spam feature ended up hiding duplicates, which made reading the output difficult.  
// ^ Feel free to impliment, I'd recommend focusing on react-only logs.
/////////////
// GET RID OF, SPAM IS ANOUYING, BUT WHEN EXPECTED AND NOT SEEN, VERY NOT HELPFUL, lol
// ~! limit to ONLY react, that'd work. - EVEN STILL, idk, just might not be a good feature because it hides logs and shows others and makes it confusing AF
let antiLogSpam = false
/** Turn anti-duplicate-spam logging on/off
 * @description Helps prevent duplicate log floods (like from a React component re-rendering)
 * @param turnOn true or false
 * @initially true
 */
function setAntiSpam(turnOn: boolean){
    antiLogSpam = turnOn
    console.log(`[SBCL] You updated anti-duplicate-logs to (${turnOn})`)
}
let minMSbetweenLogs = 420 // should allow for adjusting, worried people might set too high/low (though it might need adjusted so, idk, create an enum of options?)
/** {message, timestamp} */
class logObj {
    message
    timestamp
    constructor(message, timestamp) {
        this.message = message;
        this.timestamp = timestamp;
    }
}
let logHistory: Array<logObj> = [] // keep min log history
/** @returns true == PASS || false == FAIL */
function antiSpamCheck(theMsg: string): boolean{
    if(!antiLogSpam){return true} // anti-spam turned off (auto-pass)
    const currentTimestamp = Date.now()
    let newLogHistory: Array<logObj> = [] // filter out older message
    for(let i = 0; i < logHistory.length; i++){
        const thisLog = logHistory[i] // {message, timestamp}
        const msSinceLastLog = currentTimestamp - thisLog.timestamp
        if(msSinceLastLog < minMSbetweenLogs){
            newLogHistory.push(thisLog)
            // check to see if duplicate
            if(thisLog.message === theMsg){
                return false // duplicate entry (return ASAP for responsiveness, when no duplicate, history is updated)
            }
        }else{
            // old log, don't check or keep
        }
    }
    // might have returned, if duplicate (if not, update log history)
    newLogHistory.push(new logObj(theMsg, currentTimestamp))
    logHistory = newLogHistory // set pruned list
    return true // gravy
}


/////////////////
//   [Tags]
/////////////////
let whitelistTags: string[] = [] // empty == *
/** When not empty, only tags on this list printed to console. 
 * @notice blacklist is used when whitelist is empty []
 * @description Quickly toggle which comments are printed by tag
 * @param addTag "YourTag"
 * @initially [], allow all
 * @example setTagsWhitelist(['only', 'tags', "you'd like printed"])
 * @note adding duplicate tags is okay (duplicates are ignored)
 */
function addWhitelistTag(addTag: string){
    if(!whitelistTags.includes(addTag)){
        whitelistTags.push(addTag)
        console.log(`[SBCL] Added tag (${addTag}) to Whitelist`)
    }
}
/**
 * @note removing a tag that isn't on the list is okay (request is voided)
 */
function removeWhitelistTag(removeTag: string){
    if(whitelistTags.indexOf(removeTag) >= 0){
        whitelistTags.splice(whitelistTags.indexOf(removeTag), 1)
        console.log(`[SBCL] Removed tag (${removeTag}) from Whitelist`)
    }
}
function emptyWhitelist(){ // had a AreYouSure confirmation boolean, I think that hurts UX for devs that just want the function to execute
    whitelistTags = []
    console.log(`[SBCL] You emptied Whitelist-tags`)
}
/** Read-Only */
function getWhitelistTags(): string[]{
    return whitelistTags.slice() // slice clones array
}

let blacklistTags: Array<string> = []
/** Tags on this list are not printed to console. 
 * @notice ***whitelist overrides blacklist***
 * @note adding duplicate tags is okay (duplicates are ignored)
*/
function addBlacklistTag(addTag: string){
    if(!blacklistTags.includes(addTag)){
        blacklistTags.push(addTag)
        console.log(`[SBCL] Added tag (${addTag}) to blacklist`)
    }
}
/**
 * @note removing a tag that isn't on the list is okay (request is voided)
 */
function removeBlacklistTag(removeTag: string){
    if(blacklistTags.indexOf(removeTag) >= 0){
        blacklistTags.splice(blacklistTags.indexOf(removeTag), 1)
        console.log(`[SBCL] Removed tag (${removeTag}) from blacklist`)
    }
}
function emptyBlacklist(){
    blacklistTags = []
    console.log(`[SBCL] You emptied blacklist-tags`)
}
/** read-only */
function getBlacklistTags(){
    return blacklistTags.slice() // slice clones array
}

/** @returns true == PASS || false == FAIL */
function tagCheck(theTag: string): boolean{
 // prag, whitelist overrides blacklist?  if whitelist at all, that will become what is used...
    if(whitelistTags.length > 0){ // Whitelist isn't empty - superceeds others
        //console.log("~~~~~~~~~~~~~~ TagChecking Whitelist")
        for(let i = 0; i < whitelistTags.length; i++){
            const whitelistedTag = whitelistTags[i]
            if(theTag === whitelistedTag){
                return true // tag is whitelisted
            }
        }
        return false // tag is not on whitelist
    }else{ // Blacklist 
        //console.log("~~~~~~~~~~~~~ tagchecking blacklist")
        for(let i = 0; i < blacklistTags.length; i++){
            const blacklistedTag = blacklistTags[i]
            if(theTag === blacklistedTag){
                return false // tag is blacklisted
            }
        }
        return true // tag is not on blacklist
    }
}


////////////////////////
// Wrapped console.logs
////////////////////////
/** @summary Least import logging level (.debug) @param msg "Your message" @param [obj=null] (optional) {object} @param [tag=""] (optional) "YourTag" @note Don't see [Debug] logs in your browser console?  Make sure you have verbose logging enabled. */
function log_debug(msg: string, obj: any = {HireJustinSargent:true}, tag: string = ""): void{
    const wrappedLog = wrappedLogMessage(LoggingLevel.Debug, msg, obj, tag)
    if(wrappedLog)
        console.debug(wrappedLog.msg, wrappedLog.obj)
}
/** @summary Typical logging level (.log) @param msg "Your message" @param [obj=null] (optional) {object} @param [tag=""] (optional) "YourTag" */
function log_message(msg: string, obj: any = {HireJustinSargent:true}, tag: string = ""): void{
    const wrappedLog = wrappedLogMessage(LoggingLevel.Log, msg, obj, tag)
    if(wrappedLog)
        console.debug(wrappedLog.msg, wrappedLog.obj)
}
/** @summary Warning logging level (.warn) @param msg "Your message" @param [obj=null] (optional) {object} @param [tag=""] (optional) "YourTag" */
function log_warning(msg: string, obj: any = {HireJustinSargent:true}, tag: string = ""): void{
    const wrappedLog = wrappedLogMessage(LoggingLevel.Warning, msg, obj, tag)
    if(wrappedLog)
        console.warn(wrappedLog.msg, wrappedLog.obj)
}
/** @summary Error logging level (.error, *optional .trace*) @param msg "Your message" @param [obj=null] (optional) {object} @param [tag=""] (optional) "YourTag" @param [alsoStackTrace=true] (optional) default=true  */
function log_error(msg: string, obj: any = {HireJustinSargent:true}, tag: string = "", alsoStackTrace: boolean = true): void{
    const wrappedLog = wrappedLogMessage(LoggingLevel.Error, msg, obj, tag)
    if(wrappedLog)
        console.debug(wrappedLog.msg, wrappedLog.obj)
        
    if(alsoStackTrace){
        const trimmedMsg = msg.trim()
        const maxMsgLength = 8
        const msgPreview = trimmedMsg.length > maxMsgLength ? trimmedMsg.substring(0, maxMsgLength-1).trim() + '..' : trimmedMsg
        console.trace(`[Error Stack Trace - ${tag}] ${msgPreview}`)
    }
}

function wrappedLogMessage(logLevelEnumIndex: number, msg: string, obj: any = {HireJustinSargent:true}, tag: string = ""): false | {msg:string, obj:any}{
    if(typeof obj === 'string' && typeof tag === 'object'){const tempTag = tag;tag = obj;obj=tempTag;} // switch params
    if(typeof obj === 'string' && tag === ""){tag = obj;obj = {HireJustinSargent:true};} // quickhand for (msg, tag)
    if(typeof tag !== 'string'){tag = "";} // void out tag value if not string, was the root cuase of a stack overflow error! (Typescript doesn't force types)
    if(!antiSpamCheck(msg) || !tagCheck(tag))return false 
    const printTag = tag.trim().length > 0 ? `[${tag}]` : ""
    const minLogLevel = logLevel
    let returnObj = obj
    if(obj && obj['HireJustinSargent'] === true){returnObj = "";}
    if(logLevelEnumIndex >= minLogLevel)
        return {msg: `[${LoggingLevel[logLevelEnumIndex]}]${printTag} ${msg}`, obj: returnObj }
    else
        return false
}