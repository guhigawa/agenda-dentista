import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CalendarService } from './calendar/calendar.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  //Teste temporario
  const calendar = app.get(CalendarService);
  // Teste 1 — verificar inicialização
  console.log('Testando Calendar...');

  // Teste 2 — listar eventos de hoje
  const hoje = new Date().toISOString().split('T')[0]; // "2026-06-10"
  const eventos = await calendar.listarEventosDoDia(hoje);
  console.log(`Eventos hoje (${hoje}):`, eventos.length);

  // Teste 3 — verificar horários disponíveis
  const disponiveis = await calendar.verificarDisponibilidade(hoje);
  console.log('Horários disponíveis:', disponiveis);

  // Teste 4 — criar evento de teste
  const eventId = await calendar.criarEvento({
    titulo: 'TESTE — Consulta João Silva',
    dataInicio: `${hoje}T16:00:00-03:00`,
    dataFim: `${hoje}T17:00:00-03:00`,
    descricao: 'Evento de teste — pode deletar',
  });
  console.log('Evento criado com ID:', eventId);

  // Teste 5 — tentar criar no mesmo horário (deve lançar 409)
  try {
    await calendar.criarEvento({
      titulo: 'TESTE — Duplicado',
      dataInicio: `${hoje}T16:00:00-03:00`,
      dataFim: `${hoje}T17:00:00-03:00`,
    });
  } catch (erro) {
    if (erro instanceof Error) {
      console.log('Conflito detectado corretamente:', erro.message);
    }
  }

  // Teste 6 — cancelar o evento criado
  await calendar.cancelarEvento(eventId);
  console.log('Evento cancelado:', eventId);

  await app.listen(3000);
}
bootstrap();
