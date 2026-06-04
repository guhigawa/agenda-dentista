import { Module } from '@nestjs/common';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';

// Como definimos o FirebaseModule como global, não precisamos importá-lo aqui, ele já estará disponível para injeção em PacientesService
@Module({
  controllers: [PacientesController],
  providers: [PacientesService],
})
export class PacientesModule {}
