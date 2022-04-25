import { action, makeAutoObservable, observable } from 'mobx'
import { RootStore } from './RootStore'
import { tasks } from '../lib/intern'
import { generateRandomInt } from '../utils/number-utils'

export class InternStore {
  root: RootStore
  randomTaskIndex: number
  doingTask: boolean

  constructor(root: RootStore) {
    // initialize here so randomTaskIndex doesn't have to be undefined
    // so we can avoid a lot of unnecessary undefined check
    const newIndex = generateRandomInt(tasks.length)
    this.root = root
    this.randomTaskIndex = newIndex
    this.doingTask = false
    makeAutoObservable(this, {
      doingTask: observable,
      setDoingTask: action.bound,
      shuffleTask: action.bound,
    })
  }

  setDoingTask(doingTask: boolean): void {
    this.doingTask = doingTask
  }

  shuffleTask(): void {
    const newIndex = generateRandomInt(tasks.length)
    this.randomTaskIndex = newIndex
  }
}
