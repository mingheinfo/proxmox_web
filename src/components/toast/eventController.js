import _ from 'lodash'
import { genUniqueId, getEventDataFromWindow, setEventDataToWindow, removeEventDataInWindow, isLongJobEvent, getIdentityUuid, browserLocalStorageGetItem, browserLocalStorageSetItem, browserLocalStorageRemoveItem } from '@libs/utils'

// const eventListLengthLimit = 50
const toastTimeout = 3 * 1000
let eventListName = ''

export default {

  createEvent: function (action, name, count, content, subType, resourceInfos, self) {
    let isLongJob = _.isObject(resourceInfos)
    if (count === undefined) count = 1
    let event = {
      id: `${genUniqueId()}`,
      action,
      name,
      count,
      subType,
      content,
      resourceInfos,
      successCount: 0,
      failCount: 0,
      apiList: [],
      isLongJob,
      time: Date.now() + window.___currServerTimeMillionDvalue,
      endTime: '',
      status: 'UNDONE'
    }
    event.title = self.$t(event.action, event)
    eventListName = `eventList-${getIdentityUuid()}`
    let eventList = JSON.parse(getEventDataFromWindow(eventListName))
    if (!eventList) eventList = []
    eventList.unshift(event.id)
    setEventDataToWindow(eventListName, JSON.stringify(eventList))
    setEventDataToWindow(event.id, JSON.stringify(event))
    self.createToast(event)
    let job = _.cloneDeep(self.db.job)
    let updateData = {}
    updateData.runningJobs = job.runningJobs + 1
    self.updateDbObject({
      name: 'job',
      data: updateData
    })
    return event
  },

  _eventFinished: function (_event, self) {
    if (!self.$store.state.toastManager.toasts[_event.id]) {
      self.createToast(_event)
    }
    setTimeout(() => {
      if (self.$store.state.toastManager.toasts[_event.id]) {
        self.destroyToast(_event.id)
      }
    }, toastTimeout)
    let eventToBeUpdated
    if (isLongJobEvent(_event.id)) {
      eventToBeUpdated = JSON.parse(browserLocalStorageGetItem(_event.id))
    } else {
      eventToBeUpdated = JSON.parse(getEventDataFromWindow(_event.id))
    }
    let updatedEvent = Object.assign(eventToBeUpdated, {successCount: _event.successCount, failCount: _event.failCount})
    updatedEvent.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // setEventDataToWindow(_event.id, JSON.stringify(updatedEvent))
    if (updatedEvent.count === updatedEvent.successCount) {
      updatedEvent.status = 'OK'
    } else if (updatedEvent.successCount === 0) {
      updatedEvent.status = 'ERR'
    } else {
      updatedEvent.status = 'MIX'
    }
    // --------------------------------------------
    let job = _.cloneDeep(self.db.job)
    let updateData = {}
    updateData.runningJobs = Math.max(job.runningJobs - 1, 0)
    self.updateDbObject({
      name: 'job',
      data: updateData
    })
  },
  incEventSuccess: function (event, self) {
    let _event
      _event = JSON.parse(getEventDataFromWindow(event.id))
    // don't set success twice
    if (_event.successCount === _event.count) return
    if (_event.successCount < _event.count) _event.successCount++;
    _event.resultType = "success";
    // ---------------------
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    setEventDataToWindow(event.id, JSON.stringify(_event))
    if (self.$store.state.toastManager.toasts[_event.id]) self.updateToast(_event)
    // Object.assign(event, _event)
    if (_event.successCount + _event.failCount >= _event.count) {
      self._eventFinished(_event)
    }
  },
  setEventSuccess: function (event, content, self) {
    let _event
      _event = JSON.parse(getEventDataFromWindow(event.id))
    // don't set success twice
    if (_event.successCount === _event.count) return
    _event.successCount = _event.count
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    if (content) _event.content = content
    setEventDataToWindow(event.id, JSON.stringify(_event))
    if (self.$store.state.toastManager.toasts[_event.id]) self.updateToast(_event)
    self._eventFinished(_event)
  },
  incEventFail: function (event, self) {
    let _event
    _event = JSON.parse(getEventDataFromWindow(event.id))
    // don't set fail twice
    if (_event.failCount === _event.count) return
    if (_event.failCount < _event.count) _event.failCount++
    _event.resultType = "fail";
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    setEventDataToWindow(event.id, JSON.stringify(_event))
    if (self.$store.state.toastManager.toasts[_event.id]) {
      self.updateToast(_event)
    }
    // console.log(`_event.successCount ${_event.successCount} _event.failCount ${_event.failCount} _event.count ${_event.count}`)
    if (_event.successCount + _event.failCount >= _event.count) {
      self._eventFinished(_event)
    }
  },
  setEventFail: function (event, content, self) {
    let _event
    _event = JSON.parse(getEventDataFromWindow(event.id))
    // don't set fail twice
    if (_event.failCount === _event.count) return
    _event.failCount = _event.count
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    if (content) _event.content = content
    setEventDataToWindow(event.id, JSON.stringify(_event))
    if (self.$store.state.toastManager.toasts[_event.id]) self.updateToast(_event)
    self._eventFinished(_event)
  },
  setEventFinished: function (event, self) {
    let _event
    if (isLongJobEvent(event.id)) {
      _event = JSON.parse(browserLocalStorageGetItem(event.id))
    } else {
      _event = JSON.parse(getEventDataFromWindow(event.id))
    }
    // _event.endTime = Date.now() + window.___currServerTimeMillionDvalue
    // ---------------------
    _event.failCount = event.failCount
    _event.successCount = event.successCount
    setEventDataToWindow(event.id, JSON.stringify(_event));
    if (self.$store.state.toastManager.toasts[_event.id]) self.updateToast(_event)
    if (_event.successCount + _event.failCount >= _event.count) {
      self._eventFinished(_event)
    }
  }
}
