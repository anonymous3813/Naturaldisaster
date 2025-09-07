import {Heap} from 'heap-js'

export const priorityQueue = new Heap((a, b) => b.danger - a.danger)