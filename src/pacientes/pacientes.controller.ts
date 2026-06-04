// Controller é responsável por receber as requisições HTTP, e chamar os métodos do Service, definir rotas (URLs) e os métodos HTTP
import {
  Controller, //Decorador que define o prefixo das rotas = @Controller('pacientes') -> todas as rotas começam com /pacientes
  Get, // Decorador para get -> @Get() -> rota GET /pacientes, @Get(':id') -> rota GET /pacientes/:id
  Post, // Decorador para post -> @Post() -> rota POST /pacientes
  Patch, // Decorador para patch -> @Patch(':id') -> rota PATCH /pacientes/:id
  Delete, // Decorador para delete -> @Delete(':id') -> rota DELETE /pacientes/:id
  Body, // Decorador de parâmetro. @Body() -> extrai o JSON do corpo da requisição e entrega como objeto
  Param, // Decorador de parâmetro. @Param('id') -> extrai o valor do parâmetro :id da URL e entrega como string
} from '@nestjs/common';

import { PacientesService } from './pacientes.service';
import { CriarPacienteDto } from './dto/criar-paciente.dto';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly service: PacientesService) {}

  // POST
  @Post()
  criar(@Body() dto: CriarPacienteDto) {
    return this.service.criar(dto);
  }

  // GET
  @Get()
  listarTodos() {
    return this.service.listarTodos();
  }

  // GET /pacientes/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  // PATCH /pacientes/:id
  // Patch para atualizar parcialmente. Put substitui o recurso inteiro
  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dados: Partial<CriarPacienteDto>) {
    return this.service.atualizar(id, dados);
  }

  // DELETE / pacientes/:id
  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.service.excluirPaciente(id);
  }
}
