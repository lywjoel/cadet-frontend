import { SagaIterator } from 'redux-saga'
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects'
import { IState } from '../reducers/states'

import { Context, interrupt, runInContext } from '../slang'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { showSuccessMessage, showWarningMessage } from '../notification'

function* evalCode(code: string, context: Context) {
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context),
    interrupted: take(actionTypes.INTERRUPT_EXECUTION)
  })
  if (result) {
    if (result.status === 'finished') {
      yield put(actions.evalInterpreterSuccess(result.value))
    } else {
      yield put(actions.evalInterpreterError(context.errors))
    }
  } else if (interrupted) {
    interrupt(context)
    yield call(showWarningMessage, 'Execution aborted by user')
  }
}

function* interpreterSaga(): SagaIterator {
  // let library = yield select((state: Shape) => state.config.library)
  let context: Context

  yield takeEvery(actionTypes.EVAL_EDITOR, function*() {
    const code: string = yield select((state: IState) => state.playground.editorValue)
    yield put(actions.clearContext())
    yield put(actions.clearReplOutput())
    context = yield select((state: IState) => state.playground.context)
    yield* evalCode(code, context)
  })

  yield takeEvery(actionTypes.EVAL_REPL, function*() {
    const code: string = yield select((state: IState) => state.playground.replValue)
    context = yield select((state: IState) => state.playground.context)
    yield put(actions.clearReplInput())
    yield put(actions.sendReplInputToOutput(code))
    yield* evalCode(code, context)
  })

  yield takeEvery(actionTypes.CHAPTER_SELECT, function*(action) {
    const newChapter = parseInt((action as actionTypes.IAction).payload, 10)
    const oldChapter = yield select((state: IState) => state.playground.sourceChapter)
    if (newChapter !== oldChapter) {
      yield put(actions.changeChapter(newChapter))
      yield put(actions.clearContext())
      yield put(actions.clearReplOutput())
      yield call(showSuccessMessage, `Switched to Source \xa7${newChapter}`)
    } else {
      yield undefined
    }
  })
}

function* mainSaga() {
  yield* interpreterSaga()
}

export default mainSaga