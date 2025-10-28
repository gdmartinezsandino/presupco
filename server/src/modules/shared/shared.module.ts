import { Module } from '@nestjs/common';

import * as fromServices from '@shared/services';
import * as fromComponents from '@shared/controllers';

const _providers = Array.isArray(fromServices.services)
  ? fromServices.services
  : [];
const _controllers = Array.isArray(fromComponents.controllers)
  ? fromComponents.controllers
  : [];

@Module({
  imports: [],
  providers: _providers,
  exports: _providers,
  controllers: _controllers,
})
export class SharedModule {}
