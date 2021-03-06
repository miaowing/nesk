import { Interceptor, NeskInterceptor, ExecutionContext } from '@neskjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

@Interceptor()
export class LoggingInterceptor implements NeskInterceptor {
  intercept(
    dataOrRequest,
    context: ExecutionContext,
    stream$: Observable<any>,
  ): Observable<any> {
    console.log('Before...');
    const now = Date.now();

    return stream$.do(() => console.log(`After... ${Date.now() - now}ms`));
  }
}
