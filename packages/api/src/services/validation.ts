/* eslint-disable @typescript-eslint/no-explicit-any */

import type { FastifyRouteSchemaDef } from 'fastify/types/schema';

export function validatorCompiler({ schema }: FastifyRouteSchemaDef<any>) {
  return (data: any) => schema.validate(data);
}
