
import * as h from './jsonldBase.js'

export class Thing{
    constructor(value){
        this._record = value || {}
    }

    toString(){
        return `${this.record_type}/${this.record_id}`
    }

    toJSON(){
        return JSON.stringify(this._record)
    }

    get(propertyID){
        return h.getValues(this.record, propertyID)
    }

    set(propertyID, value){
        this.record = h.setValues(this.record, propertyID, value)
    }

    get record(){
        return this._record
    }

    set record(value){
        this._record = value
    }

    get record_type(){
        return h.getValue(this.record, "@type")
    }
    set record_type(value){
        this.record = h.setValue(this.record, "@type", value)
    }

    get record_id(){
        return h.getValue(this.record, "@id")
    }
    set record_id(value){
        this.record = h.setValue(this.record, "@id", value)
    }

    get name(){
        return h.getValue(this.record, "name")
    }
    set name(value){
        this.record = h.setValue(this.record, "name", value)
    }

    get url(){
        return h.getValue(this.record, "url")
    }
    set url(value){
        this.record = h.setValue(this.record, "url", value)
    }
    
    get description(){
        return h.getValue(this.record, "description")
    }
    set description(value){
        this.record = h.setValue(this.record, "description", value)
    }

    get sameAs(){
        return h.getValue(this.record, "sameAs")
    }
    set sameAs(value){
        this.record = h.setValue(this.record, "sameAs", value)
    }

}



export class Action extends Thing {
    constructor(value){
        super(value)

    }

    toString(){
        return `${this.name} - ${(this.actionStatus || "").replace('ActionStatus', '')}`
    }

    setPotential(){
        this.startTime = undefined
        this.endTime = undefined
        this.actionStatus = "PotentialActionStatus"
        this.result = undefined
        this.error = undefined
    }

    setActive(){
        this.startTime = new Date()
        this.endTime = undefined
        this.actionStatus = "ActiveActionStatus"
    }

    setCompleted(result){
        this.startTime = this.startTime || new Date()
        this.endTime = new Date()
        this.actionStatus = "CompletedActionStatus"
        this.result = result
    }

    setFailed(error){
        this.startTime = this.startTime || new Date()
        this.endTime = new Date()
        this.actionStatus = "FailedActionStatus"
        this.error = error
    }

    get object(){
        return h.getValue(this.record, "object")
    }
    set object(value){
        this.record = h.setValue(this.record, "object", value)
    }

    get instrument(){
        return h.getValue(this.record, "instrument")
    }
    set instrument(value){
        this.record = h.setValue(this.record, "instrument", value)
    }

    get agent(){
        return h.getValue(this.record, "agent")
    }
    set agent(value){
        this.record = h.setValue(this.record, "agent", value)
    }

    get result(){
        return h.getValue(this.record, "result")
    }
    set result(value){
        this.record = h.setValue(this.record, "result", value)
    }

    get actionStatus(){
        return h.getValue(this.record, "actionStatus")
    }
    set actionStatus(value){
        this.record = h.setValue(this.record, "actionStatus", value)
    }

    get startTime(){
        return h.getValue(this.record, "startTime")
    }
    set startTime(value){
        this.record = h.setValue(this.record, "startTime", value)
    }

    get endTime(){
        return h.getValue(this.record, "endTime")
    }
    set endTime(value){
        this.record = h.setValue(this.record, "endTime", value)
    }

    get error(){
        return h.getValue(this.record, "error")
    }
    set error(value){
        this.record = h.setValue(this.record, "error", value)
    }


}