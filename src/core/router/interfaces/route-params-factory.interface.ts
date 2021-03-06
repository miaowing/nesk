import { RouteParamtypes } from '@neskjs/common/enums/route-paramtypes.enum';

export interface IRouteParamsFactory {
  exchangeKeyForValue(key: RouteParamtypes | string, data, { ctx, next });
}
