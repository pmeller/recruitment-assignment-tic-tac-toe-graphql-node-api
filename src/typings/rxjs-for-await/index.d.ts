// TODO: Investigate problem, type declaration for `rxjs-for-await` is not working despite theter is `types` path in lib's package.json (this typing is modified copy from library)

declare module 'rxjs-for-await' {
  import { Observable } from 'rxjs'

  export function eachValueFrom<T>(source: Observable<T>): AsyncIterableIterator<T>
  export function bufferedValuesFrom<T>(source: Observable<T>): AsyncGenerator<T[], void, unknown>
  export function latestValueFrom<T>(source: Observable<T>): AsyncGenerator<T, void, unknown>
  export function nextValueFrom<T>(source: Observable<T>): AsyncGenerator<T, void, unknown>
}
