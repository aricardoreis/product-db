import {
  ExecutionContext,
  NotAcceptableException,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

export type SortingParam = {
  field: string;
  order: string;
};

export const SortingParams = createParamDecorator(
  (validParams, ctx: ExecutionContext): SortingParam => {
    const req: Request = ctx.switchToHttp().getRequest();
    const sort = req.query.sort as string;
    if (!sort) return null;

    // check if the valid params sent is an array
    if (typeof validParams != 'object')
      throw new NotAcceptableException('Invalid sort parameter');

    // check the format of the sort query param
    const sortPattern = /^([a-zA-Z0-9]+):(asc|desc)$/;
    if (!sort.match(sortPattern))
      throw new NotAcceptableException('Invalid sort order, allowed(asc|desc)');

    // extract the field name and order and check if they are valid
    const [field, order] = sort.split(':');
    if (!validParams.includes(field))
      throw new NotAcceptableException(
        `Invalid sort field: ${field}, allowed: [${validParams}]`,
      );

    return { field, order };
  },
);
