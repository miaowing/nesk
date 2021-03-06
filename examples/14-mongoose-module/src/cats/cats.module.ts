import { Module } from '@neskjs/common';
import { MongooseModule } from '@neskjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CatSchema } from './schemas/cat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Cat', schema: CatSchema }])],
  controllers: [CatsController],
  components: [CatsService],
})
export class CatsModule {}
