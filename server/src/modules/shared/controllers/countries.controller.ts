import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { ApiTags } from '@nestjs/swagger';
import { join } from 'path';

import { Public } from '@common/decorators';

@Controller('countries')
@ApiTags('countries')
export class CountriesController {
  @Public()
  @Get()
  getCountries() {
    const exist = existsSync(
      join(process.cwd(), 'src/modules/shared/data/', `countries.json`),
    );
    if (exist) {
      return readFileSync(
        join(process.cwd(), 'src/modules/shared//data/countries.json'),
        { encoding: 'utf8' },
      );
    } else {
      throw new HttpException('Countries not found', HttpStatus.NOT_FOUND);
    }
  }

  @Public()
  @Get(':country')
  getCitiesByCountry(@Param('country') country: string) {
    const exist = existsSync(
      join(process.cwd(), 'src/modules/shared/data/cities/', `${country}.json`),
    );
    if (exist) {
      return readFileSync(
        join(process.cwd(), `src/modules/shared/data/cities/${country}.json`),
        { encoding: 'utf8' },
      );
    } else {
      throw new HttpException('Country not found', HttpStatus.NOT_FOUND);
    }
  }
}
