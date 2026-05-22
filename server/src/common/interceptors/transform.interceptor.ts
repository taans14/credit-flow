import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // WHY: Normalize all successful responses into a consistent envelope
    // `{ success, message, data }` so frontends and clients can rely on a
    // predictable shape. Handlers may return either a value or an object with
    // `{ message, data }`; the interceptor keeps wiring consistent without
    // forcing every controller to duplicate envelope logic.
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: data?.message || 'Request successful',
        data: data?.data ?? data,
      })),
    );
  }
}
