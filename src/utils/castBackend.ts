import { ExternalLibraryName, Library } from '../components/assessment/assessmentShape'

/**
 * Casts a library returned by an API call to a
 * Library used in the frontend.
 */
export const castLibrary = (lib: any): Library => ({
  chapter: lib.chapter,
  external: {
    /** external names are lowercase for API results */
    name: lib.external.name.toUpperCase() as ExternalLibraryName,
    symbols: lib.external.symbols
  },
  /** globals are passed as an object, mapping symbol name -> value */
  globals: Object.entries(lib.globals as object).map(entry => {
    /** The value that is passed is evaluated into an actual JS value */
    try {
      entry[0] = (window as any).eval(entry[1])
    } catch (e) {}
    return entry
  })
})
